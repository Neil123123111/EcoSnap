from typing import Optional

from pydantic import BaseModel

from app.core.config import settings

UPLOAD_DIR = settings.UPLOAD_DIR


class ReportResponse(BaseModel):
    label: str
    confidence: float

    class Config:
        from_attributes = True


class SubmitReportResponse(BaseModel):
    id: int
    image_url: str
    label: str
    confidence: float
    transcript: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: Optional[str] = None
