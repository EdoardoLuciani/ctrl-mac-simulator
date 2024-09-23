import random, simpy, logging
from typing import Callable
from ..utils.airtime import get_lora_airtime

class Sensor:
    def __init__(self, env, id, get_rrm_message_event_fn: Callable[[], simpy.Event], sensor_messages_queue: simpy.Store):
        self.env = env
        self.id = id
        self.get_rrm_message_event_fn = get_rrm_message_event_fn
        self.sensor_messages_queue = sensor_messages_queue
        self.logger = logging.getLogger(self.__class__.__name__ + f"-{id}")
        self.env.process(self.run())

    def run(self):
        while True:
            # Get the RRM message
            event = self.get_rrm_message_event_fn()
            rrm_message = yield event
            self.logger.info(f"Time {self.env.now:.2f}: Received RRM message")

            # Send the measured data
            data = random.randbytes(12)

            self.logger.info(f"Time {self.env.now:.2f}: Started measurement transmission")
            yield self.env.timeout(get_lora_airtime(12, True, False))

            self.logger.info(f"Time {self.env.now:.2f}: Finished measurement transmission")
            yield self.sensor_messages_queue.put(data)
