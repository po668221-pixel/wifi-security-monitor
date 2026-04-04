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
│   │   ├── routes.py         REST endpoints (devices, alerts)
│   │   └── websocket.py      WebSocket live alert broadcast
│   ├── alerts/
│   │   └── router.py         Email / Slack / Telegram senders
│   ├── capture/
│   │   ├── sniffer.py        Scapy packet capture + frame parser
│   │   └── pipeline.py       Packet handler, detection dispatcher
│   ├── database/
│   │   └── schema.py         SQLAlchemy models (Device, Alert)
│   └── detection/
│       ├── rules.py          ARP spoof, deauth flood, evil twin, port scan
│       └── ml_detector.py    Isolation Forest + LSTM scoring
├── frontend/                 React + Vite dashboard (see FRONTEND.md)
├── ml/
│   └── train.py              Model training script
├── tests/                    pytest test suite
├── docs/                     This documentation folder
├── Dockerfile
├── docker-compose.yml
├── Makefile
└── requirements.txt
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/devices` | List all detected devices |
| GET | `/api/alerts?skip=0&limit=100` | Paginated alert history |
| PATCH | `/api/alerts/{id}/acknowledge` | Mark alert as acknowledged |
| WS | `/ws/alerts` | Live alert stream |

---

## Detection Engine

| Attack Type | Severity | Detection Method |
|---|---|---|
| `ARP_SPOOF` | HIGH | Same IP maps to different MAC |
| `DEAUTH_FLOOD` | HIGH | >10 deauth frames in 5-second window |
| `EVIL_TWIN_AP` | CRITICAL | Same SSID, different BSSID |
| `PORT_SCAN` | MEDIUM | >15 unique ports from same IP in 10s |

---

## Running the Project

### Local (with virtual environment)
```bash
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # fill in your values
make start                     # backend on :8000
# in another terminal:
cd frontend && npm install && npm run dev   # frontend on :5173
```

### Docker
```bash
cp .env.example .env           # set SECRET_KEY to a real secret
docker compose up --build
```
