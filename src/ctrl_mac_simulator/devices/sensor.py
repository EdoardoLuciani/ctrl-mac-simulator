import random, simpy, logging
from typing import Callable

class Sensor:
    def __init__(self, env, id, get_rrm_message_event_fn: Callable[[], simpy.Event]):
        self.env = env
        self.id = id
        self.get_rrm_message_event_fn = get_rrm_message_event_fn
        self.env.process(self.run())

    def run(self):
        while True:
            event = self.get_rrm_message_event_fn()
            message = yield event
            logging.info(f"Time {self.env.now:.2f}: Sensor {self.id} received: {message}")
