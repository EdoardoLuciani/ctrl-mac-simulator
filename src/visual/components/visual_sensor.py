from manim import *
from manim.utils.bezier import Point3D
from typing import Tuple

class VisualSensors():
    def __init__(self, scene: Scene, num_sensors: int, sensor_radius: float, gateway_object: Mobject):
        self._scene = scene
        self._gateway_object = gateway_object

        # Create sensors in a circular arrangement
        angle = TAU / num_sensors  # Angle between each sensor

        self._sensors = VGroup()
        sensor_labels = VGroup()

        for i in range(num_sensors):
            sensor = Circle(radius=0.2, color=RED)
            sensor.move_to(sensor_radius * np.array([np.cos(i * angle), np.sin(i * angle), 0]) + gateway_object.get_center())
            self._sensors.add(sensor)

            label = Text(f"S{i}", font_size=16, color=RED).move_to(sensor.get_center())
            sensor_labels.add(label)

        scene.play(Create(self._sensors), FadeIn(sensor_labels))


    @property
    def object(self):
        return self._sensors


    def display_transmission_request_message(self, sensor_id: int):
        start_pos, end_pos = self._get_start_and_end_pos_for_transmission(sensor_id)
        self._move_object_between_points(start_pos, end_pos, Dot())


    def display_data_transmission(self, sensor_id: int):
        start_pos, end_pos = self._get_start_and_end_pos_for_transmission(sensor_id)

        end_dir = end_pos - self._gateway_object.get_center()
        angle = np.arctan2(end_dir[1], end_dir[0]) + PI

        triangle = Triangle(radius=0.2, fill_color=PURPLE, color=PURPLE, fill_opacity=0.5, start_angle=angle)

        self._move_object_between_points(start_pos, end_pos, triangle)


    def _get_start_and_end_pos_for_transmission(self, sensor_id: int) -> Tuple[Point3D, Point3D]:
        sensor_to_gateway = (self._gateway_object.get_center() - self._sensors[sensor_id].get_center())
        sensor_to_gateway /= np.linalg.norm(sensor_to_gateway)

        start_pos = self._sensors[sensor_id].get_center() + sensor_to_gateway * (self._sensors[sensor_id].width / 2)
        end_pos = self._gateway_object.get_center() - sensor_to_gateway * (self._gateway_object.width / 2)

        return start_pos, end_pos


    def _move_object_between_points(self, pos0, pos1, object: Mobject):
        object.move_to(pos0)
        object1 = object.copy().move_to(pos1)

        self._scene.play(Transform(object, object1))
        self._scene.play(FadeOut(object))
