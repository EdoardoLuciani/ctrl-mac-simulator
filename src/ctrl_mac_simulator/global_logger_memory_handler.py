import logging, re
from typing import List, Pattern, Optional


class GlobalLoggerMemoryHandler(logging.Handler):
    def __init__(self):
        super().__init__()
        self.logs = []

    def emit(self, record: logging.LogRecord):
        self.logs.append(f"{record.name}: {(record.msg)}")

    def match_event_in_sublist(self, pattern: str, starting_idx: int) -> Optional[str]:
        for item in self.logs[starting_idx:]:
            match = re.search(f"([^:]+): Time [0-9]*.[0-9]*: {pattern}", item)
            if match:
                return match.group(1)
        return None
