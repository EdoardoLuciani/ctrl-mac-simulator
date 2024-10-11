from ctrl_mac_simulator.simulation.stat_tracker import StatTracker
import simpy, logging
from ..messages import RequestReplyMessage, TransmissionRequestMessage
from typing import Optional


class Gateway:
    def __init__(
        self,
        env: simpy.Environment,
        data_channels: int,
        data_slots_per_channel: int,
        request_slots: int,
        rrm_period: float,
        total_rrm_messages: int,
        stat_tracker: Optional[StatTracker] = None
    ):
        self._env = env
        self._rrm_period = rrm_period
        self._total_rrm_messages = total_rrm_messages

        if request_slots > data_channels * data_slots_per_channel:
            raise ValueError("Not enough data channels or data slots to fill all the rrm request slots")
        self._rrm = RequestReplyMessage(
            self._env.now, data_channels, rrm_period / data_slots_per_channel, request_slots
        )

        self._rrm_message_event = simpy.Event(env)
        self._transmission_request_messages = simpy.Store(env)
        self._sensor_data_messages = simpy.Store(env)
        self._logger = logging.getLogger(self.__class__.__name__)
        self._stat_tracker = stat_tracker

        self._env.process(self.run())

    def run(self):
        for _ in range(self._total_rrm_messages):
            # Send RRM
            self._rrm.start_time = self._env.now
            yield from self._rrm.send_message(self._env, self._logger)

            if self._stat_tracker:
                self._stat_tracker.append_ftr(self._rrm.ftr)

            self._rrm_message_event.succeed(self._rrm)
            self._rrm_message_event = simpy.Event(self._env)

            # Listen on transmission request messages for the specified period
            yield simpy.Timeout(self._env, self._rrm_period)

            # Reset the request slots status
            self._rrm.reset_slots_to_free()

            sensor_messages = []
            while len(self._transmission_request_messages.items):
                sensor_message = yield self._transmission_request_messages.get()
                sensor_messages.append(sensor_message)
                self._logger.info(
                    f"Time {self._env.now:.2f}: Received transmission request message from Sensor {sensor_messages[-1].sensor_id}"
                )

            # Update the slots based on the transmission request messages
            for state, idxs in Gateway._get_request_slots_status(sensor_messages).items():
                for idx in idxs:
                    self._rrm.request_slots[idx].state = state

            # Listen on data messages as well
            while len(self._sensor_data_messages.items):
                message = yield self._sensor_data_messages.get()
                self._logger.info(f"Time {self._env.now:.2f}: Received data message from Sensor {message.sensor_id}")

            self._rrm.update_ftr()

    def rrm_message_event(self) -> simpy.Event:
        return self._rrm_message_event

    @property
    def transmission_request_messages(self) -> simpy.Store:
        return self._transmission_request_messages

    @property
    def sensor_data_messages(self) -> simpy.Store:
        return self._sensor_data_messages

    @staticmethod
    def _get_request_slots_status(messages: list[TransmissionRequestMessage]) -> dict:
        slot_counts = {}

        # Count the occurrences of each chosen_request_slot
        for message in messages:
            slot = message.chosen_request_slot
            slot_counts[slot] = slot_counts.get(slot, 0) + 1

        # Find slots that have been picked more than once
        return {
            "no_contention": [slot for slot, count in slot_counts.items() if count == 1],
            "contention": [slot for slot, count in slot_counts.items() if count > 1],
        }

    @staticmethod
    def _find_messages_collisions(messages):
        n = len(messages)
        collisions = [False] * n
        # Sort intervals based on start time
        sorted_intervals = sorted(enumerate(messages), key=lambda x: x[1].start_time)
        for i in range(1, n):
            current_start, current_end = sorted_intervals[i][1].start_time, sorted_intervals[i][1].arrive_time
            prev_index = sorted_intervals[i - 1][0]
            prev_start, prev_end = sorted_intervals[i - 1][1].start_time, sorted_intervals[i - 1][1].arrive_time
            if current_start < prev_end:
                collisions[sorted_intervals[i][0]] = True
                collisions[prev_index] = True
        return collisions
