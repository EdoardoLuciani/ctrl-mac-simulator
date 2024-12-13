import argparse

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

    # Misc Settings
    parser.add_argument("--log", dest="log_level", default="info", choices=["info", "debug"], help="Set the log level")
    parser.add_argument("--seed", dest="seed", type=int, help="Set the random seed for reproducible results")

    # Web Server Settings
    parser.add_argument("--server", action="store_true", help="Run as web server")
    parser.add_argument("--host",type=str, default="127.0.0.1", help="Host address to bind to")
    parser.add_argument("--port", type=int, default=5000, help="Port for web server")
    parser.add_argument("--workers", type=int, default=1, help="Number of worker processes")
    parser.add_argument("--no-reload", dest="reload", action="store_false", default=True, help="Disable auto-reload for development")


    return parser.parse_args()
