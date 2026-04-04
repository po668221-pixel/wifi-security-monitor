import os
from dotenv import load_dotenv

load_dotenv()

INTERFACE = os.getenv("WIFI_INTERFACE", "wlan0mon")
SECRET_KEY = os.getenv("SECRET_KEY", "change-me")

SMTP = {
    "host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
    "port": int(os.getenv("SMTP_PORT", 587)),
    "user": os.getenv("SMTP_USER", ""),
    "password": os.getenv("SMTP_PASSWORD", ""),
    "from": os.getenv("SMTP_FROM", ""),
}

SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK", "")
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
ALERT_EMAIL_TO = os.getenv("ALERT_EMAIL_TO", "")
