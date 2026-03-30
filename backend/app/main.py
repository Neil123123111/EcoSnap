from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routes import report, auth
from app.core.database import engine
from app.models import report as report_model
from app.models import user as user_model
from app.core.config import Settings

settings = Settings()
app = FastAPI()

# 👉 CORS - allow frontend to connect
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

# 👉 tạo table
report_model.Base.metadata.create_all(bind=engine)
user_model.Base.metadata.create_all(bind=engine)

# 👉 serve static
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# 👉 health check
@app.get("/health")
async def health():
    return {"status": "ok"}

# 👉 routes
app.include_router(auth.router)
app.include_router(report.router)