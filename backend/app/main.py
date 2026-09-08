from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import api_router
from app.db.database import engine, Base
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PIMS - Phosboucraa Inventory Management System",
    description="Inventory management system for Phosboucraa",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend-production-b095.up.railway.app",
        "http://localhost:5173",  # dev local (Vite)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "PIMS API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
