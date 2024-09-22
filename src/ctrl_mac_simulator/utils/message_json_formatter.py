import json
from typing import Any

def convert_message_to_json(message: Any, current_time: float) -> str:
    dt = message.__dict__
    dt['time'] = current_time
    dt['message_type'] = message.__class__.__name__
    return json.dumps(dt, default=lambda obj: obj.__dict__)
