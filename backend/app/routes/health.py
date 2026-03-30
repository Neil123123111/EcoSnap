from fastapi import APIRouter
from sqlalchemy import text
from app.core.database import SessionLocal

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/health/db")
def health_db():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
    finally:
        db.close()