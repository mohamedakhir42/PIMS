from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.db.database import engine, Base

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
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "PIMS API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
