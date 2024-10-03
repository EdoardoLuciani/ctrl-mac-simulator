import simpy, random, logging, argparse, random, sys, pathlib

from src.ctrl_mac_simulator.visual.main_manim import ManimMainScene

# Fix for rye that does not load the src directory as a path
sys.path.insert(0, pathlib.Path(__file__).parents[1].as_posix())

from ctrl_mac_simulator.simulation.messages import RequestReplyMessage
from ctrl_mac_simulator.simulation.devices import Sensor, Actuator, Gateway


def configure_parser_and_get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Simulate the Ctrl-Mac protocol")

    # Simulation params
    parser.add_argument(
        "--max-cycles",
        dest="max_cycles",
        type=int,
        default=5,
        help="Sets how many RRM messages to send before simulation stops",
    )

    # Misc Params
    parser.add_argument("--log", dest="log_level", default="info", choices=["info", "debug"], help="Set the log level")
    parser.add_argument("--seed", dest="seed", type=int, help="Set the random seed for reproducible results")

    # Video Settings
    parser.add_argument(
        "--video",
        dest="video",
        default=None,
        choices=["render", "show"],
        help="Enable to render or show the manim simulation",
    )
    parser.add_argument(
        "--video-quality",
        dest="video_quality",
        default="low_quality",
        choices=["low_quality", "medium_quality", "high_quality", "production_quality"],
        help="If video output is enabled, sets the quality of the rendered manim simulation",
    )
    parser.add_argument("--version", action="version", version="%(prog)s 1.0")
    return parser.parse_args()

if __name__ == "__main__":
    args = configure_parser_and_get_args()

    logging.basicConfig(level=getattr(logging, args.log_level.upper()))

    # Set seed for deterministic runs
    if args.seed is not None:
        random.seed(args.seed)

    # Set up and run the simulation
    env = simpy.Environment()

    gateway = Gateway(env, 3, 2, 6, 0.5, args.max_cycles)
    sensors = [
        Sensor(env, i, 1, gateway.rrm_message_event, gateway.transmission_request_messages, gateway.sensor_data_messages)
        for i in range(6)
    ]

    env.run()

    if args.video:
        import manim

        manim.config.quality = args.video_quality

        scene = ManimMainScene()
        scene.render(preview=True)
