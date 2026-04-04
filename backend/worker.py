from celery import Celery
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("wifi_monitor", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
)

@celery_app.task
def run_active_scan(interface):
    from backend.capture.sniffer import start_capture
    from backend.capture.pipeline import packet_handler
    start_capture(interface, packet_handler)

def _get_notif_config():
    from backend.database.schema import SessionLocal, Settings
    from backend.config import SLACK_WEBHOOK, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, SMTP, ALERT_EMAIL_TO
    db = SessionLocal()
    try:
        rows = {r.key: r.value for r in db.query(Settings).all()}
    finally:
        db.close()
    def get(key, fallback=""):
        return rows.get(key) or fallback
    return {
        "email_enabled": get("email_enabled", "false") == "true",
        "slack_enabled": get("slack_enabled", "false") == "true",
        "telegram_enabled": get("telegram_enabled", "false") == "true",
        "slack_webhook": get("slack_webhook", SLACK_WEBHOOK),
        "telegram_token": get("telegram_token", TELEGRAM_TOKEN),
        "telegram_chat_id": get("telegram_chat_id", TELEGRAM_CHAT_ID),
        "alert_email_to": get("alert_email_to", ALERT_EMAIL_TO),
        "smtp": {
            "host": get("smtp_host", SMTP["host"]),
            "port": int(get("smtp_port", str(SMTP["port"]))),
            "user": get("smtp_user", SMTP["user"]),
            "password": get("smtp_password", SMTP["password"]),
            "from": get("smtp_from", SMTP["from"]),
        },
    }

@celery_app.task
def dispatch_alert(alert: dict):
    from backend.alerts.router import send_slack, send_telegram, send_email, should_send

    alert_id = alert.get("id", alert.get("type", "unknown"))
    if not should_send(alert_id):
        return

    cfg = _get_notif_config()
    message = f"[{alert['severity']}] {alert['type']}: {alert['message']}"

    if cfg["slack_enabled"] and cfg["slack_webhook"]:
        send_slack(cfg["slack_webhook"], message)
    if cfg["telegram_enabled"] and cfg["telegram_token"] and cfg["telegram_chat_id"]:
        send_telegram(cfg["telegram_token"], cfg["telegram_chat_id"], message)
    if cfg["email_enabled"] and cfg["alert_email_to"] and cfg["smtp"]["user"]:
        send_email(alert["type"], message, cfg["alert_email_to"], cfg["smtp"])
