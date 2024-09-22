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
