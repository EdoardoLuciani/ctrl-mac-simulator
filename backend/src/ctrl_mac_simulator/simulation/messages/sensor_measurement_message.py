import random

from ctrl_mac_simulator.simulation.messages.abstract_message import AbstractMessage


class SensorMeasurementMessage(AbstractMessage):
    def __init__(self, sensor_id: int, data_channel: int, start_time: float, message_length: int = 12):
        self.data = random.randbytes(message_length)
        self.sensor_id = sensor_id
        self.data_channel = data_channel
        self.start_time = start_time
        self.arrive_time = start_time + self.get_airtime()

    def get_message_len(self) -> int:
        return len(self.data)

    def __str__(self) -> str:
        return self.__class__.__name__
