from sqlalchemy import create_engine, Column, String, Boolean, Float, DateTime
from sqlalchemy.orm import DeclarativeBase, sessionmaker
import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wifi_monitor.db")

_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine)
class Base(DeclarativeBase):
    pass

class Device(Base):
    __tablename__ = "devices"
    mac = Column(String, primary_key=True)
    ip = Column(String)
    hostname = Column(String)
    vendor = Column(String)
    first_seen = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    severity = Column(String)
    type = Column(String)
    message = Column(String)
    acknowledged = Column(Boolean, default=False)
    ml_score = Column(Float, nullable=True)

class BlockedDevice(Base):
    __tablename__ = "blocked_devices"
    mac = Column(String, primary_key=True)
    ip = Column(String)
    reason = Column(String)
    blocked_at = Column(DateTime, default=datetime.datetime.utcnow)
    blocked_by = Column(String, default="manual")
    is_whitelisted = Column(Boolean, default=False)

class Settings(Base):
    __tablename__ = "settings"
    key = Column(String, primary_key=True)
    value = Column(String)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

