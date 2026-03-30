from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String)
    label = Column(String)
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)