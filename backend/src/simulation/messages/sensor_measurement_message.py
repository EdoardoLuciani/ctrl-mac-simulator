import random

from simulation.messages.abstract_message import AbstractMessage


class SensorMeasurementMessage(AbstractMessage):
    def __init__(self, sensor_id: int, data_channel: int, start_time: float, message_length: int):
        self.message_length = message_length
        self.sensor_id = sensor_id
        self.data_channel = data_channel
        self.start_time = start_time
        self.arrive_time = start_time + self.get_airtime()

    def get_message_len(self) -> int:
        return self.message_length

    def __str__(self) -> str:
        return self.__class__.__name__
