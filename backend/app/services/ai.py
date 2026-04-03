from app.services.ai_classifier import classify_trash_image


async def analyze_image(file_path: str):
    try:
        classifier_result = await classify_trash_image(file_path)
        if "error" in classifier_result:
            return classifier_result

        return {
            "label": classifier_result["label"],
            "confidence": classifier_result["confidence"],
            "top_predictions": classifier_result.get("top_predictions", []),
            "model_path": classifier_result.get("model_path"),
            "detections": classifier_result.get("detections", []),
        }
    except Exception as exc:
        print(f"Error in analyze_image: {exc}")
        return {"error": str(exc)}
