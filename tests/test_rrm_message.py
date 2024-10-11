from ctrl_mac_simulator.simulation.messages.request_reply_message import RequestReplyMessage


def test_rrm_message_even_split():
    rrm = RequestReplyMessage(0, 3, 2, 3)

    assert [slot.data_channel for slot in rrm.request_slots] == [0, 1, 2]
    assert all([slot.data_slot == 0 for slot in rrm.request_slots])


def test_rrm_message_not_even_split():
    rrm = RequestReplyMessage(0, 3, 1, 5)

    assert [slot.data_channel for slot in rrm.request_slots] == [0, 1, 2, 0, 1]
    assert [slot.data_slot for slot in rrm.request_slots] == [0, 0, 0, 1, 1]


def test_rrm_message_filled():
    rrm = RequestReplyMessage(0, 2, 1, 6)

    assert [slot.data_channel for slot in rrm.request_slots] == [0, 1, 0, 1, 0, 1]
    assert [slot.data_slot for slot in rrm.request_slots] == [0, 0, 1, 1, 2, 2]


def test_rrm_message_contentions():
    rrm = RequestReplyMessage(0, 3, 2, 3)

    for request_slot, new_state in zip(rrm.request_slots, ["contention", "contention", "free"]):
        request_slot.state = new_state

    assert rrm.total_contentions() == 2
    assert rrm.total_contentions(1) == 1
    assert rrm.total_contentions(0) == 0


def test_rrm_message_ftr_contention_not_resolved():
    rrm = RequestReplyMessage(0, 3, 2, 3)

    for request_slot, new_state in zip(rrm.request_slots, ["contention", "contention", "free"]):
        request_slot.state = new_state

    rrm.update_ftr()
    assert rrm.ftr == 0

    rrm.update_ftr()
    assert rrm.ftr == 1

    for request_slot, new_state in zip(rrm.request_slots, ["free", "no_contention", "no_contention"]):
        request_slot.state = new_state

    rrm.update_ftr()
    assert rrm.ftr == 2


def test_rrm_message_ftr_contetion_resolved():
    rrm = RequestReplyMessage(0, 3, 2, 3)

    for request_slot, new_state in zip(rrm.request_slots, ["contention", "contention", "free"]):
        request_slot.state = new_state

    rrm.update_ftr()
    assert rrm.ftr == 0

    for request_slot, new_state in zip(rrm.request_slots, ["no_contention", "no_contention", "free"]):
        request_slot.state = new_state

    rrm.update_ftr()
    assert rrm.ftr == 1

    rrm.update_ftr()
    assert rrm.ftr == 0
