start:
	PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

train:
	PYTHONPATH=. python ml/train.py

reset:
	rm -f wifi_monitor.db
	PYTHONPATH=. python -c "from backend.database.schema import Base, engine; Base.metadata.create_all(bind=engine)"

backup:
	cp wifi_monitor.db wifi_monitor_backup_$(shell date +%Y%m%d_%H%M%S).db

test:
	pytest tests/ -v
