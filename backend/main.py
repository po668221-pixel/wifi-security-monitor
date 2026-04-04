from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import threading
import os
from backend.api.routes import router
from backend.api.websocket import router as ws_router
from backend.auth.routes import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    from backend.database.schema import Base, engine
    Base.metadata.create_all(bind=engine)

    # Migrate: add ml_score column if it doesn't exist yet
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE alerts ADD COLUMN ml_score FLOAT"))
            conn.commit()
        except Exception:
            pass

    # Load ML models if available
    from backend.detection.ml_detector import load_models
    load_models()

    # Start packet capture pipeline in a background thread
    try:
        from backend.capture.pipeline import run
        t = threading.Thread(target=run, daemon=True)
        t.start()
    except Exception:
        pass  # No WiFi adapter in dev — API still starts

    yield

app = FastAPI(title="WiFi Security Monitor", version="1.0", lifespan=lifespan)

_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(router)
app.include_router(ws_router)

@app.get("/health")
def health():
    return {"status": "ok"}
