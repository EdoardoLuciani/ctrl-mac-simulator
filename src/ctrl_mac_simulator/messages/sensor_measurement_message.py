import random

class SensorMeasurementMessage:
    def __init__(self, sensor_id: int, message_length: int = 12):
        self.data = random.randbytes(message_length)
        self.sensor_id = sensor_id


    def get_message_len(self) -> int:
        return len(self.data)
