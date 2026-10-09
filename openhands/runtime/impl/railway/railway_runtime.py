"""This runtime connects to an action execution server running inside a Railway-hosted VM.

The VM (e.g. a linuxserver/webtop container deployed as a Railway service) boots the
OpenHands action execution server via its service start command, alongside the
pixelflux Computer Use API that powers GUI control of the VM's desktop. The VM is a
persistent, externally managed service: this runtime is a thin authenticated client
that forwards actions to it over HTTPS and never starts or stops it.
"""

from typing import Callable
from urllib.parse import urlparse

import tenacity
from tenacity import RetryCallState

from openhands.core.config import OpenHandsConfig
from openhands.core.exceptions import (
    AgentRuntimeNotReadyError,
    AgentRuntimeUnavailableError,
)
from openhands.core.logger import openhands_logger as logger
from openhands.events import EventStream
from openhands.integrations.provider import PROVIDER_TOKEN_TYPE
from openhands.llm.llm_registry import LLMRegistry
from openhands.runtime.impl.action_execution.action_execution_client import (
    ActionExecutionClient,
)
from openhands.runtime.plugins import PluginRequirement
from openhands.runtime.runtime_status import RuntimeStatus
from openhands.utils.async_utils import call_sync_from_async
from openhands.utils.tenacity_stop import stop_if_should_exit


class RailwayRuntime(ActionExecutionClient):
    """Runtime that executes actions on a persistent VM hosted on Railway.

    The agent's shell, file edits and code execution run inside the VM, and the
    `computer_use` action drives the VM's desktop GUI through the action execution
    server's pixelflux proxy.

    Required configuration (config.toml):
        runtime = "railway"
        [sandbox]
        railway_runtime_url = "https://<service>.up.railway.app"
        api_key = "<SESSION_API_KEY configured on the Railway service>"
    """

    def __init__(
        self,
        config: OpenHandsConfig,
        event_stream: EventStream,
        llm_registry: LLMRegistry,
        sid: str = 'default',
        plugins: list[PluginRequirement] | None = None,
        env_vars: dict[str, str] | None = None,
        status_callback: Callable[..., None] | None = None,
        attach_to_existing: bool = False,
        headless_mode: bool = True,
        user_id: str | None = None,
        git_provider_tokens: PROVIDER_TOKEN_TYPE | None = None,
    ) -> None:
        if config.sandbox.railway_runtime_url is None:
            raise ValueError(
                'railway_runtime_url is required to use the Railway runtime. '
                'Set it in the [sandbox] section of config.toml, or as the '
                'SANDBOX_RAILWAY_RUNTIME_URL environment variable.'
            )
        if config.sandbox.api_key is None:
            raise ValueError(
                'An API key is required to use the Railway runtime. Set sandbox.api_key '
                'to the SESSION_API_KEY configured on the Railway service.'
            )

        self.runtime_url = config.sandbox.railway_runtime_url.rstrip('/')
        self._session_api_key = config.sandbox.api_key

        if config.workspace_base is not None:
            logger.warning(
                'Setting workspace_base is not supported in the Railway runtime: '
                'the workspace lives inside the VM.'
            )

        super().__init__(
            config,
            event_stream,
            llm_registry,
            sid,
            plugins,
            env_vars,
            status_callback,
            attach_to_existing,
            headless_mode,
            user_id,
            git_provider_tokens,
        )
        self.session.headers.update({'X-Session-API-Key': self._session_api_key})

    def log(self, level: str, message: str, exc_info: bool | None = None) -> None:
        getattr(logger, level)(
            message,
            stacklevel=2,
            exc_info=exc_info,
            extra={'session_id': self.sid, 'runtime_url': self.runtime_url},
        )

    @property
    def session_api_key(self) -> str | None:
        return self._session_api_key

    @property
    def additional_agent_instructions(self) -> str:
        return (
            'You are running inside a persistent Linux desktop VM (XFCE) hosted on '
            'Railway. Use the `computer` tool to view and control the VM desktop: '
            'take a `screenshot` to see the screen, then click, type, scroll or press '
            'keys as needed. GUI applications on the VM (including the browser) can '
            'be driven this way. Shell commands and file edits run in this same VM, '
            'so files created on the command line appear on its desktop.'
        )

    @property
    def action_execution_server_url(self) -> str:
        return self.runtime_url

    @property
    def vscode_url(self) -> str | None:
        token = super().get_vscode_token()
        if not token:
            return None
        parsed = urlparse(self.runtime_url)
        vscode_url = (
            f'{parsed.scheme}://{parsed.netloc}/vscode'
            f'?tkn={token}&folder={self.config.workspace_mount_path_in_sandbox}'
        )
        self.log('debug', f'VSCode URL: {vscode_url}')
        return vscode_url

    async def connect(self) -> None:
        self.set_runtime_status(RuntimeStatus.STARTING_RUNTIME)
        self.log('info', f'Connecting to Railway VM runtime at {self.runtime_url}')
        try:
            await call_sync_from_async(self._wait_until_alive)
        except Exception:
            self.close()
            self.log('error', 'Failed to connect to Railway VM runtime', exc_info=True)
            raise
        await call_sync_from_async(self.setup_initial_env)
        self._runtime_initialized = True
        self.log('info', 'Connected to Railway VM runtime.')

    def _wait_until_alive(self) -> None:
        retry_decorator = tenacity.retry(
            stop=tenacity.stop_after_delay(
                self.config.sandbox.remote_runtime_init_timeout
            )
            | stop_if_should_exit()
            | self._stop_if_closed,
            reraise=True,
            retry=tenacity.retry_if_not_exception_type(AgentRuntimeUnavailableError),
            wait=tenacity.wait_fixed(2),
        )
        retry_decorator(self._wait_until_alive_impl)()

    def _wait_until_alive_impl(self) -> None:
        self.log('debug', f'Pinging action server: {self.runtime_url}/alive')
        try:
            self.check_if_alive()
        except Exception as e:
            raise AgentRuntimeNotReadyError(
                f'Railway VM action server is not responding yet: {e}'
            ) from e

    def _stop_if_closed(self, retry_state: RetryCallState) -> bool:
        return self._runtime_closed

    def close(self) -> None:
        # The Railway VM is a persistent service managed by Railway; leave it running
        # and only tear down the client-side resources.
        super().close()