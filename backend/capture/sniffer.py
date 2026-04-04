from scapy.all import sniff, Dot11, Dot11Elt

def start_capture(interface, packet_handler):
    sniff(iface=interface, prn=packet_handler, store=False)

def parse_frame(packet):
    if packet.haslayer(Dot11):
        frame = {
            "type": packet.type,
            "subtype": packet.subtype,
            "src": packet.addr2,
            "dst": packet.addr1,
            "bssid": packet.addr3,
        }
        if packet.haslayer(Dot11Elt):
            try:
                frame["ssid"] = packet[Dot11Elt].info.decode("utf-8", errors="ignore")
            except Exception:
                frame["ssid"] = ""
        return frame
    return None
