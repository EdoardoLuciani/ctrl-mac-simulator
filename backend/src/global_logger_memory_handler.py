import logging, re
from typing import Optional


class GlobalLoggerMemoryHandler(logging.Handler):
    def __init__(self):
        super().__init__()
        self.log = []

    def emit(self, record: logging.LogRecord):
        self.log.append(f"{record.levelname}: {record.name}: {(record.msg)}")

    def match_events_in_sublist(self, pattern: str, starting_idx: int) -> Optional[str]:
        matches = list(
            map(
                lambda x: x.group(1),
                filter(
                    lambda x: x is not None,
                    [re.search(f"([^:]+): Time [0-9]*.[0-9]*: {pattern}", item) for item in self.log[starting_idx:]],
                ),
            )
        )
        return matches if matches else None
