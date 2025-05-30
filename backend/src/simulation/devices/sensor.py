from simulation.messages import SensorMeasurementMessage
from simulation.messages import TransmissionRequestMessage
from simulation.stat_tracker import StatTracker
import random, simpy, logging
from typing import Callable, Optional
from simulation.messages import RequestReplyMessage
from abc import ABC, abstractmethod


class Sensor:
    def __init__(
        self,
        env: simpy.Environment,
        id: int,
        measurement_chance: float,
        payload_size: int,
        get_rrm_message_event_fn: Callable[[], simpy.Event],
        transmission_requests_queue: simpy.Store,
        data_messages_queue: simpy.Store,
        logger_handler: Optional[logging.Handler] = None,
        logger_level: Optional[int] = None,
        stat_tracker: Optional[StatTracker] = None,
    ):
        self._env = env
        self._id = id
        self._measurement_chance = measurement_chance
        self._payload_size = payload_size
        self._get_rrm_message_event_fn = get_rrm_message_event_fn
        self._transmission_requests_queue = transmission_requests_queue
        self._data_messages_queue = data_messages_queue
        self._stat_tracker = stat_tracker

        self._measurement_time = None

        self._logger = logging.getLogger(self.__class__.__name__ + f"-{id}")
        if logger_handler:
            self._logger.addHandler(logger_handler)
        if logger_level:
            self._logger.setLevel(logger_level)

        self._env.process(self.run())

        self.transition_to(_IdleState())

    def run(self):
        while True:
            # Get the RRM message
            rrm_message = yield self._get_rrm_message_event_fn()
            self._logger.info(f"Time {self._env.now:.2f}: Received RequestReplayMessage")

            # Proceed with the state action
            yield from self._state.handle(rrm_message)

    def transition_to(self, state):
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
    def handle(self, rrm_message: RequestReplyMessage):
        pass


class _IdleState(_State):
    def handle(self, rrm_message: RequestReplyMessage):
        if random.random() <= self.sensor._measurement_chance:
            self.sensor._logger.info(
                f"Time {self.sensor._env.now:.2f}: Data is available, syncing to next RRM for transmission request"
            )
            self.sensor._measurement_time = self.sensor._env.now
            self.sensor.transition_to(_TransmissionRequestState())
        else:
            self.sensor._logger.info(
                f"Time {self.sensor._env.now:.2f}: No data available, skipping transmission request"
            )
        yield from ()


class _TransmissionRequestState(_State):
    def __init__(self, backoff: int = 0):
        self.backoff = backoff

    def handle(self, rrm_message: RequestReplyMessage):
        if self.backoff:
            self.backoff -= 1
            self.sensor._logger.info(f"Time {self.sensor._env.now:.2f}: On timeout for {self.backoff} more periods")
            yield from ()
        else:
            request_slot_idx = rrm_message.sample_request_slot()

            if request_slot_idx is not None:
                message = TransmissionRequestMessage(self.sensor._id, request_slot_idx, self.sensor._env.now)

                yield from message.send_message(self.sensor._env, self.sensor._logger)
                yield self.sensor._transmission_requests_queue.put(message)

                self.sensor.transition_to(_DataTransmissionState(request_slot_idx))
            else:
                self.sensor._logger.info(
                    f"Time {self.sensor._env.now:.2f}: No available free slot to choose, skipping transmission request"
                )


class _DataTransmissionState:
    def __init__(self, free_request_slot_idx) -> None:
        self._free_request_slot_idx = free_request_slot_idx

    def handle(self, rrm_message: RequestReplyMessage):
        chosen_request_slot = rrm_message.request_slots[self._free_request_slot_idx]

        if chosen_request_slot.state == "no_contention":
            yield simpy.Timeout(self.sensor._env, chosen_request_slot.data_slot)
            message = SensorMeasurementMessage(self.sensor._id, chosen_request_slot.data_channel, self.sensor._env.now, self.sensor._payload_size)

            if self.sensor._stat_tracker:
                self.sensor._stat_tracker.append_measurement_latency(message.start_time - self.sensor._measurement_time)

            yield from message.send_message(self.sensor._env, self.sensor._logger)
            yield self.sensor._data_messages_queue.put(message)

            self.sensor.transition_to(_IdleState())
        else:
            backoff = (
                rrm_message.ftr
                + (rrm_message.total_contentions() - 1)
                - rrm_message.total_contentions(self._free_request_slot_idx)
            )

            self.sensor._logger.info(
                f"Time {self.sensor._env.now:.2f}: Slot {self._free_request_slot_idx} is contended, backing off for {backoff} periods"
            )
            next_state = _TransmissionRequestState(backoff)
            self.sensor.transition_to(next_state)

            yield from next_state.handle(rrm_message)
