import simpy, random, logging, argparse

from ctrl_mac_simulator.messages import RequestReplyMessage
from ctrl_mac_simulator.utils.airtime import get_lora_airtime
from ctrl_mac_simulator.devices import Sensor, Actuator, Gateway

parser = argparse.ArgumentParser(description='Simulate the Ctrl-Mac protocol')
parser.add_argument('--log', dest='loglevel', default='INFO', help='Set the log level')
args = parser.parse_args()

logging.basicConfig(level=getattr(logging, args.loglevel.upper()))


# Set up and run the simulation
env = simpy.Environment()

gateway = Gateway(env)
sensors = [Sensor(env, i, gateway.get_rrm_message_event, gateway.get_sensor_messages_queue()) for i in range(3)]

env.run(until=3)
