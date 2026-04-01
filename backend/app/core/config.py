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
