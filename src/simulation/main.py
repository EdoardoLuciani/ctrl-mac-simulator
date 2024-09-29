import simpy, random, logging, argparse

from simulation.messages import RequestReplyMessage
from simulation.devices import Sensor, Actuator, Gateway

parser = argparse.ArgumentParser(description="Simulate the Ctrl-Mac protocol")
parser.add_argument("--log", dest="loglevel", default="INFO", help="Set the log level")
args = parser.parse_args()

logging.basicConfig(level=getattr(logging, args.loglevel.upper()))


# Set up and run the simulation
env = simpy.Environment()

gateway = Gateway(env, 3, 2, 6, 0.5, 3)
sensors = [
    Sensor(env, i, 1, gateway.rrm_message_event, gateway.transmission_request_messages, gateway.sensor_data_messages)
    for i in range(6)
]

env.run()
