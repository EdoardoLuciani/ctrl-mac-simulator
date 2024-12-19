from app import setup_simulation
from simulation.devices import Gateway, Sensor
from simulation.devices.sensor import _TransmissionRequestState, _DataTransmissionState, _IdleState

from simulation.stat_tracker import StatTracker
import random, simpy


def test_setup_simulation_seed_123():
    env, stat_tracker, _, gateway, sensors, _ = setup_simulation(3, 2, 6, 0.5, 6, 6, 'info', 1.0, seed="123")

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
    assert [slot.state for slot in gateway._rrm.request_slots] == ['free', 'no_contention', 'no_contention', 'no_contention', 'contention', 'no_contention']

    wanted_states = [
        _IdleState,  # 0 period backoff, so sent another transmission request
        _IdleState,
        _DataTransmissionState,  # backed off for 1 period, awaiting for its turn
        _DataTransmissionState,  # backed off for 1 period, awaiting for its turn
        _IdleState,  # 0 period backoff, so sent another transmission request
        _IdleState,
    ]

    assert all([isinstance(sensor._state, cls) for sensor, cls in zip(sensors, wanted_states)])

    assert len(stat_tracker.ftr_values) != 0
    assert len(stat_tracker.measurement_latencies) != 0


def test_setup_simulation_with_parameters_in_string():
    env, _, glmh, _, _, seed = setup_simulation(3, 2, 6, 0.5, 6, 6, 'info', 1.0, seed="123", server=True)
    env2, _, glmh2, _, _, seed2 = setup_simulation("3", "2", "6", "0.5", "6", "6", 'info', 1.0, seed=123, server=True)

    env.run()
    env2.run()
    assert glmh.getvalue() == glmh2.getvalue()
    assert seed == seed2


def test_setup_simulation_with_random_generated_seed():
    env, _, glmh, _, _, seed = setup_simulation(3, 2, 6, 0.5, 6, 6, 'info', 1.0, seed=None, server=True)
    env2, _, glmh2, _, _, seed2 = setup_simulation("3", "2", "6", "0.5", "6", "6", 'info', 1.0, seed=int(seed), server=True)

    env.run()
    env2.run()
    assert glmh.getvalue() == glmh2.getvalue()
    assert seed == seed2


def test_setup_simulation_no_collision():
    env, _, _, _, sensors, _ = setup_simulation(3, 2, 6, 0.5, 2, 6, 'info', 1.0, seed = "226")

    env.run()

    chosen_request_slots = [sensor._state._free_request_slot_idx for sensor in sensors]
    assert len(chosen_request_slots) == len(set(chosen_request_slots))
