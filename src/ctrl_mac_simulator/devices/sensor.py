from ctrl_mac_simulator.messages.sensor_measurement_message import (
    SensorMeasurementMessage,
)
from ctrl_mac_simulator.messages.transmission_request_message import TransmissionRequestMessage
import random, simpy, logging
from typing import Callable
from ctrl_mac_simulator.messages.request_reply_message import RequestReplyMessage
from abc import ABC, abstractmethod


class Sensor:
    def __init__(
        self,
        env: simpy.Environment,
        id: int,
        measurement_chance: float,
        get_rrm_message_event_fn: Callable[[], simpy.Event],
        sensor_messages_queue: simpy.Store,
    ):
        self._env = env
        self._id = id
        self._measurement_chance = measurement_chance
        self._get_rrm_message_event_fn = get_rrm_message_event_fn
        self._sensor_messages_queue = sensor_messages_queue

        self._logger = logging.getLogger(self.__class__.__name__ + f"-{id}")
        self._env.process(self.run())

        self.transition_to(_IdleState())

    def run(self):
        while True:
            # Get the RRM message
            rrm_message = yield self._get_rrm_message_event_fn()
            self._logger.info(f"Time {self._env.now:.2f}: Received RRM message")

            # Proceed with the state action
            yield from self._state.handle(rrm_message)

    def transition_to(self, state):
        """
        The Context allows changing the State object at runtime.
        """
        self._state = state
        self._state.sensor = self


class _State(ABC):
    @property
    def sensor(self) -> Sensor:
        return self._sensor

    @sensor.setter
    def sensor(self, sensor: Sensor) -> None:
        self._sensor = sensor

    @abstractmethod
    def handle(self, rrm_message):
        pass


class _IdleState(_State):
    def handle(self, rrm_message):
        if random.random() <= self.sensor._measurement_chance:
            self.sensor._logger.info(
                f"Time {self.sensor._env.now:.2f}: Data is available, syncing to next RRM for transmission request"
            )
            self.sensor.transition_to(_TransmissionRequestState())
        else:
            self.sensor._logger.info(
                f"Time {self.sensor._env.now:.2f}: No data available, skipping transmission request"
            )
        yield from ()


class _TransmissionRequestState(_State):
    def __init__(self, backoff: int = 0):
        self.backoff = backoff

    def handle(self, rrm_message):
        free_request_slot_idx = rrm_message.sample_free_request_slot()

        if free_request_slot_idx != None:
            message = TransmissionRequestMessage(self.sensor._id, free_request_slot_idx, self.sensor._env.now)

            yield self.sensor._env.process(message.send_message(self.sensor._env, self.sensor._logger))
            yield self.sensor._sensor_messages_queue.put(message)

            self.sensor.transition_to(_IdleState())
        else:
            self.sensor._logger.info(
                f"Time {self.sensor._env.now:.2f}: No available free slot to choose, skipping transmission request"
            )
