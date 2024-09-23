import simpy, logging
from ..messages import RequestReplyMessage


class Gateway:
    def __init__(self, env):
        self.env: simpy.Environment = env
        self.rrm_message_event = simpy.Event(env)
        self.sensor_messages_queue = simpy.Store(env)
        self.logger = logging.getLogger(self.__class__.__name__)
        self.env.process(self.run())

    def run(self):
        while True:
            # Send RRM
            rrm = RequestReplyMessage(self.env.now)
            yield self.env.process(rrm.send_message(self.env, self.logger))

            self.rrm_message_event.succeed(rrm)
            self.rrm_message_event = simpy.Event(self.env)

            # Listen on sensor messages for 0.5s
            yield simpy.Timeout(self.env, 0.5)

            sensor_messages = []

            while len(self.sensor_messages_queue.items):
                sensor_message = yield self.sensor_messages_queue.get()
                sensor_messages.append(sensor_message)
                self.logger.info(
                    f"Time {self.env.now:.2f}: Received sensor message from Sensor {sensor_messages[-1].sensor_id}"
                )

            self.logger.info(f"Collision status {Gateway._find_messages_collisions(sensor_messages)}")

    def get_rrm_message_event(self):
        return self.rrm_message_event

    def get_sensor_messages_queue(self):
        return self.sensor_messages_queue

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
