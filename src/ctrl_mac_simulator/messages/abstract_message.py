import math, json
from abc import ABC, abstractmethod
from typing import Any


class AbstractMessage(ABC):
    @abstractmethod
    def get_message_len(self) -> int:
        pass

    def get_airtime(
        self,
        crc_on: bool,
        explicit_header: bool,
        sf: int = 7,
        bw: int = 125000,
        coding_rate: int = 1,
        preamble: int = 8,
    ) -> float:
        """
        Calculate the airtime for a LoRa transmission.

        Args:
        payload_len (int): Length of the payload in bytes.
        crcOn (bool): Whether CRC is enabled.
        explicit_header (bool): Whether explicit header is used.
        sf (int, optional): Spreading factor. Defaults to 7.
        bw (int, optional): Bandwidth in Hz. Defaults to 125000.
        coding_rate (int, optional): Coding rate. Defaults to 1.
        preamble (int, optional): Preamble length. Defaults to 8.

        Returns:
        float: The total airtime of the transmission in seconds.

        This function calculates the airtime for a LoRa transmission based on the
        given parameters. It takes into account the payload length, CRC usage,
        header type, spreading factor, bandwidth, coding rate, and preamble length.
        """
        de = sf >= 11
        symbol_duration = math.pow(2, sf) / bw

        a = float(8 * self.get_message_len() - 4 * sf + 28 + 16 * crc_on - 20 * (not explicit_header))
        b = float(4 * (sf - 2 * de))

        nbr_symbols = max(math.ceil(a / b) * (coding_rate + 4), 0) + 8

        preambule_duration = (preamble + 4.25) * symbol_duration
        payload_duration = nbr_symbols * symbol_duration  # mutliply by symbol duration
        return preambule_duration + payload_duration

    def to_json(self, start_time: float, arrive_time: float) -> str:
        dt = self.__dict__
        dt["start_time"] = start_time
        dt["arrive_time"] = arrive_time
        dt["message_type"] = self.__class__.__name__

        def custom_encoder(obj):
            if isinstance(obj, bytes):
                return obj.hex()
            elif hasattr(obj, "__dict__"):
                return obj.__dict__
            else:
                return str(obj)

        return json.dumps(dt, default=custom_encoder)
