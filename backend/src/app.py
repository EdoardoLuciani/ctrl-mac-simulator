import simpy, random, logging, os, sys, numpy as np
from io import StringIO
from fastapi import FastAPI, HTTPException, Request
from pydantic import ValidationError

from simulation.stat_tracker import StatTracker
from simulation.devices import Sensor, Gateway
from config import SimulationParams

app = FastAPI()

@app.get("/api/simulate")
async def simulate(request: Request):
    query_params = dict(request.query_params)

    try:
        env, stat_tracker, log_stream, gateway, sensors, seed = setup_simulation(**query_params, server=True)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    env.run()

    ftr_values_array = np.array(stat_tracker.ftr_tracker)
    median_ftr = np.median(ftr_values_array)
    cycles_to_ftr_equilibrium = np.where(ftr_values_array >= median_ftr)[0][0].item()

    measurement_latencies_array = np.array(stat_tracker.measurement_latencies)
    measurement_latencies_percentiles = np.round(np.percentile(measurement_latencies_array, [1, 25, 50, 75, 99]), decimals=3)

    # Prepare response
    return {
        "log": log_stream.getvalue().split('\n'),
        "ftr_values": stat_tracker.ftr_tracker,
        "measurement_latencies": stat_tracker.measurement_latencies,
        "statistics": {
            "median_ftr": median_ftr,
            "cycles_to_ftr_equilibrium": cycles_to_ftr_equilibrium,
            "measurement_latency_1_percentile": measurement_latencies_percentiles[0],
            "measurement_latency_25_percentile": measurement_latencies_percentiles[1],
            "measurement_latency_50_percentile": measurement_latencies_percentiles[2],
            "measurement_latency_75_percentile": measurement_latencies_percentiles[3],
            "measurement_latency_99_percentile": measurement_latencies_percentiles[4],
        },
        "seed": seed
    }


def setup_simulation(
    data_channels: int | str = None,
    data_slots_per_channel: int | str = None,
    request_slots: int | str = None,
    rrm_period: float | str = None,
    max_cycles: int | str = None,
    sensor_count: int | str = None,
    log_level: str = None,
    sensors_measurement_chance: float | str = None,
    seed: str = None,
    server: bool = False,
    **kwargs):

    params = SimulationParams(
        data_channels=data_channels,
        data_slots_per_channel=data_slots_per_channel,
        request_slots=request_slots,
        rrm_period=rrm_period,
        max_cycles=max_cycles,
        sensor_count=sensor_count,
        sensors_measurement_chance=sensors_measurement_chance,
        log_level=log_level,
        seed=seed
    )

    if params.seed is None:
        params.seed = str(int.from_bytes(os.urandom(4), 'big'))
    params.seed = str(params.seed)
    random.seed(params.seed)

    # Set up and run the simulation
    env = simpy.Environment()

    stat_tracker = StatTracker()

    if (server):
        log_stream = StringIO()
    else:
        log_stream = sys.stdout
    handler = logging.StreamHandler(log_stream)
    handler.setFormatter(logging.Formatter('%(levelname)s: %(name)s: %(message)s'))

    gateway = Gateway(
        env,
        params.data_channels,
        params.data_slots_per_channel,
        params.request_slots,
        params.rrm_period,
        params.max_cycles,
        handler,
        params.log_level,
        stat_tracker,
    )
    sensors = [
        Sensor(
            env,
            i,
            params.sensors_measurement_chance,
            gateway.rrm_message_event,
            gateway.transmission_request_messages,
            gateway.sensor_data_messages,
            handler,
            params.log_level,
            stat_tracker,
        )
        for i in range(params.sensor_count)
    ]

    return env, stat_tracker, log_stream, gateway, sensors, params.seed
