def load_model():
    return "fake-model"

model = load_model()

async def analyze_image(file):
    return {
        "waste_type": "plastic",
        "severity": 0.8
    }