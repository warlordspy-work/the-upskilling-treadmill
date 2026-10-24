"""
LearningModule SQLAlchemy ORM Model.

Stores simulated corporate briefs, markdown instructions, code tabs,
and 3-minute quiz questions dispatched via WhatsApp nudges.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class LearningModule(Base):
    """
    Simulated corporate brief and interactive microlearning module.
    """

    __tablename__ = "learning_modules"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(120), unique=True, index=True, nullable=False)
    code_id = Column(
        String(50),
        index=True,
        nullable=False,
        comment="Corporate brief reference code e.g. GCP_ARCH_804",
    )
    title = Column(String(255), nullable=False)
    track = Column(
        String(100),
        nullable=False,
        comment="Curriculum track e.g. Cloud Infrastructure, GenAI, Web Architecture",
    )
    estimated_minutes = Column(Integer, default=10, nullable=False)
    difficulty = Column(String(50), default="Intermediate", nullable=False)
    badge_label = Column(String(100), default="ACTIVE SIMULATION", nullable=False)
    summary = Column(Text, nullable=False)
    markdown_content = Column(
        Text,
        nullable=False,
        comment="Instructional guide, architecture diagrams, and implementation steps",
    )
    file_manifest = Column(
        Text,
        nullable=False,
        comment="JSON string of editor files e.g. [{'filename': 'service.yaml', 'content': '...'}]",
    )
    test_assertions = Column(
        Text,
        nullable=False,
        comment="JSON string of automated assertions verified when user runs code",
    )
    quiz_question = Column(
        Text,
        nullable=False,
        comment="3-minute technical quiz question sent in WhatsApp nudge",
    )
    quiz_options = Column(
        Text,
        nullable=False,
        comment="JSON array of 4 multiple-choice options for the quiz",
    )
    quiz_correct_index = Column(Integer, default=0, nullable=False)
    quiz_explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    progress_records = relationship(
        "UserProgress",
        back_populates="module",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<LearningModule id={self.id} code='{self.code_id}' title='{self.title}'>"
