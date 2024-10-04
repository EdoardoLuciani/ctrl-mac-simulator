from manim import *


class VisualGateway:
    def __init__(self, scene: Scene, gateway_position, sensor_radius: float):
        self._scene = scene
        self._sensor_radius = sensor_radius

        self._gateway = Circle(radius=0.3, color=BLUE).move_to(gateway_position)
        gateway_label = Text("Gateway", font_size=16).next_to(self._gateway, DOWN)

        scene.play(Create(self._gateway), Write(gateway_label))

    @property
    def object(self):
        return self._gateway

    def display_rrm(self):
        expanding_circle = Circle(radius=self._sensor_radius, color=YELLOW, stroke_opacity=0.5).move_to(
            self._gateway.get_center()
        )

        text = Text(f"RRM", color=YELLOW, font_size=24).move_to(self._gateway.get_center())
        text_dst = text.copy().move_to((UL / np.linalg.norm(UL)))

        self._scene.play(GrowFromCenter(expanding_circle, run_time=1), Transform(text, text_dst, run_time=1))
        self._scene.play(FadeOut(expanding_circle), FadeOut(text))
