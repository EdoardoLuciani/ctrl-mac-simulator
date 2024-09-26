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
        self.env = env
        self.id = id
        self.measurement_chance = measurement_chance
        self.get_rrm_message_event_fn = get_rrm_message_event_fn
        self.sensor_messages_queue = sensor_messages_queue

        self.logger = logging.getLogger(self.__class__.__name__ + f"-{id}")
        self.env.process(self.run())

        self.transition_to(_IdleState())

    def run(self):
        while True:
            # Get the RRM message
            event = self.get_rrm_message_event_fn()
            rrm_message: RequestReplyMessage = yield event
            self.logger.info(f"Time {self.env.now:.2f}: Received RRM message")

            # Proceed with the state action
            yield from self._state.handle(rrm_message)

    def transition_to(self, state):
        """
        The Context allows changing the State object at runtime.
        """
        self._state = state
        self._state.context = self


class _State(ABC):
    @property
    def context(self) -> Sensor:
        return self._context

    @context.setter
    def context(self, context: Sensor) -> None:
        self._context = context

    @abstractmethod
    def handle(self, rrm_message):
        pass


class _IdleState(_State):
    def handle(self, rrm_message):
        if random.random() <= self._context.measurement_chance:
            self.context.logger.info(
                f"Time {self.context.env.now:.2f}: Data is available, syncing to next RRM for transmission request"
            )
            self.context.transition_to(_TransmissionRequestState())
        else:
            self.context.logger.info(
                f"Time {self.context.env.now:.2f}: No data available, skipping transmission request"
            )
        yield from ()


class _TransmissionRequestState(_State):
    def __init__(self, backoff: int = 0):
        self.backoff = backoff

    def handle(self, rrm_message):
        free_request_slot_idx = rrm_message.sample_free_request_slot()

        if free_request_slot_idx != None:
            message = TransmissionRequestMessage(self.context.id, free_request_slot_idx, self.context.env.now)

            yield self.context.env.process(message.send_message(self.context.env, self.context.logger))
            yield self.context.sensor_messages_queue.put(message)

            self.context.transition_to(_IdleState())
        else:
            self.context.logger.info(
                f"Time {self.context.env.now:.2f}: No available free slot to choose, skipping transmission request"
            )
