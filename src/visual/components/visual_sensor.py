from manim import *

class VisualSensors():
    def __init__(self, scene: Scene, num_sensors, sensor_radius, gateway_center):
        self._scene = scene
        self._gateway_center = gateway_center

        # Create sensors in a circular arrangement
        angle = TAU / num_sensors  # Angle between each sensor

        self._sensors = VGroup()
        sensor_labels = VGroup()

        for i in range(num_sensors):
            sensor = Circle(radius=0.2, color=RED)
            sensor.move_to(sensor_radius * np.array([np.cos(i * angle), np.sin(i * angle), 0]) + gateway_center)
            self._sensors.add(sensor)

            label = Text(f"S{i}", font_size=16, color=RED).move_to(sensor.get_center())
            sensor_labels.add(label)

        scene.play(Create(self._sensors), FadeIn(sensor_labels))

    def display_transmission_request_message(self, sensor_id):
        req_arrow = Arrow(self._sensors[sensor_id].get_center(), self._gateway_center, buff=0.3, color=YELLOW)
        req_label = Text("Request", font_size=16, color=YELLOW).next_to(req_arrow, LEFT)
        self._scene.play(GrowArrow(req_arrow), Write(req_label))
        self._scene.wait(0.5)
        self._scene.play(FadeOut(req_arrow), FadeOut(req_label))
