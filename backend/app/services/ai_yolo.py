import asyncio

from inference_sdk import InferenceHTTPClient

from app.core.config import settings
from app.services.ai_classifier import TRASH_CLASSES, _get_client, _parse_detections


async def detect_objects(file_path: str):
    """Run YOLO World and return objects, bounding boxes, and trash statistics."""
    try:
        client = _get_client()

        raw_result = await asyncio.to_thread(
            lambda: client.run_workflow(
                workspace_name=settings.ROBOFLOW_WORKSPACE,
                workflow_id=settings.YOLO_WORLD_WORKFLOW_ID,
                images={"image": file_path},
                parameters={"classes": TRASH_CLASSES},
                use_cache=True,
            )
        )

        detections = _parse_detections(raw_result or [])

        objects = []
        box_list = []
        trash_count = len(detections)
        total_detections = len(detections)

        for output in (raw_result or []):
            if not isinstance(output, dict):
                continue
            preds = output.get("predictions", None)
            if preds is None:
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
                if not isinstance(det, dict):
                    continue
                objects.append({
                    "name": det.get("class", "unknown"),
                    "confidence": round(float(det.get("confidence", 0)), 3),
                })
                x = det.get("x", 0)
                y = det.get("y", 0)
                w = det.get("width", 0)
                h = det.get("height", 0)
                box_list.append({
                    "x1": int(x - w / 2),
                    "y1": int(y - h / 2),
                    "x2": int(x + w / 2),
                    "y2": int(y + h / 2),
                })

        trash_percent = round((trash_count / total_detections * 100), 2) if total_detections > 0 else 0

        if trash_count == 0:
            severity = "Clean"
        elif trash_count <= 2:
            severity = "Low"
        elif trash_count <= 5:
            severity = "Medium"
        else:
            severity = "High"

        return objects, box_list, {
            "trash_percent": trash_percent,
            "trash_count": trash_count,
            "severity": severity,
        }

    except Exception as e:
        print("YOLO World ERROR:", e)
        return [], [], {"trash_percent": 0, "severity": "Error"}
