import simpy, random, logging, argparse, random

from ctrl_mac_simulator.simulation.messages import RequestReplyMessage
from ctrl_mac_simulator.simulation.devices import Sensor, Actuator, Gateway

parser = argparse.ArgumentParser(description="Simulate the Ctrl-Mac protocol")

# Simulation params
parser.add_argument("--max-cycles", dest="max_cycles", type=int, default=5, help="Sets how many RRM messages to send before simulation stops")

# Misc Params
parser.add_argument("--log", dest="log_level", default="info", choices=["info", "debug"], help="Set the log level")
parser.add_argument("--seed", dest="seed", type=int, help="Set the random seed for reproducible results")
parser.add_argument("--video", dest="video", default=None, choices=["render", "show"], help="Enable to render or show the manim simulation")
parser.add_argument('--version', action='version', version='%(prog)s 1.0')

args = parser.parse_args()

logging.basicConfig(level=getattr(logging, args.log_level.upper()))

# Set seed for deterministic runs
if args.seed is not None:
    # 834 is our testing number
    random.seed(args.seed)

# Set up and run the simulation
env = simpy.Environment()

gateway = Gateway(env, 3, 2, 6, 0.5, args.max_cycles)
sensors = [
    Sensor(env, i, 1, gateway.rrm_message_event, gateway.transmission_request_messages, gateway.sensor_data_messages)
    for i in range(6)
]

env.run()
