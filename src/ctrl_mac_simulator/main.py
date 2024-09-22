import simpy, random, logging

from ctrl_mac_simulator.messages import RequestReplyMessage
from ctrl_mac_simulator.airtime import get_lora_airtime
from ctrl_mac_simulator.devices import Sensor, Actuator, Gateway

logging.basicConfig(level=logging.INFO)

# Set up and run the simulation
env = simpy.Environment()

gateway = Gateway(env)
sensors = [Sensor(env, i, gateway.get_rrm_message_event) for i in range(3)]

env.run(until=10)
