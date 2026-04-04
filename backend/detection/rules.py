from collections import defaultdict
import time

arp_table = {}
deauth_counts = defaultdict(list)
port_scan_tracker = defaultdict(set)

def check_arp_spoof(ip, mac):
    if ip in arp_table and arp_table[ip] != mac:
        return {"type": "ARP_SPOOF", "severity": "HIGH", "ip": ip, "mac": mac, "known_mac": arp_table[ip]}
    arp_table[ip] = mac
    return None

def check_deauth_flood(bssid, threshold=10, window=5):
    now = time.time()
    deauth_counts[bssid] = [t for t in deauth_counts[bssid] if now - t < window]
    deauth_counts[bssid].append(now)
    if len(deauth_counts[bssid]) > threshold:
        return {"type": "DEAUTH_FLOOD", "severity": "HIGH", "bssid": bssid}
    return None

def check_evil_twin(ssid, bssid, known_aps):
    for ap in known_aps:
        if ap["ssid"] == ssid and ap["bssid"] != bssid:
            return {"type": "EVIL_TWIN_AP", "severity": "CRITICAL", "ssid": ssid, "rogue_bssid": bssid}
    return None

def check_port_scan(src_ip, dst_port, threshold=15, window=10):
    now = time.time()
    port_scan_tracker[src_ip].add((dst_port, now))
    port_scan_tracker[src_ip] = {(p, t) for p, t in port_scan_tracker[src_ip] if now - t < window}
    if len(port_scan_tracker[src_ip]) > threshold:
        return {"type": "PORT_SCAN", "severity": "MEDIUM", "src": src_ip}
    return None
