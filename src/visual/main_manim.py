from typing import Tuple
from manim import *
from visual.components import LeftSidebar
from visual.components.visual_gateway import VisualGateway


class CreateCircle(Scene):
    def setup_scene(self, num_sensors, sensor_radius, gateway_position) -> VGroup:

        # Create sensors in a circular arrangement
        angle = TAU / num_sensors  # Angle between each sensor

        sensors = VGroup()
        sensor_labels = VGroup()

        for i in range(num_sensors):
            sensor = Circle(radius=0.2, color=RED)
            sensor.move_to(sensor_radius * np.array([np.cos(i * angle), np.sin(i * angle), 0]) + gateway_position)
            sensors.add(sensor)

            label = Text(f"S{i}", font_size=16, color=RED).move_to(sensor.get_center())
            sensor_labels.add(label)

        self.play(Create(sensors), FadeIn(sensor_labels))

        return sensors


    def display_transmission_request_message(self, sensor_id, sensor_center):
        req_arrow = Arrow(self._sensors[sensor_id].get_center(), sensor_center, buff=0.3, color=YELLOW)
        req_label = Text("Request", font_size=16, color=YELLOW).next_to(req_arrow, LEFT)
        self.play(GrowArrow(req_arrow), Write(req_label))
        self.wait(0.5)
        self.play(FadeOut(req_arrow), FadeOut(req_label))


    def construct(self):
        sensor_radius = 3.8
        request_slots = 7
        gateway_center = np.array((3, 0, 0))

        self._gateway = VisualGateway(self, gateway_center)
        self._sensors = self.setup_scene(5, sensor_radius, gateway_center)
        self._left_sidebar = LeftSidebar(self, request_slots)

        self._gateway.display_rrm(sensor_radius)

        self._left_sidebar.update_timer(1)
        self._left_sidebar.add_row(list(map(str, range(request_slots + 1))))

        # Transmission request animation
        for i in range(len(self._sensors)):
            if i % 2 == 0:
                self.display_transmission_request_message(i, gateway_center)

        self.wait(2)


if __name__ == "__main__":
    config.quality = "low_quality"

    scene = CreateCircle()
    scene.render(preview=True)
