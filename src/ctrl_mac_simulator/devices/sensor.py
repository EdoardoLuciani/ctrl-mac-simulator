import random, simpy, logging
from typing import Callable

class Sensor:
    def __init__(self, env, id, get_rrm_message_event_fn: Callable[[], simpy.Event]):
        self.env = env
        self.id = id
        self.get_rrm_message_event_fn = get_rrm_message_event_fn
        self.logger = logging.getLogger(self.__class__.__name__ + f"-{id}")
        self.env.process(self.run())

    def run(self):
        while True:
            event = self.get_rrm_message_event_fn()
            message = yield event
            self.logger.info(f"Time {self.env.now:.2f}: received RRM message")
