import simpy, logging
from ..messages import RequestReplyMessage, TransmissionRequestMessage


class Gateway:
    def __init__(self, env: simpy.Environment, data_channels: int, data_slots_per_channel: int):
        self._env = env
        self._rrm = RequestReplyMessage(self._env.now, data_channels, data_slots_per_channel)

        self._rrm_message_event = simpy.Event(env)
        self._transmission_request_messages = simpy.Store(env)
        self._logger = logging.getLogger(self.__class__.__name__)

        self._env.process(self.run())

    def run(self):
        while True:
            # Send RRM
            self._rrm.start_time = self._env.now
            yield from self._rrm.send_message(self._env, self._logger)

            self._rrm_message_event.succeed(self._rrm)
            self._rrm_message_event = simpy.Event(self._env)

            # Listen on transmission request messages for 0.5s
            yield simpy.Timeout(self._env, 0.5)

            sensor_messages = []
            while len(self._transmission_request_messages.items):
                sensor_message = yield self._transmission_request_messages.get()
                sensor_messages.append(sensor_message)
                self._logger.info(
                    f"Time {self._env.now:.2f}: Received transmission request message from Sensor {sensor_messages[-1].sensor_id}"
                )

            for state, idxs in Gateway._get_request_slots_status(sensor_messages).items():
                for idx in idxs:
                    self._rrm.request_slots[idx].state = state

            self._rrm.update_ftr()

    def rrm_message_event(self) -> simpy.Event:
        return self._rrm_message_event

    @property
    def transmission_request_messages(self) -> simpy.Store:
        return self._transmission_request_messages

    @staticmethod
    def _get_request_slots_status(messages: list[TransmissionRequestMessage]) -> dict:
        slot_counts = {}

        # Count the occurrences of each chosen_request_slot
        for message in messages:
            slot = message.chosen_request_slot
            slot_counts[slot] = slot_counts.get(slot, 0) + 1

        # Find slots that have been picked more than once
        return {
            "no_collision": [slot for slot, count in slot_counts.items() if count == 1],
            "collision_occurred": [slot for slot, count in slot_counts.items() if count > 1],
        }