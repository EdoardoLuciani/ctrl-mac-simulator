from app import setup_simulation
from simulation.devices import Gateway, Sensor
from simulation.devices.sensor import _TransmissionRequestState, _DataTransmissionState, _IdleState

from simulation.stat_tracker import StatTracker
import random, simpy

default_params = {
    "data_channels": 3,
    "request_slots": 6,
    "max_cycles": 6,
    "sensor_count": 6,
    "sensors_measurement_chance": 1,
    "sensor_data_payload_size": 12,
    "log_level": "info",
    "seed": "123",
    "server": True,
}


def test_setup_simulation_seed_123():
    env, stat_tracker, _, gateway, sensors, _, cycle_period = setup_simulation(**default_params)

    env.run(cycle_period)
    # RRM message in first cycle must have all slots free and sensors are ready to send the transmission request on the next cycle
    assert all([slot.state == "free" for slot in gateway._rrm.request_slots])
    assert all([isinstance(sensor._state, _TransmissionRequestState) for sensor in sensors])

    env.run(cycle_period * 2)
    # Sensors have sent their transmission request messages and they all think they are going to be able to send data in the next slot
    assert all([slot.state == "free" for slot in gateway._rrm.request_slots])
    assert all([isinstance(sensor._state, _DataTransmissionState) for sensor in sensors])

    env.run(cycle_period * 3)
    # Two sets of slots collide and receive different backoff time, some other proceed with data transmission and go idle
    assert [slot.state for slot in gateway._rrm.request_slots] == ['free', 'no_contention', 'no_contention', 'no_contention', 'contention', 'no_contention']

    wanted_states = [
        _IdleState,
        _IdleState,
        _DataTransmissionState,
        _DataTransmissionState,
        _IdleState,
        _IdleState,
    ]
    assert all([isinstance(sensor._state, cls) for sensor, cls in zip(sensors, wanted_states)])

    assert len(stat_tracker.ftr_values) != 0
    assert len(stat_tracker.measurement_latencies) != 0


def test_setup_simulation_with_parameters_in_string():
    env, _, glmh, _, _, seed, _ = setup_simulation(**default_params)

    string_params = {key: str(value) for key, value in default_params.items()}
    env2, _, glmh2, _, _, seed2, _ = setup_simulation(**string_params)

    env.run()
    env2.run()
    assert glmh.getvalue() == glmh2.getvalue()
    assert seed == seed2


def test_setup_simulation_with_random_generated_seed():
    custom_params = default_params.copy()
    custom_params["seed"] = None

    env, _, glmh, _, _, seed, _ = setup_simulation(**custom_params)

    custom_params["seed"] = int(seed)
    env2, _, glmh2, _, _, seed2, _ = setup_simulation(**custom_params)

    env.run()
    env2.run()
    assert glmh.getvalue() == glmh2.getvalue()
    assert seed == seed2


def test_setup_simulation_no_collision():
    custom_params = default_params.copy()
    custom_params["max_cycles"] = "2"
    custom_params["seed"] = "226"

    env, _, glmh, _, sensors, _, _ = setup_simulation(**custom_params)

    env.run()

    chosen_request_slots = [sensor._state._free_request_slot_idx for sensor in sensors]
    assert len(chosen_request_slots) == len(set(chosen_request_slots))
