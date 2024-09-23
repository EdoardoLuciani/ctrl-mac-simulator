from ctrl_mac_simulator.messages.sensor_measurement_message import SensorMeasurementMessage
import pytest
from src.ctrl_mac_simulator.airtime import get_lora_airtime


def test_airtime():
    # Reference value computed by https://www.loratools.nl/#/airtime
    sensor_message = SensorMeasurementMessage(0, 0, 12)

    assert get_lora_airtime(25, True, False) == pytest.approx(0.05658, 1e-4)
