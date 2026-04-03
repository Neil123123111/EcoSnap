from typing import List, Optional

from pydantic import BaseModel


class ClassPrediction(BaseModel):
    label: str
    confidence: float


class ClassifyTrashResponse(BaseModel):
    image_url: str
    annotated_image_url: Optional[str] = None
    label: str
    confidence: float
    top_predictions: List[ClassPrediction]
    model_path: str


class ModelInfoResponse(BaseModel):
    configured_model_path: str
    resolved_model_path: str
    dataset_path: Optional[str] = None
    roboflow_project: Optional[str] = None
    roboflow_version: Optional[int] = None
    exists: bool
    model_loaded: bool
    file_size_bytes: Optional[int] = None
