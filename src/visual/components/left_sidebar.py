from manim import *


class _RRMTable():
    def __init__(self, request_slots: int, down_from: Mobject):
        # Create the table for keeping track of the events
        self._table = Table(
            [["FTR"] + [f"Slot {i}" for i in range(request_slots)],
                ['dunno' for i in range(request_slots + 1)]]).scale(0.3).next_to(down_from, DOWN).to_edge(LEFT)
        self._table.add_highlighted_cell((2,2), color=GREEN)

    @property
    def object(self):
        return self._table


class _Timer():
    def __init__(self):
        # Create the table for keeping track of the events
        self._time = 0
        self._text = self._get_timer_text()

    @property
    def object(self):
        return self._text

    def update_timer(self, dt, scene):
        self._time += dt
        scene.play(Transform(self._text, self._get_timer_text()), run_time=0.1)

    def _get_timer_text(self):
        return Text(f"Time: {self._time:.2f}s", font_size=24).to_corner(UL)



class LeftSidebar():
    def __init__(self, scene):
        self._scene = scene

        # Create timer
        self._timer = _Timer()

        self._rrm_table = _RRMTable(3, self._timer._text)

        self._scene.play(FadeIn(self._timer.object), FadeIn(self._rrm_table.object))

    def update_timer(self, dt):
        self._timer.update_timer(dt, self._scene)
