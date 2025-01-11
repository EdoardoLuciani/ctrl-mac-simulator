from simulation.stat_tracker import StatTracker
import simpy, logging, collections, math
from ..messages import RequestReplyMessage, TransmissionRequestMessage, SensorMeasurementMessage
from typing import Optional


class Gateway:
    def __init__(
        self,
        env: simpy.Environment,
        data_channels: int,
        request_slots: int,
        total_rrm_messages: int,
        sensor_data_payload_length: int,
        logger_handler: Optional[logging.Handler] = None,
        logger_level: Optional[int] = None,
        stat_tracker: Optional[StatTracker] = None,
    ):
        self._env = env
        self._total_rrm_messages = total_rrm_messages

        # Create a dummy sensor measurement message to get its airtime
        sample_airtime = SensorMeasurementMessage(0, 0, 0, sensor_data_payload_length).get_airtime();

        self._rrm = RequestReplyMessage(
            self._env.now, data_channels, sample_airtime, request_slots
        )
        self._rrm_period = math.ceil(request_slots / data_channels) * sample_airtime

        self._rrm_message_event = simpy.Event(env)
        self._transmission_request_messages = simpy.Store(env)
        self._sensor_data_messages = simpy.Store(env)

        self._logger = logging.getLogger(self.__class__.__name__)
        if logger_handler:
            self._logger.addHandler(logger_handler)
        if logger_level:
            self._logger.setLevel(logger_level)

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
        slot_counts = collections.defaultdict(int)

        # Count the occurrences of each chosen_request_slot
        for message in messages:
            slot_counts[message.chosen_request_slot] += 1

        # Find slots that have been picked more than once
        return {
            "no_contention": [slot for slot, count in slot_counts.items() if count == 1],
            "contention": [slot for slot, count in slot_counts.items() if count > 1],
        }
