import smtplib
import requests
from email.mime.text import MIMEText

seen_alerts = {}

def should_send(alert_id, cooldown=60):
    import time
    now = time.time()
    if alert_id in seen_alerts and now - seen_alerts[alert_id] < cooldown:
        return False
    seen_alerts[alert_id] = now
    return True

def send_email(subject, body, to, smtp_config):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = smtp_config["from"]
    msg["To"] = to
    with smtplib.SMTP(smtp_config["host"], smtp_config["port"]) as s:
        s.starttls()
        s.login(smtp_config["user"], smtp_config["password"])
        s.send_message(msg)

def send_slack(webhook_url, message):
    try:
        requests.post(webhook_url, json={"text": message}, timeout=5)
    except requests.RequestException:
        pass

def send_telegram(bot_token, chat_id, message):
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    try:
        requests.post(url, json={"chat_id": chat_id, "text": message}, timeout=5)
    except requests.RequestException:
        pass
