# AI-Powered WiFi Security Monitor — Project Overview

## What It Is
A full-stack web application that monitors a WiFi network in real time, detects attacks using rules-based logic and machine learning, and displays live alerts on a browser dashboard.

## Who It's For
Network administrators and security professionals who need to monitor their own networks for active threats without relying on expensive enterprise tooling.

## How It Works
1. A Python backend (FastAPI) runs on a machine with a WiFi adapter in monitor mode
2. Scapy captures raw packets from the air
3. Detection rules and ML models analyse each packet
4. Alerts are stored in SQLite and broadcast live via WebSocket
5. A React dashboard in the browser shows live alerts, device inventory, and threat stats

---

## Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python 3.11) |
| Packet capture | Scapy |
| Task queue | Celery + Redis |
| Database | SQLite (swappable to PostgreSQL) |
| ML models | scikit-learn (Isolation Forest) + TensorFlow (LSTM) |
| Authentication | JWT (python-jose) + bcrypt (passlib) |
| Alert delivery | Email (SMTP), Slack webhook, Telegram bot |
| Frontend | React 18 + Vite |
| Charts | Recharts |
| Routing | react-router-dom v6 |
| Container | Docker + docker-compose |

---

## Project Structure

```
second project/
├── backend/
│   ├── main.py               FastAPI app entry point
│   ├── config.py             Env var loader
│   ├── worker.py             Celery task definitions
│   ├── api/
│   │   ├── routes.py         REST endpoints (devices, alerts, settings, blocking)
│   │   └── websocket.py      WebSocket live alert broadcast
│   ├── alerts/
│   │   └── router.py         Email / Slack / Telegram senders
│   ├── auth/
│   │   ├── auth.py           JWT helpers, password hashing, get_current_user
│   │   └── routes.py         POST /auth/login, POST /auth/register
│   ├── blocking/
│   │   └── blocker.py        block_mac / unblock_mac (iptables / netsh)
│   ├── capture/
│   │   ├── sniffer.py        Scapy packet capture + frame parser
│   │   └── pipeline.py       Packet handler, ML scoring, DB save, auto-block
│   ├── database/
│   │   └── schema.py         SQLAlchemy models (Device, Alert, BlockedDevice, Settings, User)
│   ├── detection/
│   │   ├── rules.py          ARP spoof, deauth flood, evil twin, port scan
│   │   ├── ml_detector.py    Isolation Forest + LSTM scoring
│   │   └── features.py       Feature extractor for ML models
│   ├── models/               Trained model files (.pkl, .h5)
│   └── scripts/
│       └── train_demo_models.py  Generates demo Isolation Forest model
├── frontend/                 React + Vite dashboard
├── ml/
│   └── train.py              Full model training script
├── tests/                    pytest test suite
├── docs/                     This documentation folder
├── Dockerfile
├── docker-compose.yml
├── Makefile
└── requirements.txt
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create first account (locked after first user) |
| POST | `/auth/login` | No | Get JWT token |
| GET | `/health` | No | Health check |
| GET | `/api/devices` | JWT | List all detected devices |
| GET | `/api/alerts?skip=0&limit=100` | JWT | Paginated alert history |
| PATCH | `/api/alerts/{id}/acknowledge` | JWT | Mark alert as acknowledged |
| POST | `/api/devices/{mac}/block` | JWT | Block a device by MAC |
| POST | `/api/devices/{mac}/unblock` | JWT | Unblock a device |
| POST | `/api/devices/{mac}/whitelist` | JWT | Whitelist a device |
| GET | `/api/blocked` | JWT | List all blocked devices |
| GET | `/api/settings` | JWT | Get auto-block setting |
| PATCH | `/api/settings` | JWT | Update auto-block setting |
| GET | `/api/settings/notifications` | JWT | Get notification channel config |
| PATCH | `/api/settings/notifications` | JWT | Update notification config |
| POST | `/api/settings/notifications/test` | JWT | Send test alert to a channel |
| WS | `/ws/alerts` | JWT (query param) | Live alert stream |

---

## Detection Engine

| Attack Type | Severity | Detection Method |
|---|---|---|
| `ARP_SPOOF` | HIGH | Same IP maps to different MAC |
| `DEAUTH_FLOOD` | HIGH | >10 deauth frames in 5-second window |
| `EVIL_TWIN_AP` | CRITICAL | Same SSID, different BSSID |
| `PORT_SCAN` | MEDIUM | >15 unique ports from same IP in 10s |

ML scoring (Isolation Forest) runs on every alert and attaches an `ml_score` field.
Negative score = anomalous. Threshold: −0.05.

---

## Frontend Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | JWT login, protected route guard |
| Dashboard | `/` | Threat meter, alert rate chart, live feed, top devices |
| Alerts | `/alerts` | Full alert table, filters, slide-in detail drawer with MITRE refs |
| Devices | `/devices` | Device cards, block/unblock/whitelist actions, timeline |
| Settings | `/settings` | Notification channel config (Telegram, Slack, Email) |

---

## Running the Project

### Local (with virtual environment)
```bash
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # fill in SECRET_KEY and notification settings
PYTHONPATH=. python -m backend.scripts.train_demo_models
make start                     # backend on :8000
# First run — create your account:
# curl -X POST http://localhost:8000/auth/register -H "Content-Type: application/json" -d '{"username":"admin","password":"yourpassword"}'
cd frontend && npm install && npm run dev   # frontend on :5173
```

### Docker
```bash
cp .env.example .env           # set SECRET_KEY to a real secret
docker compose up --build
```

---

## Security Notes
- JWT tokens expire after 60 minutes
- Registration is permanently locked after the first account is created
- Auto-block uses `iptables` (Linux) or `netsh advfirewall` (Windows)
- Whitelisted devices can never be auto-blocked
- Only monitor networks you own or have explicit written permission to test
