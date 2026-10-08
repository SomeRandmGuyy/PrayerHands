"""Provider subscription catalog and sign-in URL behavior."""

import json
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from openhands.server.app import app
from openhands.server.provider_subscriptions.catalog import PROVIDERS
from openhands.server.provider_subscriptions.store import (
    LOGIN_TTL,
    ProviderSubscriptionStore,
)
from openhands.server.routes.provider_subscriptions import get_store
from openhands.storage.memory import InMemoryFileStore

WESTERN = {
    'openai',
    'anthropic',
    'google',
    'xai',
    'microsoft',
    'amazon',
    'meta',
    'mistral',
    'cohere',
    'perplexity',
    'groq',
    'together',
    'fireworks',
    'ai21',
    'nvidia',
    'databricks',
    'ibm',
    'aleph_alpha',
}
CHINESE = {
    'deepseek',
    'alibaba',
    'zhipu',
    'moonshot',
    'baidu',
    'bytedance',
    'tencent',
    'minimax',
    'iflytek',
    'stepfun',
    'baichuan',
    'yi',
    'sensetime',
    'siliconflow',
    'huawei',
    'skywork',
}


@pytest.fixture
def memory_store():
    return ProviderSubscriptionStore(InMemoryFileStore())


@pytest.fixture
def client(memory_store):
    app.dependency_overrides[get_store] = lambda: memory_store
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.pop(get_store, None)


def test_catalog_covers_western_and_chinese_plans():
    ids = {provider.id for provider in PROVIDERS}
    assert WESTERN <= ids
    assert CHINESE <= ids
    assert ids == {provider.id for provider in PROVIDERS}
    regions = {provider.region for provider in PROVIDERS}
    assert regions == {'western', 'chinese'}
    for provider in PROVIDERS:
        assert provider.plans
        plan_ids = [plan.id for plan in provider.plans]
        assert len(plan_ids) == len(set(plan_ids))
        for plan in provider.plans:
            assert '://' not in plan.id
            assert plan.billing in {'free', 'subscription', 'usage', 'contract'}


def test_login_paths_stay_on_the_current_host(client):
    response = client.get('/api/provider-subscriptions')
    assert response.status_code == 200
    providers = response.json()['providers']
    assert len(providers) == len(PROVIDERS)
    for provider in providers:
        for plan in provider['plans']:
            path = plan['login_path']
            assert path.startswith('/api/provider-subscriptions/')
            assert '://' not in path
            assert 'localhost' not in path
            assert 'all-hands.dev' not in path


def test_login_redirect_is_relative_even_behind_a_forwarded_host(client):
    response = client.get(
        '/api/provider-subscriptions/moonshot/login',
        params={'plan': 'membership', 'return_to': 'https://evil.example/phish'},
        headers={
            'X-Forwarded-Proto': 'https',
            'X-Forwarded-Host': 'hands.example.com',
        },
        follow_redirects=False,
    )
    assert response.status_code == 302
    location = response.headers['location']
    assert location.startswith('/provider-login?state=')
    assert '://' not in location
    assert 'evil.example' not in location
    assert 'hands.example.com' not in location

    state = location.split('state=', 1)[1]
    session = client.get(
        f'/api/provider-subscriptions/sessions/{state}',
        headers={
            'X-Forwarded-Proto': 'https',
            'X-Forwarded-Host': 'hands.example.com',
        },
    )
    assert session.status_code == 200
    body = session.json()
    assert body['public_base_url'] == 'https://hands.example.com'
    assert (
        body['login_url'] == f'https://hands.example.com/provider-login?state={state}'
    )
    assert body['return_to'] == '/settings/providers'
    assert body['plan_id'] == 'membership'
    assert 'localhost' not in body['login_url']


def test_public_base_url_env_overrides_forwarded_host(client, monkeypatch):
    started = client.get(
        '/api/provider-subscriptions/openai/login',
        params={'plan': 'plus', 'return_to': '/settings/providers'},
        follow_redirects=False,
    )
    state = started.headers['location'].split('state=', 1)[1]
    monkeypatch.setenv('PUBLIC_BASE_URL', 'https://vps.internal:8443')
    session = client.get(
        f'/api/provider-subscriptions/sessions/{state}',
        headers={
            'X-Forwarded-Proto': 'http',
            'X-Forwarded-Host': 'localhost:3000',
        },
    )
    assert session.status_code == 200
    assert session.json()['public_base_url'] == 'https://vps.internal:8443'
    assert session.json()['login_url'].startswith(
        'https://vps.internal:8443/provider-login?'
    )


def test_complete_login_then_disconnect(client):
    started = client.get(
        '/api/provider-subscriptions/deepseek/login',
        params={'plan': 'api', 'return_to': '/settings/providers?signed_in=1'},
        follow_redirects=False,
    )
    state = started.headers['location'].split('state=', 1)[1]
    completed = client.post(
        f'/api/provider-subscriptions/sessions/{state}/complete',
        json={'account_name': '  ada@example.com  '},
    )
    assert completed.status_code == 200
    payload = completed.json()
    assert payload['account_name'] == 'ada@example.com'
    assert payload['return_to'] == '/settings/providers?signed_in=1'
    assert payload['connection']['status'] == 'active'
    assert payload['connection']['plan_name'] == 'DeepSeek API'

    listed = client.get('/api/provider-subscriptions')
    deepseek = next(
        item for item in listed.json()['providers'] if item['id'] == 'deepseek'
    )
    assert deepseek['connection']['account_name'] == 'ada@example.com'
    assert deepseek['connection']['plan_id'] == 'api'

    again = client.post(
        f'/api/provider-subscriptions/sessions/{state}/complete',
        json={'account_name': 'ada@example.com'},
    )
    assert again.status_code == 404

    disconnected = client.post('/api/provider-subscriptions/deepseek/disconnect')
    assert disconnected.status_code == 200
    listed = client.get('/api/provider-subscriptions')
    deepseek = next(
        item for item in listed.json()['providers'] if item['id'] == 'deepseek'
    )
    assert deepseek['connection'] is None


def test_unknown_plan_and_blank_account_are_rejected(client):
    missing = client.get(
        '/api/provider-subscriptions/openai/login',
        params={'plan': 'not-a-plan'},
        follow_redirects=False,
    )
    assert missing.status_code == 404

    started = client.get(
        '/api/provider-subscriptions/openai/login',
        params={'plan': 'plus'},
        follow_redirects=False,
    )
    state = started.headers['location'].split('state=', 1)[1]
    blank = client.post(
        f'/api/provider-subscriptions/sessions/{state}/complete',
        json={'account_name': '   '},
    )
    assert blank.status_code == 422


def test_expired_login_is_rejected(client, memory_store):
    memory_store.start_login('old-token', 'openai', 'plus', '/settings/providers')
    data_path = 'provider-subscriptions/state.json'
    raw = memory_store.file_store.read(data_path)
    data = json.loads(raw)
    stale = datetime.now(timezone.utc) - LOGIN_TTL - timedelta(minutes=1)
    data['pending']['old-token']['created_at'] = stale.isoformat()
    memory_store.file_store.write(data_path, json.dumps(data))

    expired = client.get('/api/provider-subscriptions/sessions/old-token')
    assert expired.status_code == 404
