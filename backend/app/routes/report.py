from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import shutil
import os
import uuid
from app.core.config import settings

from app.core.database import get_db
from app.services.ai import analyze_image
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