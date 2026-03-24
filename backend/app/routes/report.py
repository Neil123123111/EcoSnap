from fastapi import APIRouter, UploadFile, File
from app.services.ai import analyze_image

router = APIRouter()

@router.post("/")
async def create_report(file: UploadFile = File(...)):
    result = await analyze_image(file)

    return {
        "message": "Report received",
        "analysis": result
    }

@router.get("/")
async def get_reports():
    return [
        {"lat": 10.76, "lng": 106.66}
    ]