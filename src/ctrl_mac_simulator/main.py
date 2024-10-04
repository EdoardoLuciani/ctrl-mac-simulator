from ctrl_mac_simulator.visual.components.left_sidebar import LeftSidebar
from ctrl_mac_simulator.visual.components.visual_gateway import VisualGateway
from ctrl_mac_simulator.visual.components.visual_sensor import VisualSensors
import simpy, random, logging, argparse, random, sys, pathlib

# Fix for rye that does not load the src directory as a path
sys.path.insert(0, pathlib.Path(__file__).parents[1].as_posix())

from ctrl_mac_simulator.simulation.messages import RequestReplyMessage
from ctrl_mac_simulator.simulation.devices import Sensor, Actuator, Gateway
from ctrl_mac_simulator.visual.main_manim import ManimMainScene


def configure_parser_and_get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Simulate the Ctrl-Mac protocol")

    # Simulation params
    parser.add_argument(
        "--data-channels",
        dest="data_channels",
        type=int,
        default=3,
        help="Sets how many data channels are available for data transmission",
    )
    parser.add_argument(
        "--data-slots-per-channel",
        dest="data_slots_per_channel",
        type=int,
        default=2,
        help="Sets how many data slots each channel have",
    )
    parser.add_argument(
        "--request-slots",
        dest="request_slots",
        type=int,
        default=6,
        help="Sets how many requests slots the RRM message has",
    )
    parser.add_argument(
        "--rrm-period",
        dest="rrm_period",
        type=float,
        default=0.5,
        help="How often (in seconds) to send an rrm message",
    )
    parser.add_argument(
        "--max-cycles",
        dest="max_cycles",
        type=int,
        default=5,
        help="Sets how many RRM messages to send before simulation stops",
    )
    parser.add_argument(
        "--sensor-count",
        dest="sensor_count",
        type=int,
        default=6,
        help="Sets how sensors the simulation should have",
    )
    parser.add_argument(
        "--sensors-measurement-chance",
        dest="sensors_measurement_chance",
        type=float,
        default=1,
        help="Sets how often the sensors sense new data when in idle state",
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

    gateway = Gateway(
        env, args.data_channels, args.data_slots_per_channel, args.request_slots, args.rrm_period, args.max_cycles
    )
    sensors = [
        Sensor(
            env,
            i,
            args.sensors_measurement_chance,
            gateway.rrm_message_event,
            gateway.transmission_request_messages,
            gateway.sensor_data_messages,
        )
        for i in range(args.sensor_count)
    ]

    if args.video:
        import manim
        manim.config.quality = args.video_quality
        scene = ManimMainScene()

        def event_loop(gateway: VisualGateway, sensors: VisualSensors, left_sidebar: LeftSidebar):
            gateway.display_rrm()

            left_sidebar.update_timer(1)
            left_sidebar.add_row(list(map(str, range(args.request_slots + 1))))

            # Transmission request animation
            for i in range(args.sensor_count):
                if i % 2 == 0:
                    sensors.display_transmission_request_message(i)
                    sensors.display_data_transmission(i)

        scene.set_params(args.sensor_count, args.request_slots, event_loop)
        scene.render(preview=args.video == "show")
    else:
        env.run()
