import simpy, random, logging, sys, pathlib, io
from flask import Flask, request, jsonify
from http import HTTPStatus

# Fix for rye that does not load the src directory as a path
sys.path.insert(0, pathlib.Path(__file__).parents[1].as_posix())

from ctrl_mac_simulator.simulation.stat_tracker import StatTracker
from ctrl_mac_simulator.simulation.devices import Sensor, Gateway
from ctrl_mac_simulator.global_logger_memory_handler import GlobalLoggerMemoryHandler

app = Flask(__name__)


@app.route("/api/simulate", methods=["GET"])
def simulate():
    try:
        env, stat_tracker, global_logger_memory_handler, gateway, sensors = setup_simulation(**request.args)
    except ValueError as e:
        return str(e), HTTPStatus.BAD_REQUEST

    env.run()

    # Prepare response
    return jsonify({
        "log": global_logger_memory_handler.log,
        "ftr_values": stat_tracker.ftr_tracker,
        "measurement_latencies": stat_tracker.measurement_latencies
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
        random.seed(seed)

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

    return env, stat_tracker, global_logger_memory_handler, gateway, sensors


if __name__ == "__main__":
    app.run(debug=True)
