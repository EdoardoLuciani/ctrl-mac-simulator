import simpy, random, logging, sys, pathlib, io, os
from flask import Flask, request, jsonify
from http import HTTPStatus

from simulation.stat_tracker import StatTracker
from simulation.devices import Sensor, Gateway
from global_logger_memory_handler import GlobalLoggerMemoryHandler

app = Flask(__name__)


@app.route("/api/simulate", methods=["GET"])
def simulate():
    try:
        env, stat_tracker, global_logger_memory_handler, gateway, sensors, used_seed = setup_simulation(**request.args)
    except ValueError as e:
        return str(e), HTTPStatus.BAD_REQUEST

    env.run()

    # Prepare response
    return jsonify({
        "log": global_logger_memory_handler.log,
        "ftr_values": stat_tracker.ftr_tracker,
        "measurement_latencies": stat_tracker.measurement_latencies,
        "seed": used_seed
    })


def setup_simulation(data_channels: int, data_slots_per_channel: int, request_slots: int, rrm_period: float, max_cycles: int, sensor_count: int, sensors_measurement_chance: float = "1.0", seed = None):
    # Convert string parameters to appropriate numeric types
    data_channels = int(data_channels)
    data_slots_per_channel = int(data_slots_per_channel)
    sensor_count = int(sensor_count)
    request_slots = int(request_slots)
    rrm_period = float(rrm_period)
    max_cycles = int(max_cycles)
    sensors_measurement_chance = float(sensors_measurement_chance)

    # Set seed for deterministic runs
    if seed is not None:
        used_seed = int(seed)
    else:
        used_seed = int.from_bytes(os.urandom(4), 'big')
    random.seed(used_seed)

    # Set up and run the simulation
    env = simpy.Environment()

    stat_tracker = StatTracker()
    global_logger_memory_handler = GlobalLoggerMemoryHandler()
    logging_level = logging.INFO

    gateway = Gateway(
        env,
        data_channels,
        data_slots_per_channel,
        request_slots,
        rrm_period,
        max_cycles,
        global_logger_memory_handler,
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
            global_logger_memory_handler,
            logging_level,
            stat_tracker,
        )
        for i in range(sensor_count)
    ]

    return env, stat_tracker, global_logger_memory_handler, gateway, sensors, used_seed


if __name__ == "__main__":
    app.run(debug=True)
