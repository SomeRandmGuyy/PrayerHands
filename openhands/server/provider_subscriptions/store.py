"""Persist provider subscriptions and in-progress sign-ins."""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone

from openhands.storage.files import FileStore

STATE_PATH = 'provider-subscriptions/state.json'
LOGIN_TTL = timedelta(minutes=15)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _parse_time(value: str) -> datetime:
    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed


class ProviderSubscriptionStore:
    def __init__(self, file_store: FileStore) -> None:
        self.file_store = file_store

    def _load(self) -> dict:
        try:
            raw = self.file_store.read(STATE_PATH)
        except FileNotFoundError:
            return {'connections': {}, 'pending': {}}
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return {'connections': {}, 'pending': {}}
        if not isinstance(data, dict):
            return {'connections': {}, 'pending': {}}
        connections = data.get('connections')
        pending = data.get('pending')
        if not isinstance(connections, dict):
            connections = {}
        if not isinstance(pending, dict):
            pending = {}
        return {'connections': connections, 'pending': pending}

    def _save(self, data: dict) -> None:
        self.file_store.write(STATE_PATH, json.dumps(data))

    def _drop_expired(self, data: dict) -> bool:
        pending = data['pending']
        expired = []
        now = _now()
        for token, record in pending.items():
            created_at = record.get('created_at') if isinstance(record, dict) else None
            if not isinstance(created_at, str):
                expired.append(token)
                continue
            try:
                created = _parse_time(created_at)
            except ValueError:
                expired.append(token)
                continue
            if now - created > LOGIN_TTL:
                expired.append(token)
        for token in expired:
            pending.pop(token, None)
        return bool(expired)

    def connections(self) -> dict[str, dict]:
        data = self._load()
        if self._drop_expired(data):
            self._save(data)
        return data['connections']

    def connection_for(self, provider_id: str) -> dict | None:
        record = self.connections().get(provider_id)
        if isinstance(record, dict):
            return record
        return None

    def start_login(
        self,
        token: str,
        provider_id: str,
        plan_id: str,
        return_to: str,
    ) -> None:
        data = self._load()
        self._drop_expired(data)
        data['pending'][token] = {
            'provider_id': provider_id,
            'plan_id': plan_id,
            'return_to': return_to,
            'created_at': _now().isoformat(),
        }
        self._save(data)

    def get_login(self, token: str) -> dict | None:
        data = self._load()
        changed = self._drop_expired(data)
        record = data['pending'].get(token)
        if changed:
            self._save(data)
        if isinstance(record, dict):
            return record
        return None

    def complete_login(
        self, token: str, account_name: str, plan_name: str
    ) -> dict | None:
        data = self._load()
        self._drop_expired(data)
        pending = data['pending'].pop(token, None)
        if not isinstance(pending, dict):
            self._save(data)
            return None
        connected_at = _now().isoformat()
        connection = {
            'provider_id': pending['provider_id'],
            'plan_id': pending['plan_id'],
            'plan_name': plan_name,
            'account_name': account_name,
            'status': 'active',
            'connected_at': connected_at,
        }
        data['connections'][pending['provider_id']] = connection
        self._save(data)
        return {
            'connection': connection,
            'return_to': pending.get('return_to', '/settings/providers'),
        }

    def disconnect(self, provider_id: str) -> None:
        data = self._load()
        data['connections'].pop(provider_id, None)
        self._save(data)
