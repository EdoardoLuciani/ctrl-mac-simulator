from ctrl_mac_simulator.simulation.devices import Gateway, Sensor
from ctrl_mac_simulator.simulation.devices.sensor import _TransmissionRequestState, _DataTransmissionState, _IdleState

from ctrl_mac_simulator.simulation.stat_tracker import StatTracker
import random, simpy, logging


def test_scenario_1():
    random.seed(834)
    stat_tracker = StatTracker()

    env = simpy.Environment()
    gateway = Gateway(env, 3, 2, 6, 0.5, 6, stat_tracker=stat_tracker,)
    sensors = [
        Sensor(
            env,
            i,
            1,
            gateway.rrm_message_event,
            gateway.transmission_request_messages,
            gateway.sensor_data_messages,
            stat_tracker=stat_tracker,
        )
        for i in range(6)
    ]

    env.run(0.50)
    # RRM message in first cycle must have all slots free and sensors are ready to send the transmission request on the next cycle
    assert all([slot.state == "free" for slot in gateway._rrm.request_slots])
    assert all([isinstance(sensor._state, _TransmissionRequestState) for sensor in sensors])

    env.run(1)
    # Sensors have sent their transmission request messages and they all think they are going to be able to send data in the next slot
    assert all([slot.state == "free" for slot in gateway._rrm.request_slots])
    assert all([isinstance(sensor._state, _DataTransmissionState) for sensor in sensors])

    env.run(1.5)
    # Two sets of slots collide and receive different backoff time, some other proceed with data transmission and go idle
    assert [slot.state for slot in gateway._rrm.request_slots] == [
        "contention",
        "free",
        "no_contention",
        "no_contention",
        "free",
        "contention",
    ]

    wanted_states = [
        _DataTransmissionState,  # 0 period backoff, so sent another transmission request
        _IdleState,
        _TransmissionRequestState,  # backed off for 1 period, awaiting for its turn
        _TransmissionRequestState,  # backed off for 1 period, awaiting for its turn
        _DataTransmissionState,  # 0 period backoff, so sent another transmission request
        _IdleState,
    ]
    assert all([isinstance(sensor._state, cls) for sensor, cls in zip(sensors, wanted_states)])

    assert len(stat_tracker.ftr_values) != 0
    assert len(stat_tracker.measurement_latencies) != 0
