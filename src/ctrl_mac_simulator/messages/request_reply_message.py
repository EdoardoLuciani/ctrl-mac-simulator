import math, json, random
from typing import TypedDict, Literal
from dataclasses import dataclass

from ctrl_mac_simulator.messages.abstract_message import AbstractMessage


@dataclass
class RequestSlot:
    state: Literal["free", "no_contention", "contention_occurred"]
    data_channel: int
    data_slot: int


class RequestReplyMessage(AbstractMessage):
    def __init__(self, start_time: float, data_channels, data_slots_per_channel, request_slots: int = 5):
        if request_slots > data_channels * data_slots_per_channel:
            raise ValueError("Filled all channels")

        self.request_slots = []
        channel = 0
        slot = 0
        for i in range(request_slots):
            self.request_slots.append(RequestSlot("free", channel, slot))
            channel += 1
            if channel >= data_channels:
                channel = 0
                slot += 1

        self.ftr = 0
        self._start_time = start_time

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

    def sample_free_request_slot(self) -> int | None:
        free_slots = [slot for slot in self.request_slots if slot.state == "free"]
        if free_slots:
            return self.request_slots.index(random.choice(free_slots))
        return None

    def update_ftr(self) -> None:
        self.ftr += len([slot for slot in self.request_slots if slot.state == "contention_occurred"])
