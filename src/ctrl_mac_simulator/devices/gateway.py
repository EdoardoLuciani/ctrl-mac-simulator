import simpy, logging
from ..messages import RequestReplyMessage
from ..utils.airtime import get_lora_airtime
from ..utils.message_json_formatter import convert_message_to_json

class Gateway:
    def __init__(self, env):
        self.env: simpy.Environment = env
        self.rrm_message_event = simpy.Event(env)
        self.logger = logging.getLogger(self.__class__.__name__)
        self.env.process(self.run())


    def run(self):
        while True:
            # Send RRM every half a second
            yield self.env.timeout(0.5)
            start_time = self.env.now
            self.logger.info(f"Time {start_time:.2f}: Started RRM transmission")
            rrm = RequestReplyMessage()

            # Simulate airtime
            yield self.env.timeout(get_lora_airtime(rrm.get_message_len(), True, False))

            self.logger.debug(f"{convert_message_to_json(rrm, start_time, self.env.now)}")
            self.logger.info(f"Time {self.env.now:.2f}: Finished RRM message transmission")

            self.rrm_message_event.succeed(rrm)
            self.rrm_message_event = simpy.Event(self.env)


    def get_rrm_message_event(self):
        return self.rrm_message_event
