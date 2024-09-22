import simpy
import random


class Sensor:
    def __init__(self, env, id):
        self.env = env
        self.id = id
        self.env.process(self.run())

    def run(self):
        while True:
            # Simulate sensor reading and transmission
            yield self.env.timeout(random.uniform(5, 15))
            print(f"Time {self.env.now:.2f}: Sensor {self.id} sending data")


class Actuator:
    def __init__(self, env, id):
        self.env = env
        self.id = id
        self.env.process(self.run())

    def run(self):
        while True:
            # Simulate actuator receiving commands and acting
            yield self.env.timeout(random.uniform(10, 20))
            print(f"Time {self.env.now:.2f}: Actuator {self.id} performing action")


class Gateway:
    def __init__(self, env):
        self.env = env
        self.env.process(self.run())

    def run(self):
        while True:
            # Simulate gateway operations
            yield self.env.timeout(1)
            print(f"Time {self.env.now:.2f}: Gateway processing data")


# Set up and run the simulation
env = simpy.Environment()
sensors = [Sensor(env, i) for i in range(3)]
actuators = [Actuator(env, i) for i in range(2)]
gateway = Gateway(env)

env.run(until=100)
