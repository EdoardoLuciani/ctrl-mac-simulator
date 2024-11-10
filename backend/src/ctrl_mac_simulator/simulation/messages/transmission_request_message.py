from ctrl_mac_simulator.simulation.messages.abstract_message import AbstractMessage


class TransmissionRequestMessage(AbstractMessage):
    def __init__(self, sensor_id: int, chosen_request_slot: int, start_time: float):
        self.sensor_id = sensor_id
        self.chosen_request_slot = chosen_request_slot
        self.start_time = start_time
        self.arrive_time = start_time + self.get_airtime()

    def get_message_len(self) -> int:
        return 12

    def __str__(self) -> str:
        return f"{self.__class__.__name__} for request slot {self.chosen_request_slot}"
