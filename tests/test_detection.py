from backend.detection.rules import check_arp_spoof, check_deauth_flood, check_evil_twin

def test_arp_spoof_detected():
    check_arp_spoof("192.168.1.1", "aa:bb:cc:dd:ee:ff")
    result = check_arp_spoof("192.168.1.1", "00:11:22:33:44:55")
    assert result is not None
    assert result["type"] == "ARP_SPOOF"

def test_arp_no_false_positive():
    result = check_arp_spoof("192.168.1.99", "de:ad:be:ef:00:01")
    assert result is None

def test_evil_twin_detected():
    known = [{"ssid": "HomeNet", "bssid": "aa:bb:cc:dd:ee:ff"}]
    result = check_evil_twin("HomeNet", "de:ad:be:ef:00:01", known)
    assert result is not None
    assert result["type"] == "EVIL_TWIN_AP"

def test_deauth_flood_detected():
    bssid = "cc:dd:ee:ff:00:11"
    for _ in range(11):
        result = check_deauth_flood(bssid, threshold=10, window=5)
    assert result is not None
    assert result["type"] == "DEAUTH_FLOOD"

def test_deauth_no_false_positive():
    result = check_deauth_flood("aa:00:00:00:00:01", threshold=10, window=5)
    assert result is None
