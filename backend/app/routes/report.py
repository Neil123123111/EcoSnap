from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session
import shutil
import os
import uuid
from typing import Optional
from app.core.config import settings

from app.core.database import get_db
from app.services.ai import analyze_image
from app.services.iqair import get_city_air_quality, get_nearest_city_air_quality
from app.services.open_meteo import get_air_quality_timeline
from app.models.report import Report

router = APIRouter(prefix="/report", tags=["Report"])

UPLOAD_DIR = "app/static/upload"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        #  validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        #  tạo tên file unique
        filename = f"{uuid.uuid4()}.jpg"
        file_path = f"{UPLOAD_DIR}/{filename}"

        #  save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        #  reset file để AI đọc lại
        file.file.seek(0)

        #  AI predict
        result = await analyze_image(file.file)
        
        #  check AI error
        if "error" in result:
            raise HTTPException(status_code=500, detail=f"AI Analysis failed: {result['error']}")

        #  url để frontend dùng
        image_url = f"{settings.BASE_URL}/static/upload/{filename}"

        #  save DB
        report = Report(
            image_url=image_url,
            label=result["label"],
            confidence=result["confidence"]
        )

        db.add(report)
        db.commit()

        return {
            "image_url": image_url,
            "label": result["label"],
            "confidence": result["confidence"],
            "boxes": result.get("boxes", [])
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.get("/air-quality")
async def air_quality(
    lat: Optional[str] = None,
    lon: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    country: Optional[str] = None,
):
    if lat and lon:
        return await get_nearest_city_air_quality(lat=lat, lon=lon)

    if city and state and country:
        return await get_city_air_quality(city=city, state=state, country=country)

    raise HTTPException(
        status_code=400,
        detail="Provide either lat/lon or city/state/country to fetch air quality data",
    )


@router.get("/recent")
async def recent_reports(limit: int = 10, db: Session = Depends(get_db)):
    safe_limit = max(1, min(limit, 50))
    reports = db.query(Report).order_by(desc(Report.created_at)).limit(safe_limit).all()

    return [
        {
            "id": report.id,
            "image_url": report.image_url,
            "label": report.label,
            "confidence": report.confidence,
            "created_at": report.created_at.isoformat() if report.created_at else None,
        }
        for report in reports
    ]


@router.get("/air-quality-timeline")
async def air_quality_timeline(
    lat: str,
    lon: str,
):
    return await get_air_quality_timeline(lat=lat, lon=lon)
