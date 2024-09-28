from manim import *

class CreateCircle(Scene):
    def construct(self):
        # Create gateway
        gateway = Circle(radius=0.25, color=BLUE)
        gateway.to_edge(ORIGIN)

        gateway_label = Text("Gateway", font_size=16).next_to(gateway, DOWN)
        self.play(Create(gateway), Write(gateway_label))


        # Create sensors in a circular arrangement
        num_sensors = 5
        radius = 3.5  # Radius of the circle on which sensors will be placed
        angle = TAU / num_sensors  # Angle between each sensor

        sensors = VGroup()
        sensor_labels = VGroup()

        for i in range(num_sensors):
            sensor = Circle(radius=0.15, color=RED)
            sensor.move_to(radius * np.array([np.cos(i * angle), np.sin(i * angle), 0]))
            sensors.add(sensor)

            label = Text(f"S{i}", font_size=16).next_to(sensor, (sensor.get_center() - ORIGIN)*0.2)
            sensor_labels.add(label)

        self.play(Create(sensors), Write(sensor_labels))


        # Add expanding circle animation
        expanding_circle = Circle(radius=0)
        expanding_circle.move_to(gateway.get_center())

        def update_circle(c, alpha):
            c.become(Circle(radius=radius * alpha, color=YELLOW, stroke_opacity=0.5))

        self.play(UpdateFromAlphaFunc(expanding_circle, update_circle, run_time=1))
        self.play(FadeOut(expanding_circle))

        # Transmission request animation
        for i in range(num_sensors):
            if i % 2 == 0:  # Only some sensors send requests
                req_arrow = Arrow(sensors[i].get_center(), gateway.get_center(), buff=0.3, color=YELLOW)
                req_label = Text("Request", font_size=16, color=YELLOW).next_to(req_arrow, LEFT)
                self.play(GrowArrow(req_arrow), Write(req_label))
                self.wait(0.5)
                self.play(FadeOut(req_arrow), FadeOut(req_label))

        self.wait(2)


if __name__ == "__main__":
    config.quality = 'low_quality'

    scene = CreateCircle()
    scene.render(preview=True)
