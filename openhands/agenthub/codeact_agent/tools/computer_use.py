from litellm import ChatCompletionToolParam, ChatCompletionToolParamFunctionChunk

from openhands.agenthub.codeact_agent.tools.security_utils import (
    RISK_LEVELS,
    SECURITY_RISK_DESC,
)
from openhands.llm.tool_names import COMPUTER_USE_TOOL_NAME

_COMPUTER_USE_DESCRIPTION = """Use this tool to control the desktop GUI of the sandbox VM: take screenshots, move the mouse, click, scroll, and type. The desktop is a real Linux environment, so you can run GUI applications (including the browser) through this tool.

Always take a `screenshot` first to see the current state of the screen before performing actions that depend on the layout. The screenshot shows the top-left corner of the screen at coordinate (0, 0); x increases to the right and y increases downward.

Actions:
screenshot: Take a screenshot of the screen.
mouse_move: Move the cursor to a specified coordinate. Requires `coordinate`.
left_mouse_down: Press and hold the left mouse button at the current position.
left_mouse_up: Release the left mouse button.
left_click: Click the left mouse button at a coordinate. Takes `coordinate` (optional; defaults to the current position).
left_click_drag: Drag the left mouse button from `start_coordinate` to `coordinate`.
right_click: Right-click at a coordinate. Takes `coordinate` (optional).
middle_click: Middle-click at a coordinate. Takes `coordinate` (optional).
double_click: Double-click at a coordinate. Takes `coordinate` (optional).
triple_click: Triple-click at a coordinate. Takes `coordinate` (optional).
scroll: Scroll the screen. Takes `scroll_direction` (up/down/left/right) and `scroll_amount` (number of ticks; optional, defaults to 1). Optionally takes `coordinate` to scroll at a position.
wait: Wait for `duration` seconds (0-100) and take a fresh screenshot observation.
type: Type a string of text. Takes `text`.
key: Press a key or key combination after focusing. Takes `text` for the key or key combination (e.g. "Return", "ctrl+a", "alt+Tab", "F5").
hold_key: Hold down a key for `duration` seconds (0-100). Takes `text` and `duration`.
cursor_position: Get the current (x, y) pixel coordinate of the cursor.

This tool is for GUI interactions only. For shell commands, file operations, and code execution use the other tools instead."""

ComputerUseTool = ChatCompletionToolParam(
    type='function',
    function=ChatCompletionToolParamFunctionChunk(
        name=COMPUTER_USE_TOOL_NAME,
        description=_COMPUTER_USE_DESCRIPTION,
        parameters={
            'type': 'object',
            'properties': {
                'action': {
                    'type': 'string',
                    'enum': [
                        'screenshot',
                        'mouse_move',
                        'left_mouse_down',
                        'left_mouse_up',
                        'left_click',
                        'left_click_drag',
                        'right_click',
                        'middle_click',
                        'double_click',
                        'triple_click',
                        'scroll',
                        'wait',
                        'type',
                        'key',
                        'hold_key',
                        'cursor_position',
                    ],
                    'description': 'The computer use action to perform.',
                },
                'coordinate': {
                    'type': 'array',
                    'prefixItems': [
                        {'type': 'integer', 'name': 'x'},
                        {'type': 'integer', 'name': 'y'},
                    ],
                    'description': (
                        'The (x, y) pixel coordinate to act on. '
                        'Required for mouse_move; optional for click actions; '
                        'the drag end position for left_click_drag.'
                    ),
                },
                'start_coordinate': {
                    'type': 'array',
                    'prefixItems': [
                        {'type': 'integer', 'name': 'x'},
                        {'type': 'integer', 'name': 'y'},
                    ],
                    'description': 'The (x, y) pixel coordinate the drag starts from (left_click_drag only).',
                },
                'text': {
                    'type': 'string',
                    'description': (
                        'Text to type (type), the key or key combination to press (key, hold_key), '
                        'e.g. "Return", "ctrl+s".'
                    ),
                },
                'scroll_direction': {
                    'type': 'string',
                    'enum': ['up', 'down', 'left', 'right'],
                    'description': 'The direction to scroll (scroll only).',
                },
                'scroll_amount': {
                    'type': 'integer',
                    'description': 'The number of scroll ticks (scroll only; defaults to 1).',
                },
                'duration': {
                    'type': 'number',
                    'description': 'Duration in seconds (wait/hold_key only, 0-100).',
                },
                'security_risk': {
                    'type': 'string',
                    'description': SECURITY_RISK_DESC,
                    'enum': RISK_LEVELS,
                },
            },
            'required': ['action', 'security_risk'],
        },
    ),
)