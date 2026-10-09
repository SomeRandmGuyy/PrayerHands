from dataclasses import dataclass
from typing import ClassVar

from openhands.core.schema import ActionType
from openhands.events.action.action import Action, ActionSecurityRisk

# Actions mirroring the Anthropic Computer Use tool specification, executed
# against the sandbox VM desktop (pixelflux POST /computer-use on the runtime host).
COMPUTER_USE_ACTIONS = (
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
)


@dataclass
class ComputerUseAction(Action):
    computer_action: str
    thought: str = ''
    action: str = ActionType.COMPUTER_USE
    runnable: ClassVar[bool] = True
    security_risk: ActionSecurityRisk = ActionSecurityRisk.UNKNOWN
    coordinate: list[int] | None = None
    start_coordinate: list[int] | None = None
    text: str | None = None
    scroll_direction: str | None = None
    scroll_amount: int | None = None
    duration: float | None = None

    @property
    def message(self) -> str:
        ret = f'I am controlling the computer: {self.computer_action}'
        if self.coordinate is not None:
            ret += f' at {self.coordinate}'
        if self.text:
            ret += f' with text {self.text!r}'
        return ret

    def __str__(self) -> str:
        ret = '**ComputerUseAction**\n'
        if self.thought:
            ret += f'THOUGHT: {self.thought}\n'
        ret += f'ACTION: {self.computer_action}'
        if self.start_coordinate is not None:
            ret += f'\nSTART_COORDINATE: {self.start_coordinate}'
        if self.coordinate is not None:
            ret += f'\nCOORDINATE: {self.coordinate}'
        if self.text is not None:
            ret += f'\nTEXT: {self.text}'
        if self.scroll_direction is not None:
            ret += f'\nSCROLL_DIRECTION: {self.scroll_direction}'
        if self.scroll_amount is not None:
            ret += f'\nSCROLL_AMOUNT: {self.scroll_amount}'
        if self.duration is not None:
            ret += f'\nDURATION: {self.duration}'
        return ret