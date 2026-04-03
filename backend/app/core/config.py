import os
from pathlib import Path

from dotenv import load_dotenv

# Always load backend/.env regardless of current working directory.
BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_ROOT / ".env")


class Settings:
    # ========================
    #  DATABASE
    # ========================
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:Neildo123!%40%23@localhost:5432/ecosnap"
    )

    # ========================
    # UPLOAD
    # ========================
    UPLOAD_DIR: str = os.getenv(
        "UPLOAD_DIR",
        "app/static/upload"
    )

    # ========================
    # SERVER
    # ========================
    BASE_URL: str = os.getenv(
        "BASE_URL",
        "http://localhost:8001"
    )

    # ========================
    # SECRET (future use)
    # ========================
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "super-secret-key"
    )

    IQAIR_API_KEY: str = os.getenv(
        "IQAIR_API_KEY",
        ""
    )

    IQAIR_BASE_URL: str = os.getenv(
        "IQAIR_BASE_URL",
        "https://api.airvisual.com/v2"
    )

    OPEN_METEO_AIR_QUALITY_BASE_URL: str = os.getenv(
        "OPEN_METEO_AIR_QUALITY_BASE_URL",
        "https://air-quality-api.open-meteo.com/v1"
    )

    # ========================
    # ROBOFLOW TRAINING
    # ========================
    ROBOFLOW_API_KEY: str = os.getenv(
        "ROBOFLOW_API_KEY",
        "dQDfZWUMCHn8KqidqS9o"
    )

    ROBOFLOW_WORKSPACE: str = os.getenv(
        "ROBOFLOW_WORKSPACE",
        "neil-c8awa"
    )

    ROBOFLOW_PROJECT: str = os.getenv(
        "ROBOFLOW_PROJECT",
        ""
    )

    ROBOFLOW_VERSION: int = int(os.getenv("ROBOFLOW_VERSION", "1"))

    ROBOFLOW_FORMAT: str = os.getenv(
        "ROBOFLOW_FORMAT",
        "folder"
    )

    # ========================
    # YOLO WORLD INFERENCE
    # ========================
    YOLO_WORLD_API_URL: str = os.getenv(
        "YOLO_WORLD_API_URL",
        "https://serverless.roboflow.com"
    )

    YOLO_WORLD_WORKFLOW_ID: str = os.getenv(
        "YOLO_WORLD_WORKFLOW_ID",
        "yolo-world-small-demo"
    )

    TRAINED_CLASSIFIER_MODEL_PATH: str = os.getenv(
        "TRAINED_CLASSIFIER_MODEL_PATH",
        "runs/ecosnap_8_classes/weights/best.pt"
    )

    # ========================
    # DEBUG
    # ========================
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"

    # ========================
    # VALIDATION
    # ========================
    def validate(self):
        if not self.DATABASE_URL:
            raise ValueError(" DATABASE_URL is missing")


# singleton
settings = Settings()
settings.validate()
