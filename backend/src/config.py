import argparse, logging, random, os
from pydantic import BaseModel, Field
from pydantic.functional_validators import field_validator, model_validator

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
        "--request-slots",
        dest="request_slots",
        type=int,
        default=6,
        help="Sets how many requests slots the RRM message has",
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
    parser.add_argument(
        "--sensor-data-payload-size",
        dest="sensor_data_payload_size",
        type=int,
        default=12,
        help="Sets the size of the payload for the sensor data",
    )

    # Misc Settings
    parser.add_argument("--log-level", dest="log_level", default="info", choices=["info", "debug"], help="Set the log level")
    parser.add_argument("--seed", dest="seed", type=int, help="Set the random seed for reproducible results")

    # Web Server Settings
    parser.add_argument("--server", action="store_true", help="Run as web server")
    parser.add_argument("--host",type=str, default="127.0.0.1", help="Host address to bind to")
    parser.add_argument("--port", type=int, default=5000, help="Port for web server")
    parser.add_argument("--workers", type=int, default=1, help="Number of worker processes")
    parser.add_argument("--no-reload", dest="reload", action="store_false", default=True, help="Disable auto-reload for development")


    return parser.parse_args()


class SimulationParams(BaseModel):
    data_channels: int = Field(..., gt=0, description="Number of data channels available")
    request_slots: int = Field(..., gt=0, description="Number of request slots in RRM message")
    max_cycles: int = Field(..., gt=0, description="Maximum number of RRM cycles")
    sensor_count: int = Field(..., gt=0, description="Number of sensors")
    sensors_measurement_chance: float = Field(..., ge=0, le=1, description="Probability of sensor measurement")
    sensor_data_payload_size: int = Field(..., gt=0, description="Size of sensor data payload")
    log_level: str = Field(..., pattern="^(info|debug)$", description="Logging level")
    seed: int | None = Field(None, description="Random seed for reproducibility")

    @model_validator(mode='after')
    def set_random_seed(self) -> 'SimulationParams':
        if self.seed is None:
            self.seed = str(int.from_bytes(os.urandom(4), 'big'))
        self.seed = str(self.seed)  # Ensure seed is string
        random.seed(self.seed)
        return self

    @field_validator('sensors_measurement_chance')
    def validate_measurement_chance(cls, v):
        if not 0 <= v <= 1:
            raise ValueError('sensors_measurement_chance must be between 0 and 1')
        return v

    @field_validator('log_level')
    def validate_log_level(cls, v):
        if v.lower() not in ['info', 'debug']:
            raise ValueError('log_level must be either "info" or "debug"')
        return getattr(logging, v.upper())
