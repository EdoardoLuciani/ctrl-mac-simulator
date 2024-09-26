import pytest
from ctrl_mac_simulator.messages.request_reply_message import RequestReplyMessage


def test_rrm_message_even_split():
    rrm = RequestReplyMessage(0, 3, 2, 3)

    assert [slot.data_channel for slot in rrm.request_slots] == [0, 1, 2]
    assert all([slot.data_slot == 0 for slot in rrm.request_slots])


def test_rrm_message_not_even_split():
    rrm = RequestReplyMessage(0, 3, 2, 5)

    assert [slot.data_channel for slot in rrm.request_slots] == [0, 1, 2, 0, 1]
    assert [slot.data_slot for slot in rrm.request_slots] == [0, 0, 0, 1, 1]


def test_rrm_message_too_many_request_slots():
    with pytest.raises(ValueError):
        rrm = RequestReplyMessage(0, 2, 3, 7)


def test_rrm_message_filled():
    rrm = RequestReplyMessage(0, 2, 3, 6)
    print(rrm.to_json())

    assert [slot.data_channel for slot in rrm.request_slots] == [0, 1, 0, 1, 0, 1]
    assert [slot.data_slot for slot in rrm.request_slots] == [0, 0, 1, 1, 2, 2]
