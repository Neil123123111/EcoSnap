from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy import desc
from sqlalchemy.orm import Session
import shutil
import os
import uuid
from typing import Optional
from app.core.config import settings

from app.core.database import get_db
from app.services.ai import analyze_image
from app.services.ai_classifier import get_classifier_model_info
from app.services.draw_boxes import draw_boxes_on_image
from app.services.iqair import get_city_air_quality, get_nearest_city_air_quality
from app.services.open_meteo import get_air_quality_timeline
from app.models.report import Report
from app.models.community import CommunityPost
from app.schemas.classifier import ClassifyTrashResponse, ModelInfoResponse
from app.schemas.report import SubmitReportResponse

router = APIRouter(prefix="/report", tags=["Report"])

UPLOAD_DIR = "app/static/upload"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/classify", response_model=ClassifyTrashResponse)
async def analyze(file: UploadFile = File(...)):
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        filename = f"{uuid.uuid4()}.jpg"
        file_path = f"{UPLOAD_DIR}/{filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = await analyze_image(file_path)

        if "error" in result:
            raise HTTPException(status_code=500, detail=f"AI Analysis failed: {result['error']}")

        image_url = f"{settings.BASE_URL}/static/upload/{filename}"

        # Draw bounding boxes and save annotated image
        annotated_image_url = None
        detections = result.get("detections", [])
        if detections:
            annotated_filename = f"annotated_{filename}"
            annotated_path = f"{UPLOAD_DIR}/{annotated_filename}"
            try:
                draw_boxes_on_image(file_path, detections, annotated_path)
                annotated_image_url = f"{settings.BASE_URL}/static/upload/{annotated_filename}"
            except Exception as draw_err:
                print(f"draw_boxes failed: {draw_err}")

        return {
            "image_url": image_url,
            "annotated_image_url": annotated_image_url,
            "label": result["label"],
            "confidence": result["confidence"],
            "top_predictions": result.get("top_predictions", []),
            "model_path": result.get("model_path") or "",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.get("/model-info", response_model=ModelInfoResponse)
async def model_info():
    return get_classifier_model_info()


@router.post("/submit", response_model=SubmitReportResponse)
async def submit_report(
    image_url: str = Form(...),
    label: str = Form(...),
    confidence: float = Form(...),
    transcript: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    db: Session = Depends(get_db),
):
    try:
        report = Report(
            image_url=image_url,
            label=label,
            confidence=confidence,
            transcript=transcript or None,
            latitude=latitude,
            longitude=longitude,
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        # Auto-create a community post so the widget count stays 1:1
        post_content = f"[AI Report] {label.capitalize()} detected ({confidence * 100:.0f}% confidence)"
        if transcript:
            post_content += f"\n{transcript}"
        community_post = CommunityPost(
            username="EcoSnap Bot",
            content=post_content,
            image_url=image_url,
            latitude=latitude,
            longitude=longitude,
        )
        db.add(community_post)
        db.commit()

        return {
            "id": report.id,
            "image_url": report.image_url,
            "label": report.label,
            "confidence": report.confidence,
            "transcript": report.transcript,
            "latitude": report.latitude,
            "longitude": report.longitude,
            "created_at": report.created_at.isoformat() if report.created_at else None,
        }
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Server error: {str(exc)}")


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
            "latitude": report.latitude,
            "longitude": report.longitude,
            "transcript": report.transcript,
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
