# AI-Powered WiFi Security Monitor

## Requirements
- Python 3.11+
- A WiFi adapter that supports monitor mode
- Redis (for Celery workers)
- Node.js 20 LTS (for frontend)

## Setup

```bash
# 1. Create and activate virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Put your WiFi adapter in monitor mode (Linux)
sudo airmon-ng start wlan0

# 4. Set environment variables (copy and fill in)
cp .env.example .env

# 5. Start the backend
make start
```

## Commands

| Command | Description |
|---|---|
| `make start` | Start FastAPI backend |
| `make train` | Train ML models from baseline data |
| `make reset` | Wipe and reinitialise the database |
| `make backup` | Backup the SQLite database |
| `make test` | Run all tests |

## Docker

```bash
docker compose up --build
```

## Project Structure

```
backend/       FastAPI app, detection logic, alert router
frontend/      React + Vite dashboard (scaffold with: npm create vite@latest)
ml/            Model training scripts
tests/         Unit and integration tests
```

## Legal
Only monitor networks you own or have explicit written permission to test.
