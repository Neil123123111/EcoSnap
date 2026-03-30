from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from dotenv import load_dotenv
import os
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

# 🔥 load biến môi trường từ .env
load_dotenv()

# 🔥 lấy DATABASE_URL (có fallback để tránh lỗi)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Neildo123!%40%23@localhost:5432/ecosnap"
)

# 🚨 nếu vẫn None → crash rõ ràng
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL not found in environment variables")

# 🔥 tạo engine
engine = create_engine(
    DATABASE_URL,
    echo=False,        # debug SQL (bật True nếu cần)
    future=True
)

# 🔥 tạo session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 🔥 base model
Base = declarative_base()


# 🔥 dependency dùng cho FastAPI
def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()