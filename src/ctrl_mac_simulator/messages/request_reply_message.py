import math, json
from typing import TypedDict, Literal
from dataclasses import dataclass

from ctrl_mac_simulator.messages.abstract_message import AbstractMessage


@dataclass
class _RequestSlot:
    state: Literal["free", "no_collision", "collision_occurred"]
    data_slot: int
    data_channel: int


class RequestReplyMessage(AbstractMessage):
    def __init__(self, request_slots: int = 5):
        self.request_slots = [_RequestSlot("free", 0, 0) for i in range(request_slots)]
        self.ftr = 0

    def get_message_len(self) -> int:
        # 2 bits for the state, 4 bits for the data_slot, 2 bits for the data_channel
        # 4 bits for the ftr
        return math.ceil(((2 + 4 + 2) * len(self.request_slots) + 4) / 8)
