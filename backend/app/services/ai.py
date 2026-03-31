import tensorflow as tf
import numpy as np
from PIL import Image
import os

from app.services.ai_yolo import detect_objects

# load model keras with better path handling
model_path = "app/ai_model/keras_model.h5"
if not os.path.exists(model_path):
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ai_model/keras_model.h5")

try:
    model = tf.keras.models.load_model(
        model_path,
        compile=False
    )
except Exception as e:
    print(f"⚠️ Keras model load failed ({model_path}): {e}")
    model = None

#  SỬA ĐÚNG THỨ TỰ CLASS (QUAN TRỌNG)
CLASSES = ["cardboard", "glass", "metal", "plastic", "paper", "trash"]


async def analyze_image(file):
    try:
        # BƯỚC 1: YOLO detect
        objects, boxes = await detect_objects(file)

        # nếu nhiều object → trash
# nếu có object + confidence không cao → trash
        if len(objects) >= 2 or (len(objects) == 1 and objects[0]["name"] == "person"):
            return {
        "label": "trash",
        "confidence": 0.9,
        "objects": objects,
        "boxes": boxes
        }

        # BƯỚC 2: fallback sang model cũ
        if model is None:
            return {
                "label": "trash",
                "confidence": 0.5,
                "objects": objects,
                "boxes": boxes
            }
        
        file.seek(0)

        img = Image.open(file).convert("RGB")
        img = img.resize((128, 128))

        img_array = np.array(img).astype("float32") / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        pred = model.predict(img_array)[0]

        class_idx = int(np.argmax(pred))
        confidence = float(np.max(pred))

        return {
            "label": CLASSES[class_idx],
            "confidence": round(confidence, 4),
            "objects": objects,
            "boxes": boxes
        }

    except Exception as e:
        return {"error": str(e)}