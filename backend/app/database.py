"""
Database Connection and Session Management.

Initializes the SQLAlchemy engine with support for Cloud SQL PostgreSQL
and fallback to local SQLite for zero-setup local development.
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

# Configure engine arguments based on the database dialect
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite requires disabling same-thread check for multi-threaded FastAPI workers
    connect_args["check_same_thread"] = False

# Initialize the SQLAlchemy Engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Automatically verify connections before executing queries
)

# Create thread-local session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Declarative base class for all ORM models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session per request.

    Yields:
        Session: Active SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
