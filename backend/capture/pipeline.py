from backend.capture.sniffer import parse_frame, start_capture
from backend.detection.rules import (
    check_arp_spoof,
    check_deauth_flood,
    check_evil_twin,
    check_port_scan,
)
from backend.config import INTERFACE
from scapy.all import ARP, IP, TCP
import uuid
import datetime

known_aps = []

def packet_handler(pkt):
    alerts = []

    frame = parse_frame(pkt)
    if frame:
        bssid = frame.get("bssid")
        ssid = frame.get("ssid", "")

        if ssid and bssid:
            alert = check_evil_twin(ssid, bssid, known_aps)
            if alert:
                alerts.append(alert)

        if frame.get("subtype") == 12 and bssid:
            alert = check_deauth_flood(bssid)
            if alert:
                alerts.append(alert)

    if pkt.haslayer(ARP):
        alert = check_arp_spoof(pkt[ARP].psrc, pkt[ARP].hwsrc)
        if alert:
            alerts.append(alert)

    if pkt.haslayer(IP) and pkt.haslayer(TCP):
        alert = check_port_scan(pkt[IP].src, pkt[TCP].dport)
        if alert:
            alerts.append(alert)

    for alert in alerts:
        alert["id"] = f"ALT-{uuid.uuid4().hex[:5].upper()}"
        alert["timestamp"] = datetime.datetime.utcnow().isoformat() + "Z"
        alert.setdefault("message", f"{alert['type']} detected")
        _ml_score(alert)
        _save_alert(alert)
        _dispatch(alert)
        _maybe_autoblock(alert)

def _ml_score(alert):
    from backend.detection.ml_detector import is_if_loaded, score_isolation_forest
    from backend.detection.features import extract_features
    if is_if_loaded():
        try:
            alert["ml_score"] = round(float(score_isolation_forest(extract_features(alert))), 4)
        except Exception:
            alert["ml_score"] = None
    else:
        alert["ml_score"] = None

def _save_alert(alert):
    from backend.database.schema import SessionLocal, Alert as AlertModel
    import datetime as dt
    db = SessionLocal()
    try:
        ts_str = alert.get("timestamp", "")
        try:
            ts = dt.datetime.fromisoformat(ts_str.rstrip("Z"))
        except Exception:
            ts = dt.datetime.utcnow()
        db.merge(AlertModel(
            id=alert["id"],
            timestamp=ts,
            severity=alert.get("severity"),
            type=alert.get("type"),
            message=alert.get("message"),
            acknowledged=False,
            ml_score=alert.get("ml_score"),
        ))
        db.commit()
    except Exception:
        pass
    finally:
        db.close()

def _dispatch(alert):
    from backend.worker import dispatch_alert
    dispatch_alert.delay(alert)

def _maybe_autoblock(alert):
    if alert.get("severity") not in ("CRITICAL", "HIGH"):
        return
    try:
        from backend.database.schema import SessionLocal, Settings, BlockedDevice, Device
        from backend.blocking.blocker import block_mac
        import datetime as dt
        db = SessionLocal()
        try:
            row = db.query(Settings).filter(Settings.key == "auto_block_enabled").first()
            if not row or row.value != "true":
                return
            mac, ip = _extract_identifiers(alert)
            if not mac:
                return
            whitelisted = db.query(BlockedDevice).filter(
                BlockedDevice.mac == mac, BlockedDevice.is_whitelisted == True
            ).first()
            if whitelisted:
                return
            already_blocked = db.query(BlockedDevice).filter(
                BlockedDevice.mac == mac, BlockedDevice.is_whitelisted == False
            ).first()
            if already_blocked:
                return
            if not ip:
                device = db.query(Device).filter(Device.mac == mac).first()
                ip = device.ip if device else None
            block_mac(mac, ip)
            db.add(BlockedDevice(
                mac=mac, ip=ip,
                reason=f"Auto-blocked: {alert['type']}",
                blocked_by="auto",
                blocked_at=dt.datetime.utcnow(),
                is_whitelisted=False,
            ))
            db.commit()
        finally:
            db.close()
    except Exception:
        pass

def _extract_identifiers(alert: dict):
    t = alert.get("type", "")
    if t == "ARP_SPOOF":
        return alert.get("mac"), alert.get("ip")
    if t == "EVIL_TWIN_AP":
        return alert.get("rogue_bssid"), None
    if t == "PORT_SCAN":
        return None, alert.get("src")
    return None, None

def run():
    start_capture(INTERFACE, packet_handler)
