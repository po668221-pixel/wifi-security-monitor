import subprocess
import platform
import re

_SYSTEM = platform.system()

def _safe_mac(mac: str) -> str:
    if not re.fullmatch(r"([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}", mac):
        raise ValueError(f"Invalid MAC address: {mac}")
    return mac

def block_mac(mac: str, ip: str | None = None) -> bool:
    try:
        mac = _safe_mac(mac)
        if _SYSTEM == "Windows":
            if ip:
                name = f"WiFiBlock-{mac.replace(':', '-')}"
                subprocess.run(
                    ["netsh", "advfirewall", "firewall", "add", "rule",
                     f"name={name}", "dir=in", "action=block", f"remoteip={ip}"],
                    check=True, capture_output=True, timeout=10
                )
            return True
        else:
            if ip:
                subprocess.run(
                    ["iptables", "-A", "INPUT", "-s", ip, "-j", "DROP"],
                    check=True, capture_output=True, timeout=10
                )
            else:
                subprocess.run(
                    ["iptables", "-A", "INPUT", "-m", "mac",
                     "--mac-source", mac, "-j", "DROP"],
                    check=True, capture_output=True, timeout=10
                )
            return True
    except Exception:
        return False

def unblock_mac(mac: str, ip: str | None = None) -> bool:
    try:
        mac = _safe_mac(mac)
        if _SYSTEM == "Windows":
            if ip:
                name = f"WiFiBlock-{mac.replace(':', '-')}"
                subprocess.run(
                    ["netsh", "advfirewall", "firewall", "delete", "rule",
                     f"name={name}"],
                    check=True, capture_output=True, timeout=10
                )
            return True
        else:
            if ip:
                subprocess.run(
                    ["iptables", "-D", "INPUT", "-s", ip, "-j", "DROP"],
                    check=True, capture_output=True, timeout=10
                )
            else:
                subprocess.run(
                    ["iptables", "-D", "INPUT", "-m", "mac",
                     "--mac-source", mac, "-j", "DROP"],
                    check=True, capture_output=True, timeout=10
                )
            return True
    except Exception:
        return False
