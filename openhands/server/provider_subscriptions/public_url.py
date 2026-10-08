"""Build deployment URLs from the incoming request.

Login links stay relative so a browser keeps the host it already used.
Absolute URLs, when a caller needs one, come from ``PUBLIC_BASE_URL`` or
forwarded headers, then the request itself. Nothing here rewrites the host
to localhost or a fixed vendor domain.
"""

from __future__ import annotations

import os
from urllib.parse import urlsplit

from fastapi import Request

DEFAULT_RETURN_PATH = '/settings/providers'


def _first_header(value: str | None) -> str | None:
    if not value:
        return None
    first = value.split(',')[0].strip()
    return first or None


def public_base_url(request: Request) -> str:
    """Return the origin browsers should use for this deployment."""
    configured = os.environ.get('PUBLIC_BASE_URL', '').strip()
    if configured:
        if '://' not in configured:
            configured = f'https://{configured}'
        parts = urlsplit(configured)
        if parts.scheme in {'http', 'https'} and parts.netloc:
            return f'{parts.scheme}://{parts.netloc}'

    proto = _first_header(request.headers.get('x-forwarded-proto'))
    host = _first_header(request.headers.get('x-forwarded-host'))
    if host is None:
        host = _first_header(request.headers.get('host'))
    if not proto:
        proto = request.url.scheme
    if not host:
        host = request.url.netloc
    return f'{proto}://{host}'


def safe_return_path(value: str | None) -> str:
    """Keep post-login navigation on this app.

    Only same-origin paths are accepted. Absolute URLs and protocol-relative
    URLs are dropped so a crafted link cannot send the browser elsewhere.
    """
    if not value:
        return DEFAULT_RETURN_PATH
    candidate = value.strip()
    if not candidate.startswith('/'):
        return DEFAULT_RETURN_PATH
    if candidate.startswith('//') or candidate.startswith('/\\'):
        return DEFAULT_RETURN_PATH
    if '\\' in candidate or '://' in candidate:
        return DEFAULT_RETURN_PATH
    return candidate
