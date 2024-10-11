import simpy, random, logging, sys, pathlib, io
from flask import Flask, request, jsonify

# Fix for rye that does not load the src directory as a path
sys.path.insert(0, pathlib.Path(__file__).parents[1].as_posix())

from ctrl_mac_simulator.simulation.stat_tracker import StatTracker
from ctrl_mac_simulator.simulation.devices import Sensor, Gateway
from ctrl_mac_simulator.global_logger_memory_handler import GlobalLoggerMemoryHandler

app = Flask(__name__)


@app.route("/simulate", methods=["GET"])
def simulate():
    # Parse query parameters
    args = parse_query_params()

    # Set seed for deterministic runs
    if args["seed"] is not None:
        random.seed(args.seed)

    # Set up and run the simulation
    env = simpy.Environment()

    stat_tracker = StatTracker()
    global_logger_memory_handler = GlobalLoggerMemoryHandler()
    logging_level = logging.INFO  # getattr(logging, args.log_level.upper())

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

    env.run()

    # Prepare response
    response = {
        "logs": global_logger_memory_handler.logs,
        # "stats": StatTracker.get_stats() if args.plot else None
    }

    return jsonify(response)


def parse_query_params():
    args = {}
    args["data_channels"] = int(request.args.get("data-channels", default=3))
    args["data_slots_per_channel"] = int(request.args.get("data-slots-per-channel", default=2))
    args["request_slots"] = int(request.args.get("request-slots", default=6))
    args["rrm_period"] = float(request.args.get("rrm-period", default=0.5))
    args["max_cycles"] = int(request.args.get("max-cycles", default=5))
    args["sensor_count"] = int(request.args.get("sensor-count", default=6))
    args["sensors_measurement_chance"] = float(request.args.get("sensors-measurement-chance", default=1))

    args["seed"] = request.args.get("seed")
    args["log_level"] = request.args.get("log-level", default="info")
    args["plot"] = bool(request.args.get("plot", default=False))

    return args


if __name__ == "__main__":
    app.run(debug=True)
