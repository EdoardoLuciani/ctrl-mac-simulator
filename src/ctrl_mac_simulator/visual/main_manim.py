from typing import Tuple, Callable
from manim import *
from ctrl_mac_simulator.visual.components import LeftSidebar
from ctrl_mac_simulator.visual.components.visual_gateway import VisualGateway
from ctrl_mac_simulator.visual.components.visual_sensors import VisualSensors


class ManimMainScene(Scene):
    def set_params(self, sensor_count: int, request_slots: int, event_loop_fn: Callable[[VisualGateway, VisualSensors, LeftSidebar], None]):
        self.sensor_count = sensor_count
        self.request_slots = request_slots
        self.event_loop_fn = event_loop_fn

    def construct(self):
        gateway_center = np.array((3, 0, 0))
        sensors_arrangement_radius = 3.8

        self._gateway = VisualGateway(self, gateway_center, sensors_arrangement_radius)
        self._sensors = VisualSensors(self, self.sensor_count, sensors_arrangement_radius, self._gateway.object)
        self._left_sidebar = LeftSidebar(self, self.request_slots)

        self.event_loop_fn(self._gateway, self._sensors, self._left_sidebar)
