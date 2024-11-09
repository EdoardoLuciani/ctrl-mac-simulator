import simpy, random, logging, sys, pathlib, io
from flask import Flask, request, jsonify
from http import HTTPStatus

# Fix for rye that does not load the src directory as a path
sys.path.insert(0, pathlib.Path(__file__).parents[1].as_posix())

from ctrl_mac_simulator.config import DEFAULT_CONFIG
from ctrl_mac_simulator.simulation.stat_tracker import StatTracker
from ctrl_mac_simulator.simulation.devices import Sensor, Gateway
from ctrl_mac_simulator.global_logger_memory_handler import GlobalLoggerMemoryHandler

app = Flask(__name__)


@app.route("/api/simulate", methods=["GET"])
def simulate():
    # Parse query parameters
    args = parse_query_params()

    # Set seed for deterministic runs
    if args["seed"] is not None:
        random.seed(args["seed"])

    # Set up and run the simulation
    env = simpy.Environment()

    stat_tracker = StatTracker()
    global_logger_memory_handler = GlobalLoggerMemoryHandler()
    logging_level = logging.INFO

    try:
        gateway = Gateway(
            env,
            args["data_channels"],
            args["data_slots_per_channel"],
            args["request_slots"],
            args["rrm_period"],
            args["max_cycles"],
            global_logger_memory_handler,
            logging_level,
            stat_tracker,
        )
        sensors = [
            Sensor(
                env,
                i,
                args["sensors_measurement_chance"],
                gateway.rrm_message_event,
                gateway.transmission_request_messages,
                gateway.sensor_data_messages,
                global_logger_memory_handler,
                logging_level,
                stat_tracker,
            )
            for i in range(args["sensor_count"])
        ]
    except ValueError as e:
        return str(e), HTTPStatus.BAD_REQUEST


    env.run()

    # Prepare response
    response = {
        "log": global_logger_memory_handler.log,
        "ftr_values": stat_tracker.ftr_tracker,
        "measurement_latencies": stat_tracker.measurement_latencies
    }

    return jsonify(response)


def parse_query_params():
    args = {}
    for key, default_value in DEFAULT_CONFIG.items():
        if isinstance(default_value, bool):
            args[key] = request.args.get(key, default=default_value, type=lambda v: v.lower() == 'true')
        elif isinstance(default_value, (int, float)):
            args[key] = request.args.get(key, default=default_value, type=type(default_value))
        else:
            args[key] = request.args.get(key, default=default_value)
    return args


if __name__ == "__main__":
    app.run(debug=True)
