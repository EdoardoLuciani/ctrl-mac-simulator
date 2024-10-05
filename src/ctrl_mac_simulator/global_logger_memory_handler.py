import logging, re
from typing import List, Pattern


class GlobalLoggerMemoryHandler(logging.Handler):
    def __init__(self):
        super().__init__()
        self.logs = []

    def emit(self, record):
        self.logs.append(self.format(record))

    def match_event_in_sublist(self, pattern: str, starting_idx: int) -> int:
        return any(re.search(f"Time [0-9]*.[0-9]*: {pattern}", item) for item in self.logs[starting_idx:])
