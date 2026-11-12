from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.connection import get_db

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health() -> dict:
    """Liveness check (the frontend already expects GET /health)."""
    return {"data": {"status": "ok", "service": "carbonexa-api"}}


@router.get("/db")
def health_db(db: Session = Depends(get_db)) -> dict:
    """Readiness check: confirms the database connection works."""
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database is unavailable")
    return {"data": {"status": "ok", "database": "connected"}}
