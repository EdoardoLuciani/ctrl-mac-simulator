from ctrl_mac_simulator.messages.sensor_measurement_message import (
    SensorMeasurementMessage,
)
from ctrl_mac_simulator.messages.transmission_request_message import TransmissionRequestMessage
import random, simpy, logging
from typing import Callable
from ctrl_mac_simulator.messages.request_reply_message import RequestReplyMessage


class Sensor:
    def __init__(
        self,
        env: simpy.Environment,
        id: int,
        measurement_chance: float,
        get_rrm_message_event_fn: Callable[[], simpy.Event],
        sensor_messages_queue: simpy.Store,
    ):
        self.env = env
        self.id = id
        self.measurement_chance = measurement_chance
        self.get_rrm_message_event_fn = get_rrm_message_event_fn
        self.sensor_messages_queue = sensor_messages_queue
        self.need_to_send_measurement = random.random() < self.measurement_chance


        self.logger = logging.getLogger(self.__class__.__name__ + f"-{id}")
        self.env.process(self.run())

    def run(self):
        while True:
            # Get the RRM message
            event = self.get_rrm_message_event_fn()
            rrm_message: RequestReplyMessage = yield event
            self.logger.info(f"Time {self.env.now:.2f}: Received RRM message")

            if self.need_to_send_measurement:
                # Send the measured data
                free_request_slot = rrm_message.sample_free_request_slot()

                if free_request_slot != None:

                    message = TransmissionRequestMessage(self.id, free_request_slot, self.env.now)
                    yield self.env.process(message.send_message(self.env, self.logger))

                    yield self.sensor_messages_queue.put(message)

                #message = SensorMeasurementMessage(self.id, self.env.now)
                #yield self.env.process(message.send_message(self.env, self.logger))

                #yield self.sensor_messages_queue.put(message)
            else:
                self.logger.info(f"Time {self.env.now:.2f}: Skipping message transmission")
                self.need_to_send_measurement = random.random() < self.measurement_chance
