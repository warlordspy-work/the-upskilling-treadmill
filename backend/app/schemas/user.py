"""
User Pydantic Schemas.

Defines validation and serialization schemas for user registration,
profile retrieval, and subscription tiers.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Base fields shared across user schemas."""

    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone_number: str = Field(
        ...,
        pattern=r"^\+?[1-9]\d{1,14}$",
        description="E.164 phone number required for WhatsApp microlearning nudges",
    )


class UserCreate(UserBase):
    """Schema used when enrolling a new learner."""

    pass


class UserUpdate(BaseModel):
    """Schema for updating learner details."""

    name: Optional[str] = None
    phone_number: Optional[str] = None
    streak_count: Optional[int] = None
    subscription_tier: Optional[str] = None


class UserResponse(UserBase):
    """Response model for learner profiles."""

    id: int
    is_active: bool
    streak_count: int
    subscription_tier: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
