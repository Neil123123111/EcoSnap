from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.schemas.train import TrainYOLORequest, TrainYOLOStatusResponse
from app.services.train import get_training_status, queue_training_status, start_training_job


router = APIRouter(prefix="/train-yolo", tags=["Train"])


@router.post("", response_model=TrainYOLOStatusResponse)
async def train_yolo(payload: TrainYOLORequest, background_tasks: BackgroundTasks):
    current_status = get_training_status()
    if current_status["status"] in {"queued", "running"}:
        raise HTTPException(status_code=409, detail="A training job is already running.")

    queued_status = queue_training_status(run_name=payload.name, device=payload.device)

    background_tasks.add_task(
        start_training_job,
        epochs=payload.epochs,
        imgsz=payload.imgsz,
        device=payload.device,
        run_name=payload.name,
        version=payload.version,
        export_format=payload.export_format,
        model_path=payload.model_path,
    )

    return TrainYOLOStatusResponse(**queued_status)


@router.get("/status", response_model=TrainYOLOStatusResponse)
async def train_yolo_status():
    return TrainYOLOStatusResponse(**get_training_status())
