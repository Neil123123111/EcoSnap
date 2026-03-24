from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import report

app = FastAPI()

# cho phép frontend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(report.router, prefix="/reports")