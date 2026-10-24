"""
User SQLAlchemy ORM Model.

Represents developers using the platform, including their WhatsApp
phone numbers for nudges and Razorpay subscription tier.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """
    User database model representing a professional learner.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone_number = Column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
        comment="E.164 phone number used for WATI WhatsApp daily microlearning nudges",
    )
    is_active = Column(Boolean, default=True, nullable=False)
    streak_count = Column(
        Integer,
        default=0,
        nullable=False,
        comment="Consecutive daily microlearning nudge completion streak",
    )
    subscription_tier = Column(
        String(50),
        default="free",
        nullable=False,
        comment="Subscription level: 'free', 'pro', or 'enterprise' managed via Razorpay",
    )
    razorpay_customer_id = Column(String(100), nullable=True)
    razorpay_subscription_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationship to user progress records across modules
    progress_records = relationship(
        "UserProgress",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email='{self.email}' tier='{self.subscription_tier}'>"
