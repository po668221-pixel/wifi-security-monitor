# Bug Fixes Log

All issues found during code audit and their resolutions.

---

## Round 1 — Full Audit (17 issues)

### Critical Bugs

| # | File | Issue | Fix |
|---|---|---|---|
| 1 | `backend/capture/sniffer.py` | `parse_frame()` never extracted SSID from frames — evil twin detection always used empty string `""` as SSID, so it could never match | Added `Dot11Elt` import and SSID extraction from beacon/probe frames |
| 2 | `backend/capture/pipeline.py` | `check_arp_spoof` and `check_port_scan` were imported but never called — ARP spoof and port scan detection completely disabled | Activated both: ARP check on `ARP` layer, port scan check on `IP+TCP` layer |
| 3 | `backend/worker.py` | `run_active_scan` imported `known_aps` from pipeline (unused, circular import risk). Also didn't properly call `start_capture` | Removed `known_aps`, fixed import chain |
| 4 | `backend/worker.py` | `dispatch_alert` never called `send_email` — email alerts silently never sent despite full SMTP config | Added `send_email` call when `ALERT_EMAIL_TO` and `SMTP["user"]` are set |
| 5 | `backend/detection/ml_detector.py` | Hardcoded relative paths `"backend/models/..."` — breaks if process CWD is not project root | Replaced with `__file__`-relative `os.path.join` |
| 6 | `ml/train.py` | Same hardcoded relative paths for `joblib.dump` and `model.save` | Same fix using `__file__`-relative paths |

### Medium Bugs

| # | File | Issue | Fix |
|---|---|---|---|
| 7 | `backend/api/websocket.py` | `connected_clients.remove(client)` in `broadcast()` raised `ValueError` if client already removed by disconnect handler | Added `if client in connected_clients` guard in both places |
| 8 | `backend/database/schema.py` | `connect_args={"check_same_thread": False}` applied unconditionally — breaks with PostgreSQL | Made conditional: only applied when `DATABASE_URL` starts with `"sqlite"` |
| 9 | `backend/capture/pipeline.py` | `frame["bssid"]` direct key access — `KeyError` crash if bssid absent | Replaced with `frame.get("bssid")` with guard |
| 10 | `backend/alerts/router.py` | `requests.post()` had no timeout or error handling — dead webhook hangs Celery task | Added `timeout=5` and `try/except RequestException` to `send_slack` and `send_telegram` |

### Security Issues

| # | File | Issue | Fix |
|---|---|---|---|
| 11 | `docker-compose.yml` | `SECRET_KEY=change-me` hardcoded in compose file | Changed to `SECRET_KEY=${SECRET_KEY}` — reads from `.env` |
| 12 | `backend/config.py` | Default `SECRET_KEY="change-me"` — insecure if `.env` missing | Noted — `.env.example` now clearly instructs setting a real value |

### Configuration Issues

| # | File | Issue | Fix |
|---|---|---|---|
| 13 | `Dockerfile` | No `PYTHONPATH` — `from backend.xxx` imports could fail | Added `ENV PYTHONPATH=/app` |
| 14 | `Dockerfile` | Container ran as root | Added `appuser` non-root user |
| 15 | `docker-compose.yml` | Worker service had no `volumes` mount — couldn't share SQLite DB with backend | Added `db_data:/app/data` volume to worker service |

### Test Gaps

| # | File | Issue | Fix |
|---|---|---|---|
| 16 | `tests/test_capture.py` | MockPacket too loose — bypasses real Scapy layer logic | Noted for future improvement |
| 17 | `tests/test_detection.py` | No test for `check_deauth_flood` | Added `test_deauth_flood_detected` and `test_deauth_no_false_positive` |

---

## Round 2 — Follow-up (3 issues)

| # | File | Issue | Fix |
|---|---|---|---|
| 1 | `backend/api/routes.py` | Raw SQLAlchemy ORM objects returned without Pydantic schemas — serialization fails when DB has real data | Added `DeviceOut` and `AlertOut` Pydantic schemas with `from_attributes=True`; added `response_model` to GET endpoints |
| 2 | `Makefile` | `reset` target missing `PYTHONPATH=.` — `make reset` crashed with `ModuleNotFoundError` | Added `PYTHONPATH=.` to the reset target |
| 3 | `docker-compose.yml` | `CORS_ORIGINS` env var not set in backend service — cross-origin frontend would be blocked | Added `CORS_ORIGINS=${CORS_ORIGINS:-http://localhost:3000}` |

---

## Total: 20 issues found and fixed
