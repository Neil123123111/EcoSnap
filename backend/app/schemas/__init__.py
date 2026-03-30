from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReportCreate(BaseModel):
    label: str
    confidence: float
    image_url: str
    lat: Optional[float] = None
    lng: Optional[float] = None


class ReportRead(BaseModel):
    id: int
    label: str
    confidence: float
    image_url: str
    lat: Optional[float]
    lng: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True  # 🔥 SQLAlchemy compatibility