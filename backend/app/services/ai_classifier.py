import asyncio
from typing import Any, Optional

from inference_sdk import InferenceHTTPClient

from app.core.config import settings


# Trash-related classes passed to YOLO World
TRASH_CLASSES = [
    "plastic bottle",
    "glass bottle",
    "cardboard",
    "paper",
    "metal can",
    "trash",
    "food waste",
    "cigarette",
    "plastic bag",
    "styrofoam",
]

# Map YOLO World class names → simplified category labels
CATEGORY_MAP = {
    "plastic bottle": "bottle",
    "plastic bag": "bag",
    "styrofoam": "styrofoam",
    "glass bottle": "glass bottle",
    "cardboard": "cardboard",
    "paper": "paper",
    "metal can": "can",
    "trash": "trash",
    "food waste": "trash",
    "cigarette": "trash",
}

_client: Optional[InferenceHTTPClient] = None


def _get_client() -> InferenceHTTPClient:
    global _client
    if _client is None:
        _client = InferenceHTTPClient(
            api_url=settings.YOLO_WORLD_API_URL,
            api_key=settings.ROBOFLOW_API_KEY,
        )
    return _client


def _run_yolo_world(image_path: str) -> list:
    """Synchronous call to Roboflow YOLO World workflow."""
    client = _get_client()
    result = client.run_workflow(
        workspace_name=settings.ROBOFLOW_WORKSPACE,
        workflow_id=settings.YOLO_WORLD_WORKFLOW_ID,
        images={"image": image_path},
        parameters={"classes": TRASH_CLASSES},
        use_cache=True,
    )
    return result if result else []


def _parse_detections(raw_result: list) -> list:
    """Extract a flat list of {class, confidence} from the workflow result."""
    detections = []
    for output in raw_result:
        if not isinstance(output, dict):
            continue
        # Handle both direct list and nested {"predictions": [...]} structures
        preds = output.get("predictions", None)
        if preds is None:
            # Try the first dict value that is a list or has "predictions"
            for v in output.values():
                if isinstance(v, list):
                    preds = v
                    break
                if isinstance(v, dict) and "predictions" in v:
                    preds = v["predictions"]
                    break
        if isinstance(preds, dict):
            preds = preds.get("predictions", [])
        if not isinstance(preds, list):
            continue
        for det in preds:
            if isinstance(det, dict) and "class" in det and "confidence" in det:
                detections.append({
                    "raw_class": det["class"],
                    "label": CATEGORY_MAP.get(det["class"], det["class"]),
                    "confidence": round(float(det["confidence"]), 4),
                    "x": float(det.get("x", 0)),
                    "y": float(det.get("y", 0)),
                    "w": float(det.get("width", 0)),
                    "h": float(det.get("height", 0)),
                })
    return detections


async def classify_trash_image(file_path: str) -> dict:
    """Run YOLO World on the given image file path and return classification result."""
    try:
        raw_result = await asyncio.to_thread(_run_yolo_world, file_path)
        detections = _parse_detections(raw_result)

        if not detections:
            return {
                "label": "no_trash_detected",
                "confidence": 0.0,
                "top_predictions": [],
                "model_path": f"{settings.ROBOFLOW_WORKSPACE}/{settings.YOLO_WORLD_WORKFLOW_ID}",
                "detections": [],
            }

        # Aggregate: keep highest confidence per simplified label
        best_per_label: dict = {}
        for det in detections:
            lbl = det["label"]
            if lbl not in best_per_label or det["confidence"] > best_per_label[lbl]:
                best_per_label[lbl] = det["confidence"]

        top_predictions = sorted(
            [{"label": lbl, "confidence": conf} for lbl, conf in best_per_label.items()],
            key=lambda x: x["confidence"],
            reverse=True,
        )

        return {
            "label": top_predictions[0]["label"],
            "confidence": top_predictions[0]["confidence"],
            "top_predictions": top_predictions,
            "model_path": f"{settings.ROBOFLOW_WORKSPACE}/{settings.YOLO_WORLD_WORKFLOW_ID}",
            "detections": detections,
        }
    except Exception as exc:
        return {"error": str(exc)}


def get_classifier_model_info() -> dict:
    return {
        "configured_model_path": settings.YOLO_WORLD_WORKFLOW_ID,
        "resolved_model_path": f"{settings.YOLO_WORLD_API_URL}/{settings.ROBOFLOW_WORKSPACE}/{settings.YOLO_WORLD_WORKFLOW_ID}",
        "dataset_path": None,
        "roboflow_project": settings.ROBOFLOW_WORKSPACE or None,
        "roboflow_version": None,
        "exists": True,
        "model_loaded": True,
        "file_size_bytes": None,
    }
