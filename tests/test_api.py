from fastapi.testclient import TestClient
from backend.main import app
from backend.database.schema import SessionLocal, Base, engine, User
from backend.auth.auth import hash_password
import uuid

client = TestClient(app)

# ── Helpers ────────────────────────────────────────────────────────────────

def _create_user(username="testuser", password="testpass"):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    existing = db.query(User).filter(User.username == username).first()
    if not existing:
        db.add(User(id=str(uuid.uuid4()), username=username, hashed_password=hash_password(password)))
        db.commit()
    db.close()

def _get_token(username="testuser", password="testpass"):
    _create_user(username, password)
    res = client.post("/auth/login", data={"username": username, "password": password})
    assert res.status_code == 200
    return res.json()["access_token"]

def _auth(token):
    return {"Authorization": f"Bearer {token}"}

# ── Health ──────────────────────────────────────────────────────────────────

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

# ── Auth ────────────────────────────────────────────────────────────────────

def test_login_success():
    token = _get_token()
    assert isinstance(token, str) and len(token) > 0

def test_login_wrong_password():
    _create_user()
    res = client.post("/auth/login", data={"username": "testuser", "password": "wrongpass"})
    assert res.status_code == 401

def test_login_unknown_user():
    res = client.post("/auth/login", data={"username": "nobody", "password": "pass"})
    assert res.status_code == 401

def test_register_blocked_when_user_exists():
    _create_user()
    res = client.post("/auth/register", json={"username": "newuser", "password": "pass"})
    assert res.status_code == 403

def test_protected_route_without_token():
    res = client.get("/api/devices")
    assert res.status_code == 401

# ── Devices ─────────────────────────────────────────────────────────────────

def test_list_devices():
    token = _get_token()
    res = client.get("/api/devices", headers=_auth(token))
    assert res.status_code == 200
    assert isinstance(res.json(), list)

# ── Alerts ───────────────────────────────────────────────────────────────────

def test_list_alerts():
    token = _get_token()
    res = client.get("/api/alerts", headers=_auth(token))
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_acknowledge_alert_not_found():
    token = _get_token()
    res = client.patch("/api/alerts/nonexistent-id/acknowledge", headers=_auth(token))
    assert res.status_code == 404

# ── Blocking ─────────────────────────────────────────────────────────────────

def test_block_and_unblock_device():
    token = _get_token()
    mac = "aa:bb:cc:dd:ee:ff"

    # Block
    res = client.post(f"/api/devices/{mac}/block", headers=_auth(token))
    assert res.status_code == 200
    assert res.json()["status"] == "blocked"

    # List blocked — should contain the MAC
    res = client.get("/api/blocked", headers=_auth(token))
    assert res.status_code == 200
    macs = [d["mac"] for d in res.json()]
    assert mac in macs

    # Unblock
    res = client.post(f"/api/devices/{mac}/unblock", headers=_auth(token))
    assert res.status_code == 200
    assert res.json()["status"] == "unblocked"

def test_whitelist_device():
    token = _get_token()
    mac = "11:22:33:44:55:66"

    res = client.post(f"/api/devices/{mac}/whitelist", headers=_auth(token))
    assert res.status_code == 200
    assert res.json()["status"] == "whitelisted"

def test_block_whitelisted_device_rejected():
    token = _get_token()
    mac = "11:22:33:44:55:66"
    # Whitelist first (already done above but idempotent)
    client.post(f"/api/devices/{mac}/whitelist", headers=_auth(token))
    # Then try to block — should fail
    res = client.post(f"/api/devices/{mac}/block", headers=_auth(token))
    assert res.status_code == 400

# ── Settings ─────────────────────────────────────────────────────────────────

def test_get_settings():
    token = _get_token()
    res = client.get("/api/settings", headers=_auth(token))
    assert res.status_code == 200
    assert "auto_block_enabled" in res.json()

def test_update_auto_block():
    token = _get_token()
    res = client.patch("/api/settings", json={"auto_block_enabled": True}, headers=_auth(token))
    assert res.status_code == 200
    assert res.json()["auto_block_enabled"] is True

    # Reset
    client.patch("/api/settings", json={"auto_block_enabled": False}, headers=_auth(token))

def test_get_notification_settings():
    token = _get_token()
    res = client.get("/api/settings/notifications", headers=_auth(token))
    assert res.status_code == 200
    data = res.json()
    assert "email_enabled" in data
    assert "slack_enabled" in data
    assert "telegram_enabled" in data

def test_test_notif_unknown_channel():
    token = _get_token()
    res = client.post("/api/settings/notifications/test",
                      json={"channel": "unknown"}, headers=_auth(token))
    assert res.status_code == 200
    assert res.json()["ok"] is False
