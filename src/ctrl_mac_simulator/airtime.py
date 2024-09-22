import math


def airtime(
    payload_len: int,
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

    a = float(8 * payload_len - 4 * sf + 28 + 16 * crc_on - 20 * (not explicit_header))
    b = float(4 * (sf - 2 * de))

    nbr_symbols = max(math.ceil(a / b) * (coding_rate + 4), 0) + 8

    preambule_duration = (preamble + 4.25) * symbol_duration
    payload_duration = nbr_symbols * symbol_duration  # mutliply by symbol duration
    return preambule_duration + payload_duration
