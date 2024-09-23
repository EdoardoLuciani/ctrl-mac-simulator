import json, pytest
from ctrl_mac_simulator.messages.request_reply_message import RequestReplyMessage
from ctrl_mac_simulator.messages.sensor_measurement_message import SensorMeasurementMessage


def sensor_measurement_message():
    return SensorMeasurementMessage(0, 1)


def request_reply_message():
    return RequestReplyMessage(1)


@pytest.mark.parametrize(
    "message",
    ["sensor_measurement_message", "request_reply_message"],
)
def assert_json_serialization(message):
    serialized_message = json.loads(message.to_json())

    assert serialized_message
    assert serialized_message["start_time"] == 1
    assert serialized_message["arrive_time"] != 1
