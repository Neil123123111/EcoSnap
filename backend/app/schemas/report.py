from pydantic import BaseModel
from app.core.config import settings

UPLOAD_DIR = settings.UPLOAD_DIR


class ReportResponse(BaseModel):
    label: str
    confidence: float

    class Config:
        from_attributes = True