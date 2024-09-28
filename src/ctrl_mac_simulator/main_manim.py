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


        # Time counter
        self._time = 0
        self._timer = Text(f"Time: {self._time:.2f}s", font_size=24).to_corner(UL)


        # Create the table for keeping track of the events
        self._table = Table(
            [["This", "is a"],
            ["simple", "Table in \n Manim."]]).scale(0.3).next_to(self._timer, DOWN)


        self.play(Create(sensors), FadeIn(sensor_labels))
        self.play(FadeIn(self._timer), FadeIn(self._table))

        return gateway, sensors


    def display_rrm(self, sensor_radius):
        expanding_circle = Circle(radius=sensor_radius, color=YELLOW, stroke_opacity=0.5)
        expanding_circle.move_to(self._gateway.get_center())
        self.play(GrowFromCenter(expanding_circle, run_time=1))
        self.play(FadeOut(expanding_circle))


    def display_transmission_request_message(self, sensor_id):
        req_arrow = Arrow(self._sensors[sensor_id].get_center(), self._gateway.get_center(), buff=0.3, color=YELLOW)
        req_label = Text("Request", font_size=16, color=YELLOW).next_to(req_arrow, LEFT)
        self.play(GrowArrow(req_arrow), Write(req_label))
        self.wait(0.5)
        self.play(FadeOut(req_arrow), FadeOut(req_label))

    def update_timer(self, dt):
        self._time += dt
        new_timer = Text(f"Time: {self._time:.2f}s", font_size=24).to_corner(UL)
        self.play(Transform(self._timer, new_timer), run_time=0.1)


    def construct(self):
        sensor_radius = 4

        self._gateway, self._sensors = self.setup_scene(5, sensor_radius)

        self.display_rrm(sensor_radius)

        self.update_timer(1)

        # Transmission request animation
        for i in range(len(self._sensors)):
            if i % 2 == 0:
                self.display_transmission_request_message(i)

        self.wait(2)


if __name__ == "__main__":
    config.quality = 'low_quality'

    scene = CreateCircle()
    scene.render(preview=True)
