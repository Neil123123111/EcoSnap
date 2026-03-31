from ultralytics import YOLO
from PIL import Image
import os

# load YOLO (nhanh nhất)
# Use absolute path or look in backend root
model_path = "yolov8n.pt"
if not os.path.exists(model_path):
    # Try looking in backend root
    model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "yolov8n.pt")

try:
    yolo_model = YOLO(model_path)
except Exception as e:
    print(f" YOLO load failed ({model_path}): {e}")
    yolo_model = None

# COCO class mapping đơn giản cho EcoSnap
TARGET_OBJECTS = {
    39: "bottle",
    41: "cup",
    0: "person",
}


async def detect_objects(file):
    try:
        if yolo_model is None:
            return [], []
        
        img = Image.open(file).convert("RGB")
        img = img.resize((640, 640))  # tăng tốc

        results = yolo_model(img)

        boxes = results[0].boxes

        if boxes is None:
            return [], []

        objects = []
        box_list = []

        for box in boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])

            if cls_id in TARGET_OBJECTS:
                objects.append({
                    "name": TARGET_OBJECTS[cls_id],
                    "confidence": round(conf, 3)
                })

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                box_list.append({
                    "x1": int(x1),
                    "y1": int(y1),
                    "x2": int(x2),
                    "y2": int(y2)
                })

        return objects, box_list

    except Exception as e:
        print("YOLO ERROR:", e)
        return [], []