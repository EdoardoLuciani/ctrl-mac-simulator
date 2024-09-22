import simpy, logging
from ..messages import RequestReplyMessage

class Gateway:
    def __init__(self, env):
        self.env: simpy.Environment = env
        self.rrm_message_event = simpy.Event(env)
        self.logger = logging.getLogger(self.__class__.__name__)
        self.env.process(self.run())

    def run(self):
        while True:
            # Send RRM every half a second
            yield self.env.timeout(1)
            self.rrm_message_event.succeed(RequestReplyMessage())
            self.rrm_message_event = simpy.Event(self.env)
            self.logger.info(f"Time {self.env.now:.2f}: Sent RRM message")

    def get_rrm_message_event(self):
        return self.rrm_message_event
