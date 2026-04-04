import datetime

def extract_features(alert: dict) -> list:
    severity_map = {"CRITICAL": 4.0, "HIGH": 3.0, "MEDIUM": 2.0, "LOW": 1.0}
    type_map = {"ARP_SPOOF": 0.0, "DEAUTH_FLOOD": 1.0, "EVIL_TWIN_AP": 2.0, "PORT_SCAN": 3.0}

    severity = severity_map.get(alert.get("severity", "LOW"), 1.0)
    alert_type = type_map.get(alert.get("type", ""), -1.0)

    ts = alert.get("timestamp", "")
    try:
        hour = float(datetime.datetime.fromisoformat(ts.rstrip("Z")).hour)
    except Exception:
        hour = 0.0

    return [severity, alert_type, hour]
