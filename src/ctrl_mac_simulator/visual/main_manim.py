from typing import Tuple
from manim import *
from ctrl_mac_simulator.visual.components import LeftSidebar
from ctrl_mac_simulator.visual.components.visual_gateway import VisualGateway
from ctrl_mac_simulator.visual.components.visual_sensor import VisualSensors


class ManimMainScene(Scene):
    def set_params(self, sensor_count, request_slots):
        self.sensor_count = sensor_count
        self.request_slots = request_slots

    def construct(self):
        gateway_center = np.array((3, 0, 0))
        sensors_arrangement_radius = 3.8

        self._gateway = VisualGateway(self, gateway_center)
        self._sensors = VisualSensors(self, self.sensor_count, sensors_arrangement_radius, self._gateway.object)
        self._left_sidebar = LeftSidebar(self, self.request_slots)

        self._gateway.display_rrm(sensors_arrangement_radius)

        self._left_sidebar.update_timer(1)
        self._left_sidebar.add_row(list(map(str, range(self.request_slots + 1))))

        # Transmission request animation
        for i in range(self.sensor_count):
            if i % 2 == 0:
                self._sensors.display_transmission_request_message(i)
                self._sensors.display_data_transmission(i)

        self.wait(2)
