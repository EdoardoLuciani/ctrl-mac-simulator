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
            self.logger.info(f"Time {self.env.now:.2f}: Started RRM transmission")
            rrm = RequestReplyMessage(self.env.now)

            yield simpy.Timeout(self.env, rrm.get_airtime())

            self.logger.debug(rrm.to_json())
            self.logger.info(f"Time {self.env.now:.2f}: Finished RRM message transmission")
            self.rrm_message_event.succeed(rrm)
            self.rrm_message_event = simpy.Event(self.env)

            # Listen on sensor messages for 0.5s
            timeout = simpy.Timeout(self.env, 0.5)

            sensor_messages = []

            while True:
                get_event = self.sensor_messages_queue.get()
                result = yield simpy.AnyOf(self.env, [get_event, timeout])

                if get_event in result:
                    # A message was received
                    sensor_messages.append(get_event.value)
                    self.logger.info(f"Time {self.env.now:.2f}: Received sensor message")
                else:
                    # Timeout occurred, exit the inner loop
                    break

    def get_rrm_message_event(self):
        return self.rrm_message_event

    def get_sensor_messages_queue(self):
        return self.sensor_messages_queue
