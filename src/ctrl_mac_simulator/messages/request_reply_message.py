from typing import TypedDict, Literal
from dataclasses import dataclass


@dataclass
class _RequestSlot:
    state: Literal["free", "no_collision", "collision_occurred"]
    data_slot: int
    data_channel: int


class RequestReplyMessage:
    def __init__(self, request_slots: int = 5):
        self.message = [_RequestSlot("free", 0, 0) for i in range(request_slots)]

    def __repr__(self) -> str:
        return str(self.message)
