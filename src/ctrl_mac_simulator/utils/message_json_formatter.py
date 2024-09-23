import json
from typing import Any

def convert_message_to_json(message: Any, start_time: float, arrive_time: float) -> str:
    dt = message.__dict__
    dt['start_time'] = start_time
    dt['arrive_time'] = arrive_time
    dt['message_type'] = message.__class__.__name__

    def custom_encoder(obj):
        if isinstance(obj, bytes):
            return obj.hex()
        elif hasattr(obj, '__dict__'):
            return obj.__dict__
        else:
            return str(obj)

    return json.dumps(dt, default=custom_encoder)
