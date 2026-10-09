from dataclasses import dataclass, field

from openhands.core.schema import ObservationType
from openhands.events.observation.observation import Observation


@dataclass
class ComputerUseObservation(Observation):
    """This data class represents the result of a computer use action on the sandbox VM desktop."""

    computer_action: str = ''
    screenshot: str = field(repr=False, default='')  # base64 PNG data URL
    error: bool = False
    observation: str = ObservationType.COMPUTER_USE

    @property
    def message(self) -> str:
        return f'Computer use action: {self.computer_action}'

    def __str__(self) -> str:
        ret = (
            '**ComputerUseObservation**\n'
            f'Action: {self.computer_action}\n'
            f'Error: {self.error}\n'
        )
        if self.screenshot:
            ret += 'Screenshot captured.\n'
        ret += '--- Agent Observation ---\n'
        ret += self.content
        return ret