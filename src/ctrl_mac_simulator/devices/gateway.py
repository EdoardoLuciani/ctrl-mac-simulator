import simpy, logging
from ..messages import RequestReplyMessage, TransmissionRequestMessage


class Gateway:
    def __init__(self, env: simpy.Environment, data_channels: int, data_slots_per_channel: int):
        self.env = env
        self.rrm = RequestReplyMessage(self.env.now, data_channels, data_slots_per_channel)

        self.rrm_message_event = simpy.Event(env)
        self.transmission_request_messages = simpy.Store(env)
        self.logger = logging.getLogger(self.__class__.__name__)

        self.env.process(self.run())

    def run(self):
        while True:
            # Send RRM
            self.rrm.start_time = self.env.now
            yield from self.rrm.send_message(self.env, self.logger)

            self.rrm_message_event.succeed(self.rrm)
            self.rrm_message_event = simpy.Event(self.env)

            # Listen on transmission request messages for 0.5s
            yield simpy.Timeout(self.env, 0.5)

            sensor_messages = []
            while len(self.transmission_request_messages.items):
                sensor_message = yield self.transmission_request_messages.get()
                sensor_messages.append(sensor_message)
                self.logger.info(
                    f"Time {self.env.now:.2f}: Received transmission request message from Sensor {sensor_messages[-1].sensor_id}"
                )

            for state, idxs in Gateway._get_request_slots_status(sensor_messages).items():
                for idx in idxs:
                    self.rrm.request_slots[idx].state = state

            self.rrm.update_ftr()

    def get_rrm_message_event(self):
        return self.rrm_message_event

    def get_transmission_request_messages_queue(self):
        return self.transmission_request_messages

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
            "collision_occurred": [slot for slot, count in slot_counts.items() if count > 1]
        }
