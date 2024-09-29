from manim import *


class RRMTable():
    def __init__(self, request_slots: int, down_from: Mobject):
        # Create the table for keeping track of the events
        self.table = Table(
            [["FTR"] + [f"Slot {i}" for i in range(request_slots)],
                ['dunno' for i in range(request_slots + 1)]]).scale(0.3).next_to(down_from, DOWN)
        self.table.add_highlighted_cell((2,2), color=GREEN)


class Timer():
    def __init__(self):
        # Create the table for keeping track of the events
        self._time = 0
        self.text = self._get_timer_text()

    def update_timer(self, dt, scene):
        self._time += dt
        scene.play(Transform(self.text, self._get_timer_text()), run_time=0.1)

    def _get_timer_text(self):
        return Text(f"Time: {self._time:.2f}s", font_size=24).to_corner(UL)



class LeftSidebar():
    def __init__(self, scene):
        self._scene = scene

        # Create timer
        self._timer = Timer()

        self._rrm_table = RRMTable(5, self._timer.text)

        self._scene.play(FadeIn(self._timer.text), FadeIn(self._rrm_table.table))

    def update_timer(self, dt):
        self._timer.update_timer(dt, self._scene)
