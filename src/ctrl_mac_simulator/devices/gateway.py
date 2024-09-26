import simpy, logging
from ..messages import RequestReplyMessage, TransmissionRequestMessage


class Gateway:
    def __init__(self, env: simpy.Environment, data_channels: int, data_slots_per_channel: int):
        self.env = env
        self.data_channels = data_channels
        self.data_slots_per_channel = data_slots_per_channel

        self.rrm_message_event = simpy.Event(env)
        self.transmission_request_messages = simpy.Store(env)
        self.logger = logging.getLogger(self.__class__.__name__)

        self.env.process(self.run())

    def run(self):
        while True:
            # Send RRM
            rrm = RequestReplyMessage(self.env.now, self.data_channels, self.data_slots_per_channel)
            yield self.env.process(rrm.send_message(self.env, self.logger))

            self.rrm_message_event.succeed(rrm)
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

            self.logger.info(f"Collision status {Gateway._get_duplicate_request_slots(sensor_messages)}")

    def get_rrm_message_event(self):
        return self.rrm_message_event

    def get_transmission_request_messages_queue(self):
        return self.transmission_request_messages

    @staticmethod
    def _get_duplicate_request_slots(messages: list[TransmissionRequestMessage]) -> list[int]:
        slot_counts = {}

        # Count the occurrences of each chosen_request_slot
        for message in messages:
            slot = message.chosen_request_slot
            slot_counts[slot] = slot_counts.get(slot, 0) + 1

        # Find slots that have been picked more than once
        return [slot for slot, count in slot_counts.items() if count > 1]

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
