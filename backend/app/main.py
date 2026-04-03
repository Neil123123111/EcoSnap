from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routes import report, auth, train, community
from app.core.database import engine
from app.models import report as report_model
from app.models import user as user_model
from app.models import community as community_model
from app.core.config import Settings
from sqlalchemy import inspect, text

settings = Settings()
app = FastAPI()

# CORS - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default dev port
        "http://localhost:3000",  # Alternative dev port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#  tạo table
report_model.Base.metadata.create_all(bind=engine)
user_model.Base.metadata.create_all(bind=engine)
community_model.Base.metadata.create_all(bind=engine)


def ensure_report_columns() -> None:
    inspector = inspect(engine)
    if "reports" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("reports")}
    missing_columns = {
        "transcript": "ALTER TABLE reports ADD COLUMN transcript VARCHAR",
        "latitude": "ALTER TABLE reports ADD COLUMN latitude FLOAT",
        "longitude": "ALTER TABLE reports ADD COLUMN longitude FLOAT",
    }

    with engine.begin() as connection:
        for column_name, statement in missing_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(statement))


ensure_report_columns()


def ensure_user_columns() -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("users")}
    missing_columns = {
        "display_name": "ALTER TABLE users ADD COLUMN display_name VARCHAR",
        "avatar_url": "ALTER TABLE users ADD COLUMN avatar_url VARCHAR",
    }

    with engine.begin() as connection:
        for column_name, statement in missing_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(statement))


ensure_user_columns()

#  serve static
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# health check
@app.get("/health")
async def health():
    return {"status": "ok"}

#  routes
app.include_router(auth.router)
app.include_router(report.router)
app.include_router(train.router)
app.include_router(community.router)
