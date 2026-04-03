from typing import Literal, Optional

from pydantic import BaseModel, Field


class TrainYOLORequest(BaseModel):
    epochs: int = Field(default=50, ge=1, le=1000)
    imgsz: int = Field(default=640, ge=32, le=2048)
    device: str = Field(default="auto")
    name: str = Field(default="ecosnap_8_classes", min_length=1, max_length=100)
    version: int = Field(default=1, ge=1)
    export_format: str = Field(default="folder", alias="format")
    model_path: str = Field(default="")

    model_config = {
        "populate_by_name": True,
    }


class TrainYOLOStatusResponse(BaseModel):
    status: Literal["idle", "queued", "running", "completed", "failed"]
    message: str
    device: Optional[str] = None
    run_name: Optional[str] = None
    data_yaml: Optional[str] = None
    run_dir: Optional[str] = None
    best_model_path: Optional[str] = None
    started_at: Optional[str] = None
    finished_at: Optional[str] = None
    error: Optional[str] = None
