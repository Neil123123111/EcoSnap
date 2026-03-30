from dotenv import load_dotenv
import os

# 🔥 load .env
load_dotenv()


class Settings:
    # ========================
    # 🔥 DATABASE
    # ========================
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:Neildo123!%40%23@localhost:5432/ecosnap"
    )

    # ========================
    # 📂 UPLOAD
    # ========================
    UPLOAD_DIR: str = os.getenv(
        "UPLOAD_DIR",
        "app/static/upload"
    )

    # ========================
    # 🌐 SERVER
    # ========================
    BASE_URL: str = os.getenv(
        "BASE_URL",
        "http://127.0.0.1:8000"
    )

    # ========================
    # 🔐 SECRET (future use)
    # ========================
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "super-secret-key"
    )

    # ========================
    # ⚙️ DEBUG
    # ========================
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"

    # ========================
    # 🔍 VALIDATION
    # ========================
    def validate(self):
        if not self.DATABASE_URL:
            raise ValueError("❌ DATABASE_URL is missing")


# 🔥 singleton
settings = Settings()
settings.validate()