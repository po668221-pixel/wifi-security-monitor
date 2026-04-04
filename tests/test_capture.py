from backend.capture.sniffer import parse_frame

class MockPacket:
    def haslayer(self, layer):
        return True
    type = 0
    subtype = 8
    addr1 = "ff:ff:ff:ff:ff:ff"
    addr2 = "aa:bb:cc:dd:ee:ff"
    addr3 = "aa:bb:cc:dd:ee:ff"

def test_parse_frame_returns_dict():
    result = parse_frame(MockPacket())
    assert isinstance(result, dict)
    assert "src" in result
    assert "dst" in result
