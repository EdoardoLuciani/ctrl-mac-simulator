import logging, re
from typing import List, Pattern, Optional


class GlobalLoggerMemoryHandler(logging.Handler):
    def __init__(self):
        super().__init__()
        self.logs = []

    def emit(self, record: logging.LogRecord):
        self.logs.append(f"{record.name}: {(record.msg)}")

    def match_events_in_sublist(self, pattern: str, starting_idx: int) -> Optional[str]:
        matches = list(map(lambda x: x.group(1), filter(lambda x: x is not None, [re.search(f"([^:]+): Time [0-9]*.[0-9]*: {pattern}", item) for item in self.logs[starting_idx:]])))
        return matches if matches else None
