from manim import *


class _RRMTable:
    def __init__(self, request_slots: int, down_from: Mobject):
        self._down_from = down_from
        self._array = [[f"Slot {i}" for i in range(request_slots)] + ["FTR"]]
        self._table = self._get_table()

    @property
    def object(self):
        return self._table

    def add_row(self, new_row: List) -> Animation:
        assert len(new_row) == len(self._array[0])
        self._array.append(new_row)
        return Transform(self.object, self._get_table())

    def _get_table(self):
        table = Table(self._array, h_buff=0.5).scale(0.2).next_to(self._down_from, DOWN).to_edge(LEFT)

        for row_idx, row in enumerate(self._array):
            for col_idx, value in enumerate(row):
                current_cell = (row_idx + 1, col_idx + 1)
                if value == 'no_contention':
                    table.add_highlighted_cell(current_cell, color=GREEN)
                elif value == 'contention':
                    table.add_highlighted_cell(current_cell, color=RED)

        return table


class _Timer:
    def __init__(self):
        # Create the table for keeping track of the events
        self._time = 0
        self._text = self._get_timer_text()

    @property
    def object(self):
        return self._text

    def update_timer(self, dt) -> Animation:
        self._time = dt
        return Transform(self.object, self._get_timer_text())

    def _get_timer_text(self):
        return Text(f"Time: {self._time:.2f}s", font_size=24).to_corner(UL)


class LeftSidebar:
    def __init__(self, scene, request_slots):
        self._scene = scene

        # Create timer
        self._timer = _Timer()

        self._rrm_table = _RRMTable(request_slots, self._timer._text)

        self._scene.play(FadeIn(self._timer.object), FadeIn(self._rrm_table.object))

    def update_timer(self, dt):
        self._scene.play(self._timer.update_timer(dt), run_time=0.1)

    def add_row(self, new_row):
        self._scene.play(self._rrm_table.add_row(new_row), run_time=0.1)
