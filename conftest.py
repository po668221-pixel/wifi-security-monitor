import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(__file__))

# Use a separate test database so tests never touch the real one
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_wifi_monitor.db")

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    yield
    if os.path.exists("test_wifi_monitor.db"):
        os.remove("test_wifi_monitor.db")

@pytest.fixture(autouse=True)
def reset_detection_state():
    import backend.detection.rules as rules
    rules.arp_table.clear()
    rules.deauth_counts.clear()
    rules.port_scan_tracker.clear()
    yield
