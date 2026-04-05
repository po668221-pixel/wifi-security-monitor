FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpcap-dev \
    nmap \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python -m backend.scripts.train_demo_models

RUN mkdir -p /app/data

RUN useradd -m appuser && chown -R appuser /app
USER appuser

ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
