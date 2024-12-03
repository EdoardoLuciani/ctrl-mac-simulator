import simpy, random, logging, os, sys, numpy as np
from io import StringIO
from flask import Flask, request, jsonify
from http import HTTPStatus

from simulation.stat_tracker import StatTracker
from simulation.devices import Sensor, Gateway
from config import configure_parser_and_get_args

app = Flask(__name__)


@app.route("/api/simulate", methods=["GET"])
def simulate():
    try:
        env, stat_tracker, log_stream, gateway, sensors, seed = setup_simulation(**request.args, server=True)
    except ValueError as e:
        return str(e), HTTPStatus.BAD_REQUEST

    env.run()

    ftr_values_array = np.array(stat_tracker.ftr_tracker)
    ftr_median_value = np.median(ftr_values_array)
    cycles_to_ftr_equilibrium = np.where(ftr_values_array >= ftr_median_value)[0][0].item()

    # Prepare response
    return jsonify({
        "log": log_stream.getvalue().split('\n'),
        "ftr_values": stat_tracker.ftr_tracker,
        "ftr_median_value": ftr_median_value,
        "cycles_to_ftr_equilibrium": cycles_to_ftr_equilibrium,
        "measurement_latencies": stat_tracker.measurement_latencies,
        "seed": seed
    })


def setup_simulation(data_channels: int | str, data_slots_per_channel: int | str, request_slots: int | str, rrm_period: float | str, max_cycles: int | str, sensor_count: int | str, log_level: str, sensors_measurement_chance: float | str, seed: str = None, server: bool = False, **kwargs):
    # Convert string parameters to appropriate numeric types
    data_channels = int(data_channels)
    data_slots_per_channel = int(data_slots_per_channel)
    sensor_count = int(sensor_count)
    request_slots = int(request_slots)
    rrm_period = float(rrm_period)
    max_cycles = int(max_cycles)
    sensors_measurement_chance = float(sensors_measurement_chance)

    if seed is None:
        seed = int.from_bytes(os.urandom(4), 'big')
    seed = str(seed)
    random.seed(seed)

    # Set up and run the simulation
    env = simpy.Environment()

    stat_tracker = StatTracker()

    if (server):
        log_stream = StringIO()
    else:
        log_stream = sys.stdout
    handler = logging.StreamHandler(log_stream)
    handler.setFormatter(logging.Formatter('%(levelname)s: %(name)s: %(message)s'))

    logging_level = getattr(logging, log_level.upper())

    gateway = Gateway(
        env,
        data_channels,
        data_slots_per_channel,
        request_slots,
        rrm_period,
        max_cycles,
        handler,
        logging_level,
        stat_tracker,
    )
    sensors = [
        Sensor(
            env,
            i,
            sensors_measurement_chance,
            gateway.rrm_message_event,
            gateway.transmission_request_messages,
            gateway.sensor_data_messages,
            handler,
            logging_level,
            stat_tracker,
        )
        for i in range(sensor_count)
    ]

    return env, stat_tracker, log_stream, gateway, sensors, seed


if __name__ == "__main__":
    args = configure_parser_and_get_args()

    if args.server:
        app.run(debug=True, port=args.port)
    else:
        env, _, _, _, _, _ = setup_simulation(**vars(args))
        env.run()
