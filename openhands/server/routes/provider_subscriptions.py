"""HTTP API for provider subscription sign-in."""

from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, field_validator

from openhands.server.dependencies import get_dependencies
from openhands.server.provider_subscriptions.catalog import (
    PROVIDERS,
    get_plan,
    get_provider,
    plan_login_path,
)
from openhands.server.provider_subscriptions.public_url import (
    public_base_url,
    safe_return_path,
)
from openhands.server.provider_subscriptions.store import ProviderSubscriptionStore
from openhands.server.shared import file_store
from openhands.utils.async_utils import call_sync_from_async

app = APIRouter(prefix='/api/provider-subscriptions', dependencies=get_dependencies())


def get_store() -> ProviderSubscriptionStore:
    return ProviderSubscriptionStore(file_store)


class CompleteLoginBody(BaseModel):
    account_name: str

    @field_validator('account_name')
    @classmethod
    def account_name_required(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError('Account name is required')
        if len(cleaned) > 120:
            raise ValueError('Account name is too long')
        return cleaned


def _provider_payload(provider, connection: dict | None) -> dict:
    return {
        'id': provider.id,
        'name': provider.name,
        'company': provider.company,
        'region': provider.region,
        'plans': [
            {
                'id': plan.id,
                'name': plan.name,
                'billing': plan.billing,
                'billing_label': plan.billing_label,
                'description': plan.description,
                'login_path': plan_login_path(provider.id, plan.id),
            }
            for plan in provider.plans
        ],
        'connection': connection,
    }


def _session_payload(request: Request, token: str, pending: dict) -> dict:
    provider = get_provider(pending['provider_id'])
    plan = get_plan(provider, pending['plan_id']) if provider else None
    if provider is None or plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    base = public_base_url(request)
    login_path = f'/provider-login?state={token}'
    return {
        'state': token,
        'provider_id': provider.id,
        'provider_name': provider.name,
        'company': provider.company,
        'region': provider.region,
        'plan_id': plan.id,
        'plan_name': plan.name,
        'plan_description': plan.description,
        'billing': plan.billing,
        'billing_label': plan.billing_label,
        'return_to': safe_return_path(pending.get('return_to')),
        'public_base_url': base,
        'login_path': login_path,
        'login_url': f'{base}{login_path}',
    }


@app.get('')
async def list_provider_subscriptions(
    store: ProviderSubscriptionStore = Depends(get_store),
) -> dict:
    connections = await call_sync_from_async(store.connections)
    providers = [
        _provider_payload(provider, connections.get(provider.id))
        for provider in PROVIDERS
    ]
    return {'providers': providers}


@app.get('/{provider_id}/login')
async def start_provider_login(
    provider_id: str,
    plan: str,
    return_to: str | None = None,
    store: ProviderSubscriptionStore = Depends(get_store),
) -> RedirectResponse:
    provider = get_provider(provider_id)
    selected = get_plan(provider, plan) if provider else None
    if provider is None or selected is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    token = secrets.token_urlsafe(32)
    destination = safe_return_path(return_to)
    await call_sync_from_async(
        store.start_login, token, provider.id, selected.id, destination
    )
    # Relative Location so the browser stays on the host that started sign-in.
    return RedirectResponse(
        url=f'/provider-login?state={token}',
        status_code=status.HTTP_302_FOUND,
    )


@app.get('/sessions/{state}')
async def read_provider_login(
    state: str,
    request: Request,
    store: ProviderSubscriptionStore = Depends(get_store),
) -> dict:
    pending = await call_sync_from_async(store.get_login, state)
    if pending is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return _session_payload(request, state, pending)


@app.post('/sessions/{state}/complete')
async def complete_provider_login(
    state: str,
    body: CompleteLoginBody,
    store: ProviderSubscriptionStore = Depends(get_store),
) -> dict:
    pending = await call_sync_from_async(store.get_login, state)
    if pending is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    provider = get_provider(pending['provider_id'])
    plan = get_plan(provider, pending['plan_id']) if provider else None
    if provider is None or plan is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    result = await call_sync_from_async(
        store.complete_login, state, body.account_name, plan.name
    )
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {
        'provider_id': provider.id,
        'plan_id': plan.id,
        'plan_name': plan.name,
        'account_name': body.account_name,
        'return_to': safe_return_path(result.get('return_to')),
        'connection': result['connection'],
    }


@app.post('/{provider_id}/disconnect')
async def disconnect_provider(
    provider_id: str,
    store: ProviderSubscriptionStore = Depends(get_store),
) -> dict:
    if get_provider(provider_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    await call_sync_from_async(store.disconnect, provider_id)
    return {'disconnected': True}
