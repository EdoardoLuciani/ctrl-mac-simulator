from ctrl_mac_simulator.messages.sensor_measurement_message import SensorMeasurementMessage
import pytest


def test_airtime():
    # Reference value computed by https://www.loratools.nl/#/airtime
    sensor_message = SensorMeasurementMessage(0, 0, 12)

    assert sensor_message.get_airtime() == pytest.approx(0.04122, 1e-4)
