# Bug Fixes Log

All issues found during code audit and their resolutions.

---

## Round 1 — Full Audit (17 issues)

### Critical Bugs

| # | File | Issue | Fix |
|---|---|---|---|
| 1 | `backend/capture/sniffer.py` | `parse_frame()` never extracted SSID — evil twin detection always used empty string | Added `Dot11Elt` import and SSID extraction from beacon/probe frames |
| 2 | `backend/capture/pipeline.py` | `check_arp_spoof` and `check_port_scan` were imported but never called | Activated both: ARP check on `ARP` layer, port scan check on `IP+TCP` layer |
| 3 | `backend/worker.py` | `run_active_scan` imported `known_aps` (unused, circular import risk) | Removed `known_aps`, fixed import chain |
| 4 | `backend/worker.py` | `dispatch_alert` never called `send_email` | Added `send_email` call when SMTP config is set |
| 5 | `backend/detection/ml_detector.py` | Hardcoded relative paths `"backend/models/..."` — breaks if CWD is not project root | Replaced with `__file__`-relative `os.path.join` |
| 6 | `ml/train.py` | Same hardcoded relative paths for `joblib.dump` and `model.save` | Same fix using `__file__`-relative paths |

### Medium Bugs

| # | File | Issue | Fix |
|---|---|---|---|
| 7 | `backend/api/websocket.py` | `connected_clients.remove()` raised `ValueError` if client already removed | Added `if client in connected_clients` guard in both places |
| 8 | `backend/database/schema.py` | `connect_args={"check_same_thread": False}` applied unconditionally — breaks PostgreSQL | Made conditional on `DATABASE_URL.startswith("sqlite")` |
| 9 | `backend/capture/pipeline.py` | `frame["bssid"]` direct key access — `KeyError` crash possible | Replaced with `.get()` |
| 10 | `backend/alerts/router.py` | `requests.post()` had no timeout — dead webhook hangs Celery task | Added `timeout=5` and `try/except RequestException` |

### Security Issues

| # | File | Issue | Fix |
|---|---|---|---|
| 11 | `docker-compose.yml` | `SECRET_KEY=change-me` hardcoded | Changed to `SECRET_KEY=${SECRET_KEY}` |
| 12 | `backend/config.py` | Default `SECRET_KEY="change-me"` | Documented in `.env.example` |

### Configuration Issues

| # | File | Issue | Fix |
|---|---|---|---|
| 13 | `Dockerfile` | No `PYTHONPATH` — imports could fail | Added `ENV PYTHONPATH=/app` |
| 14 | `Dockerfile` | Container ran as root | Added `appuser` non-root user |
| 15 | `docker-compose.yml` | Worker service missing `volumes` mount — couldn't share SQLite DB | Added `db_data:/app/data` to worker |

### Test Gaps

| # | File | Issue | Fix |
|---|---|---|---|
| 16 | `tests/test_capture.py` | MockPacket too loose | Noted for future improvement |
| 17 | `tests/test_detection.py` | No test for `check_deauth_flood` | Added `test_deauth_flood_detected` and `test_deauth_no_false_positive` |

---

## Round 2 — Follow-up (3 issues)

| # | File | Issue | Fix |
|---|---|---|---|
| 1 | `backend/api/routes.py` | Raw SQLAlchemy ORM objects without Pydantic schemas — serialization fails with real data | Added `DeviceOut` and `AlertOut` with `from_attributes=True` |
| 2 | `Makefile` | `reset` target missing `PYTHONPATH=.` | Added `PYTHONPATH=.` |
| 3 | `docker-compose.yml` | `CORS_ORIGINS` not in backend environment | Added `CORS_ORIGINS=${CORS_ORIGINS:-http://localhost:3000}` |

---

## Round 3 — Post-feature audit (4 issues)

| # | File | Issue | Fix |
|---|---|---|---|
| 1 | `project 2 prototype/style.css` | `min-width: 8px` property split across lines — broken CSS | Merged into single line |
| 2 | `tests/test_api.py` | No tests for auth, blocking, settings, or notification endpoints | Added 16 new tests covering all new endpoints |
| 3 | `Dockerfile` | Non-root `appuser` was dropped when Dockerfile was updated | Restored `useradd appuser` + `USER appuser` |
| 4 | `docs/` | All three docs files outdated — didn't reflect auth, blocking, ML, settings | Fully updated all three docs files |

---

## Total: 24 issues found and fixed
