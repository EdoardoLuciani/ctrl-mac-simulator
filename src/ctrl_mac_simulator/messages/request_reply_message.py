import math, json, random
from typing import TypedDict, Literal, Optional
from dataclasses import dataclass

from ctrl_mac_simulator.messages.abstract_message import AbstractMessage


@dataclass
class RequestSlot:
    state: Literal["free", "no_contention", "contention_occurred"]
    data_channel: int
    data_slot: float


class RequestReplyMessage(AbstractMessage):
    def __init__(self, start_time: float, data_channels: int, data_slot_time_offset: float, request_slots: int):
        self.request_slots = []
        channel = 0
        slot = 0
        for i in range(request_slots):
            self.request_slots.append(RequestSlot("free", channel, slot))
            channel += 1
            if channel >= data_channels:
                channel = 0
                slot += data_slot_time_offset

        self.ftr = 0
        self.old_ftr = 0
        self.old_contentions = 0

        self._start_time = start_time
        self._contentions = 0

    @property
    def start_time(self) -> float:
        return self._start_time

    @start_time.setter
    def start_time(self, start_time: float) -> None:
        self._start_time = start_time
        self._arrive_time = start_time + self.get_airtime()

    def get_message_len(self) -> int:
        # 2 bits for the state, 4 bits for the data_slot, 2 bits for the data_channel
        # 4 bits for the ftr
        return math.ceil(((2 + 4 + 2) * len(self.request_slots) + 4) / 8)

    def sample_free_request_slot(self) -> Optional[int]:
        free_slot_indices = [
            index for index, slot in enumerate(self.request_slots)
            if slot.state == "free"
        ]
        return random.choice(free_slot_indices) if free_slot_indices else None

    def update_ftr(self) -> None:
        self.ftr = max(0, self.old_ftr + self.old_contentions - 1)
        self.old_ftr, self.old_contentions = self.ftr, self.total_contentions()

    def total_contentions(self, before_slot: int | None = None) -> int:
            end_slot = before_slot if before_slot is not None else len(self.request_slots)
            return sum(1 for slot in self.request_slots[:end_slot] if slot.state == "contention_occurred")
