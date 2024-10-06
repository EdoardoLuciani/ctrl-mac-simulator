import logging

from ctrl_mac_simulator.global_logger_memory_handler import GlobalLoggerMemoryHandler


def test_match_event(caplog):
    glmh = GlobalLoggerMemoryHandler()
    logging.basicConfig(level=logging.INFO, handlers=[glmh])

    logging.info("Time 0.00: Something has happened")
    logging.info("Time 0.01: Something has happened")

    alice_logger = logging.getLogger('Alice')
    alice_logger.info("Time 0.00: Something else has happened")

    assert glmh.match_events_in_sublist("Something has happened", 0) == ['root', 'root']
    assert glmh.match_events_in_sublist("Something else has happened", 0) == ['Alice']
    assert glmh.match_events_in_sublist("Something that has not happened", 0) is None
