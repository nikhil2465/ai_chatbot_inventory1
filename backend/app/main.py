"""InvenIQ — Inventory Intelligence Platform — FastAPI Application Entry Point."""
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.core.config import get_settings

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")

try:
    from app.db.connection import close_pool, get_pool, is_db_available
    _DB_AVAILABLE = True
except ImportError:
    _DB_AVAILABLE = False

    async def get_pool():
        return None

    async def close_pool():
        pass

    async def is_db_available():
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    cfg = get_settings()
    if _DB_AVAILABLE and cfg.mysql_host:
        await get_pool()
    yield
    if _DB_AVAILABLE:
        await close_pool()


app = FastAPI(
    title="InvenIQ API",
    description="Inventory Intelligence Platform — AI-powered insights for dealers & distributors",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")


@app.get("/", tags=["Health"])
def root():
    return {"service": "InvenIQ API", "version": "1.0.0", "docs": "/docs"}


@app.get("/api/health", tags=["Health"])
async def health():
    cfg = get_settings()
    db_ok = await is_db_available() if _DB_AVAILABLE else False
    return {
        "status": "healthy",
        "openai_configured": bool(cfg.openai_api_key),
        "mysql_connected": db_ok,
        "data_source": "mysql" if db_ok else "demo",
    }


@app.get("/api/db/status", tags=["Health"])
async def db_status():
    if not _DB_AVAILABLE:
        return {"mysql_available": False, "reason": "aiomysql not installed", "data_source": "demo"}
    cfg = get_settings()
    if not cfg.mysql_host:
        return {"mysql_available": False, "reason": "MYSQL_HOST not configured", "data_source": "demo"}
    ok = await is_db_available()
    return {
        "mysql_available": ok,
        "host": cfg.mysql_host,
        "database": cfg.mysql_db,
        "data_source": "mysql" if ok else "demo",
        "reason": "Connected" if ok else "Connection failed — check credentials",
    }
