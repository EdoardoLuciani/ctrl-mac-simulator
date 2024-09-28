from typing import Tuple
from manim import *

class CreateCircle(Scene):
    def setup_scene(self, num_sensors, sensor_radius) -> Tuple[Circle, VGroup]:
        # Create gateway
        gateway = Circle(radius=0.3, color=BLUE)
        gateway.to_edge(ORIGIN)

        gateway_label = Text("Gateway", font_size=16).next_to(gateway, DOWN)
        self.play(Create(gateway), Write(gateway_label))


        # Create sensors in a circular arrangement
        angle = TAU / num_sensors  # Angle between each sensor

        sensors = VGroup()
        sensor_labels = VGroup()

        for i in range(num_sensors):
            sensor = Circle(radius=0.2, color=RED)
            sensor.move_to(sensor_radius * np.array([np.cos(i * angle), np.sin(i * angle), 0]))
            sensors.add(sensor)

            label = Text(f"S{i}", font_size=16, color=RED).move_to(sensor.get_center())
            sensor_labels.add(label)

        self.play(Create(sensors), FadeIn(sensor_labels))

        return gateway, sensors


    def display_rrm(self, sensor_radius):
        expanding_circle = Circle(radius=0)
        expanding_circle.move_to(self._gateway.get_center())

        def update_circle(c, alpha):
            c.become(Circle(radius=sensor_radius * alpha, color=YELLOW, stroke_opacity=0.5))

        self.play(UpdateFromAlphaFunc(expanding_circle, update_circle, run_time=1))
        self.play(FadeOut(expanding_circle))


    def construct(self):
        sensor_radius = 4

        self._gateway, self._sensors = self.setup_scene(5, sensor_radius)

        self.display_rrm(sensor_radius)


        # Transmission request animation
        for i in range(len(self._sensors)):
            if i % 2 == 0:  # Only some sensors send requests
                req_arrow = Arrow(self._sensors[i].get_center(), self._gateway.get_center(), buff=0.3, color=YELLOW)
                req_label = Text("Request", font_size=16, color=YELLOW).next_to(req_arrow, LEFT)
                self.play(GrowArrow(req_arrow), Write(req_label))
                self.wait(0.5)
                self.play(FadeOut(req_arrow), FadeOut(req_label))

        self.wait(2)


if __name__ == "__main__":
    config.quality = 'low_quality'

    scene = CreateCircle()
    scene.render(preview=True)
