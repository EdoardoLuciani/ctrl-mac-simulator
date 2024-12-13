from typing import Sequence


class StatTracker:
    def __init__(self):
        self.ftr_tracker = []
        self.measurement_latency_tracker = []

    def append_ftr(self, ftr):
        self.ftr_tracker.append(ftr)

    def append_measurement_latency(self, ftr):
        self.measurement_latency_tracker.append(ftr)

    @property
    def ftr_values(self) -> Sequence[int]:
        return self.ftr_tracker

    @property
    def measurement_latencies(self) -> Sequence[float]:
        return self.measurement_latency_tracker
