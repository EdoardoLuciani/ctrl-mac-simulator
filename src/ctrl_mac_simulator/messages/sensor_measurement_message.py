import random

from ctrl_mac_simulator.messages.abstract_message import AbstractMessage

class SensorMeasurementMessage(AbstractMessage):
    def __init__(self, sensor_id: int, message_length: int = 12):
        self.data = random.randbytes(message_length)
        self.sensor_id = sensor_id


    def get_message_len(self) -> int:
        return len(self.data)
