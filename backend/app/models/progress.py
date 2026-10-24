"""
UserProgress SQLAlchemy ORM Model.

Tracks step completion, active code drafts, terminal results,
and microlearning quiz performance per learner.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.database import Base


class UserProgress(Base):
    """
    User progress tracking per module and simulation.
    """

    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    module_id = Column(
        Integer,
        ForeignKey("learning_modules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status = Column(
        String(50),
        default="in_progress",
        nullable=False,
        comment="'not_started', 'in_progress', or 'completed'",
    )
    current_step = Column(Integer, default=1, nullable=False)
    total_steps = Column(Integer, default=5, nullable=False)
    code_draft = Column(
        Text,
        nullable=True,
        comment="JSON string storing learner code buffer and modified files",
    )
    last_terminal_output = Column(Text, nullable=True)
    all_assertions_passed = Column(Boolean, default=False, nullable=False)
    is_nudge_sent = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Tracks whether the daily WhatsApp nudge was dispatched for this module",
    )
    quiz_answered = Column(Boolean, default=False, nullable=False)
    quiz_selected_index = Column(Integer, nullable=True)
    quiz_is_correct = Column(Boolean, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Composite unique constraint: One progress row per user and module pair
    __table_args__ = (
        UniqueConstraint("user_id", "module_id", name="uq_user_module_progress"),
    )

    # Relationships
    user = relationship("User", back_populates="progress_records")
    module = relationship("LearningModule", back_populates="progress_records")

    def __repr__(self) -> str:
        return (
            f"<UserProgress id={self.id} user_id={self.user_id} "
            f"module_id={self.module_id} status='{self.status}'>"
        )
