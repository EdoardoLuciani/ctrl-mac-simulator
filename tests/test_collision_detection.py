from ctrl_mac_simulator.devices.gateway import Gateway
from ctrl_mac_simulator.messages.sensor_measurement_message import SensorMeasurementMessage


def test_all_collisions():
    messages = [SensorMeasurementMessage(0, 0, 0), SensorMeasurementMessage(1, 0, 0)]
    assert all(Gateway._find_messages_collisions(messages))


def test_no_collisions():
    messages = [SensorMeasurementMessage(0, 0, 0), SensorMeasurementMessage(1, 0, 1)]
    assert any(Gateway._find_messages_collisions(messages)) == False


def test_first_two_collisions():
    messages = [SensorMeasurementMessage(0, 0, 0), SensorMeasurementMessage(1, 0, 0), SensorMeasurementMessage(2, 0, 1)]
    assert (Gateway._find_messages_collisions(messages)) == [True, True, False]


def test_two_collisions_not_sorted():
    messages = [SensorMeasurementMessage(0, 0, 0), SensorMeasurementMessage(2, 0, 1), SensorMeasurementMessage(1, 0, 0)]
    assert (Gateway._find_messages_collisions(messages)) == [True, False, True]


def test_no_messages():
    messages = []
    assert (Gateway._find_messages_collisions(messages)) == []
