from manim import *

class RRMTable():
    def __init__(self, scene):
        self._scene = scene

        # Create timer
        self._time = 0
        self._timer = Text(f"Time: {self._time:.2f}s", font_size=24).to_corner(UL)


        # Create the table for keeping track of the events
        self._table = Table(
            [["This", "is a"],
            ["simple", "Table in \n Manim."]]).scale(0.3).next_to(self._timer, DOWN)

        self._scene.play(FadeIn(self._timer), FadeIn(self._table))


    def update_timer(self, dt):
        self._time += dt
        new_timer = Text(f"Time: {self._time:.2f}s", font_size=24).to_corner(UL)
        self._scene.play(Transform(self._timer, new_timer), run_time=0.1)
