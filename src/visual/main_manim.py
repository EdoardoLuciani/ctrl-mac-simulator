from typing import Tuple
from manim import *
from visual.components import LeftSidebar
from visual.components.visual_gateway import VisualGateway
from visual.components.visual_sensor import VisualSensors


class CreateCircle(Scene):
    def construct(self):
        gateway_center = np.array((3, 0, 0))
        sensors_count = 5
        sensors_arrangement_radius = 3.8
        request_slots = 7

        self._gateway = VisualGateway(self, gateway_center)
        self._sensors = VisualSensors(self, sensors_count, sensors_arrangement_radius, self._gateway.object)
        self._left_sidebar = LeftSidebar(self, request_slots)

        self._gateway.display_rrm(sensors_arrangement_radius)

        self._left_sidebar.update_timer(1)
        self._left_sidebar.add_row(list(map(str, range(request_slots + 1))))

        # Transmission request animation
        for i in range(sensors_count):
            if i % 2 == 0:
                self._sensors.display_transmission_request_message(i)
                self._sensors.display_data_transmission(i)

        self.wait(2)


if __name__ == "__main__":
    config.quality = "low_quality"

    scene = CreateCircle()
    scene.render(preview=True)
