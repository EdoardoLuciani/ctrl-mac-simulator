import pytest
from src.ctrl_mac_simulator.airtime import get_lora_airtime


def test_airtime():
    # Reference value computed by https://www.loratools.nl/#/airtime
    assert get_lora_airtime(25, True, False) == pytest.approx(0.05658, 1e-4)
