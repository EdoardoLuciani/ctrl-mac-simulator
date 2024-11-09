# Fix for rye that does not load the src directory as a path
import simpy, random, logging, argparse, sys, pathlib
sys.path.insert(0, pathlib.Path(__file__).parents[1].as_posix())


from ctrl_mac_simulator.simulation.stat_tracker import StatTracker
from ctrl_mac_simulator.simulation.devices import Sensor, Gateway
from ctrl_mac_simulator.visual.manim_main_scene import ManimMainScene
from ctrl_mac_simulator.visual.components.left_sidebar import LeftSidebar
from ctrl_mac_simulator.visual.components.visual_gateway import VisualGateway
from ctrl_mac_simulator.visual.components.visual_sensors import VisualSensors
from ctrl_mac_simulator.global_logger_memory_handler import GlobalLoggerMemoryHandler


def configure_parser_and_get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Simulate the Ctrl-Mac protocol")

    # Simulation Settings
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
        help="Sets how many sensors the simulation should have",
    )
    parser.add_argument(
        "--sensors-measurement-chance",
        dest="sensors_measurement_chance",
        type=float,
        default=1,
        help="Sets how often the sensors sense new data when in idle state",
    )

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

    # Misc Settings
    parser.add_argument("--log", dest="log_level", default="info", choices=["info", "debug"], help="Set the log level")
    parser.add_argument("--seed", dest="seed", type=int, help="Set the random seed for reproducible results")
    parser.add_argument("--plot", dest="plot", action="store_true", help="Enable plotting of ftr and latency")
    parser.add_argument("--version", action="version", version="%(prog)s 1.0")

    args = parser.parse_args()

    return args


if __name__ == "__main__":
    args = configure_parser_and_get_args()

    logging.basicConfig(level=getattr(logging, args.log_level.upper()))

    global_logger_memory_handler = GlobalLoggerMemoryHandler()
    logging.getLogger().addHandler(global_logger_memory_handler)

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

        def event_loop(visual_gateway: VisualGateway, visual_sensors: VisualSensors, left_sidebar: LeftSidebar):
            log_idx = 0
            while env.peek() < float("inf"):
                env.step()
                left_sidebar.update_timer(env.now)

                if global_logger_memory_handler.match_events_in_sublist(
                    "Finished RequestReplyMessage transmission", log_idx
                ):
                    visual_sensors.play_queued_animations()
                    left_sidebar.add_row(
                        [request_slot.state for request_slot in gateway._rrm.request_slots] + [str(gateway._rrm.ftr)]
                    )
                    visual_gateway.display_rrm()

                if logger_names := global_logger_memory_handler.match_events_in_sublist(
                    "Data is available, syncing to next RRM for transmission request", log_idx
                ):
                    for logger_name in logger_names:
                        visual_sensors.queue_sensor_color_change(int(logger_name.split("-")[1]), 0.33)

                if global_logger_memory_handler.match_events_in_sublist(
                    "Finished TransmissionRequestMessage transmission", log_idx
                ):
                    message = gateway._transmission_request_messages.items[-1]
                    visual_sensors.queue_transmission_request_message(message.sensor_id, message.chosen_request_slot)
                    visual_sensors.queue_sensor_color_change(message.sensor_id, 0.66)

                if global_logger_memory_handler.match_events_in_sublist(
                    "Finished SensorMeasurementMessage transmission", log_idx
                ):
                    message = gateway._sensor_data_messages.items[-1]
                    visual_sensors.queue_data_transmission(message.sensor_id)
                    visual_sensors.queue_sensor_color_change(message.sensor_id, 0)

                log_idx = len(global_logger_memory_handler.log)

        scene.set_params(args.sensor_count, args.request_slots, event_loop)
        scene.render(preview=args.video == "show")
    else:
        env.run()

    if args.plot:
        StatTracker.plot_measurements()
