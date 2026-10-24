"""
FastAPI Main Application Entry Point.

Configures CORS, lifespan events for database initialization and seeding,
and mounts all domain routers for the DevSync Upskilling Platform.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, SessionLocal, get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.services.mock_seed import seed_database
from app.routes import (
    modules_router,
    progress_router,
    tutor_router,
    webhooks_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle context manager.
    Initializes database tables and seeds demo data on startup.
    """
    # Create all database tables if they do not exist
    Base.metadata.create_all(bind=engine)

    # Populate database with realistic corporate briefs and demo learner
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield


# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Interactive Zero-Setup Upskilling Microlearning Platform with Cloud Run deployment",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS) for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Next.js dev server & Cloud Run previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount domain routers
app.include_router(modules_router)
app.include_router(progress_router)
app.include_router(tutor_router)
app.include_router(webhooks_router)


@app.get("/health", tags=["System"])
def health_check():
    """
    Cloud Run readiness and liveness health probe endpoint.
    """
    return {
        "status": "healthy",
        "service": "devsync-fastapi-backend",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/api/user/me", response_model=UserResponse, tags=["Users"])
def get_current_learner(db: Session = Depends(get_db)):
    """
    Returns the active demo learner profile used by the frontend dashboard.
    """
    user = db.query(User).first()
    return user


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
