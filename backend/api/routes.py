from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, ConfigDict
from backend.database.schema import get_db, Device, Alert, BlockedDevice, Settings
from backend.auth.auth import get_current_user
from sqlalchemy.orm import Session
import datetime

router = APIRouter()

class DeviceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    mac: str
    ip: str | None
    hostname: str | None
    vendor: str | None
    first_seen: datetime.datetime | None
    last_seen: datetime.datetime | None
    is_blocked: bool = False
    is_whitelisted: bool = False

class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    timestamp: datetime.datetime | None
    severity: str | None
    type: str | None
    message: str | None
    acknowledged: bool
    ml_score: float | None = None

class BlockedDeviceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    mac: str
    ip: str | None
    reason: str | None
    blocked_at: datetime.datetime | None
    blocked_by: str | None
    is_whitelisted: bool

class SettingsIn(BaseModel):
    auto_block_enabled: bool

@router.get("/api/devices", response_model=list[DeviceOut])
def list_devices(db: Session = Depends(get_db), _=Depends(get_current_user)):
    devices = db.query(Device).all()
    blocked_map = {b.mac: b for b in db.query(BlockedDevice).all()}
    result = []
    for d in devices:
        b = blocked_map.get(d.mac)
        out = DeviceOut.model_validate(d)
        if b:
            out.is_blocked = not b.is_whitelisted
            out.is_whitelisted = b.is_whitelisted
        result.append(out)
    return result

@router.get("/api/alerts", response_model=list[AlertOut])
def list_alerts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return db.query(Alert).order_by(Alert.timestamp.desc()).offset(skip).limit(limit).all()

@router.patch("/api/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged = True
    db.commit()
    return {"status": "ok"}

@router.post("/api/devices/{mac}/block")
def block_device(mac: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    from backend.blocking.blocker import block_mac
    device = db.query(Device).filter(Device.mac == mac).first()
    existing = db.query(BlockedDevice).filter(BlockedDevice.mac == mac).first()
    if existing and existing.is_whitelisted:
        raise HTTPException(status_code=400, detail="Device is whitelisted and cannot be blocked")
    ip = device.ip if device else None
    block_mac(mac, ip)
    if existing:
        existing.blocked_by = "manual"
        existing.blocked_at = datetime.datetime.utcnow()
        existing.ip = ip
        existing.is_whitelisted = False
    else:
        db.add(BlockedDevice(mac=mac, ip=ip, reason="Manual block", blocked_by="manual", is_whitelisted=False))
    db.commit()
    return {"status": "blocked", "mac": mac}

@router.post("/api/devices/{mac}/unblock")
def unblock_device(mac: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    from backend.blocking.blocker import unblock_mac
    blocked = db.query(BlockedDevice).filter(BlockedDevice.mac == mac).first()
    if not blocked:
        raise HTTPException(status_code=404, detail="Device not in block list")
    unblock_mac(mac, blocked.ip)
    db.delete(blocked)
    db.commit()
    return {"status": "unblocked", "mac": mac}

@router.post("/api/devices/{mac}/whitelist")
def whitelist_device(mac: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    from backend.blocking.blocker import unblock_mac
    existing = db.query(BlockedDevice).filter(BlockedDevice.mac == mac).first()
    if existing:
        unblock_mac(mac, existing.ip)
        existing.is_whitelisted = True
        existing.blocked_by = "manual"
    else:
        db.add(BlockedDevice(mac=mac, ip=None, reason="Whitelisted", blocked_by="manual", is_whitelisted=True))
    db.commit()
    return {"status": "whitelisted", "mac": mac}

@router.get("/api/blocked", response_model=list[BlockedDeviceOut])
def list_blocked(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(BlockedDevice).filter(BlockedDevice.is_whitelisted == False).all()

@router.get("/api/settings")
def get_settings(db: Session = Depends(get_db), _=Depends(get_current_user)):
    row = db.query(Settings).filter(Settings.key == "auto_block_enabled").first()
    return {"auto_block_enabled": row.value == "true" if row else False}

@router.patch("/api/settings")
def update_settings(body: SettingsIn, db: Session = Depends(get_db), _=Depends(get_current_user)):
    row = db.query(Settings).filter(Settings.key == "auto_block_enabled").first()
    if row:
        row.value = "true" if body.auto_block_enabled else "false"
    else:
        db.add(Settings(key="auto_block_enabled", value="true" if body.auto_block_enabled else "false"))
    db.commit()
    return {"auto_block_enabled": body.auto_block_enabled}

_NOTIF_KEYS = [
    "email_enabled", "smtp_host", "smtp_port", "smtp_user", "smtp_password",
    "smtp_from", "alert_email_to",
    "slack_enabled", "slack_webhook",
    "telegram_enabled", "telegram_token", "telegram_chat_id",
]

class NotifSettingsIn(BaseModel):
    email_enabled: bool = False
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    alert_email_to: str = ""
    slack_enabled: bool = False
    slack_webhook: str = ""
    telegram_enabled: bool = False
    telegram_token: str = ""
    telegram_chat_id: str = ""

class TestNotifIn(BaseModel):
    channel: str

def _get_setting(db, key, default=""):
    row = db.query(Settings).filter(Settings.key == key).first()
    return row.value if row else default

def _set_setting(db, key, value):
    row = db.query(Settings).filter(Settings.key == key).first()
    if row:
        row.value = str(value)
    else:
        db.add(Settings(key=key, value=str(value)))

@router.get("/api/settings/notifications")
def get_notif_settings(db: Session = Depends(get_db), _=Depends(get_current_user)):
    pw = _get_setting(db, "smtp_password")
    return {
        "email_enabled": _get_setting(db, "email_enabled", "false") == "true",
        "smtp_host": _get_setting(db, "smtp_host"),
        "smtp_port": int(_get_setting(db, "smtp_port", "587")),
        "smtp_user": _get_setting(db, "smtp_user"),
        "smtp_password": "***" if pw else "",
        "smtp_from": _get_setting(db, "smtp_from"),
        "alert_email_to": _get_setting(db, "alert_email_to"),
        "slack_enabled": _get_setting(db, "slack_enabled", "false") == "true",
        "slack_webhook": _get_setting(db, "slack_webhook"),
        "telegram_enabled": _get_setting(db, "telegram_enabled", "false") == "true",
        "telegram_token": _get_setting(db, "telegram_token"),
        "telegram_chat_id": _get_setting(db, "telegram_chat_id"),
    }

@router.patch("/api/settings/notifications")
def update_notif_settings(body: NotifSettingsIn, db: Session = Depends(get_db), _=Depends(get_current_user)):
    _set_setting(db, "email_enabled", "true" if body.email_enabled else "false")
    _set_setting(db, "smtp_host", body.smtp_host)
    _set_setting(db, "smtp_port", str(body.smtp_port))
    _set_setting(db, "smtp_user", body.smtp_user)
    if body.smtp_password and body.smtp_password != "***":
        _set_setting(db, "smtp_password", body.smtp_password)
    _set_setting(db, "smtp_from", body.smtp_from)
    _set_setting(db, "alert_email_to", body.alert_email_to)
    _set_setting(db, "slack_enabled", "true" if body.slack_enabled else "false")
    _set_setting(db, "slack_webhook", body.slack_webhook)
    _set_setting(db, "telegram_enabled", "true" if body.telegram_enabled else "false")
    _set_setting(db, "telegram_token", body.telegram_token)
    _set_setting(db, "telegram_chat_id", body.telegram_chat_id)
    db.commit()
    return {"status": "saved"}

@router.post("/api/settings/notifications/test")
def test_notif(body: TestNotifIn, db: Session = Depends(get_db), _=Depends(get_current_user)):
    from backend.alerts.router import send_slack, send_telegram, send_email
    msg = "WiFi Monitor: Test notification — your alerts are working."
    try:
        if body.channel == "slack":
            webhook = _get_setting(db, "slack_webhook")
            if not webhook:
                return {"ok": False, "error": "Slack webhook not configured"}
            send_slack(webhook, msg)
        elif body.channel == "telegram":
            token = _get_setting(db, "telegram_token")
            chat_id = _get_setting(db, "telegram_chat_id")
            if not token or not chat_id:
                return {"ok": False, "error": "Telegram token or chat ID not configured"}
            send_telegram(token, chat_id, msg)
        elif body.channel == "email":
            to = _get_setting(db, "alert_email_to")
            smtp = {
                "host": _get_setting(db, "smtp_host"),
                "port": int(_get_setting(db, "smtp_port", "587")),
                "user": _get_setting(db, "smtp_user"),
                "password": _get_setting(db, "smtp_password"),
                "from": _get_setting(db, "smtp_from"),
            }
            if not to or not smtp["user"]:
                return {"ok": False, "error": "Email not fully configured"}
            send_email("WiFi Monitor Test", msg, to, smtp)
        else:
            return {"ok": False, "error": "Unknown channel"}
        return {"ok": True}
    except Exception as e:
        return {"ok": False, "error": str(e)}
