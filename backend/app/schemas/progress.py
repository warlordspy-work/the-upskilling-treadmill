"""
User Progress and Quiz Schemas.

Defines schemas for step advancement, draft persistence, and WhatsApp quiz responses.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ProgressUpdate(BaseModel):
    """Schema for updating active progress in a learning sandbox."""

    current_step: Optional[int] = Field(None, ge=1, le=10)
    status: Optional[str] = Field(None, pattern=r"^(not_started|in_progress|completed)$")
    code_draft: Optional[str] = None
    last_terminal_output: Optional[str] = None


class ProgressResponse(BaseModel):
    """Schema for returning learner progress status."""

    id: int
    user_id: int
    module_id: int
    status: str
    current_step: int
    total_steps: int
    code_draft: Optional[str] = None
    all_assertions_passed: bool
    is_nudge_sent: bool
    quiz_answered: bool
    quiz_is_correct: Optional[bool] = None
    completed_at: Optional[datetime] = None
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuizSubmitRequest(BaseModel):
    """Request payload when learner answers the 3-minute microlearning quiz."""

    user_id: int
    module_id: int
    selected_option_index: int = Field(..., ge=0, le=3)


class QuizSubmitResponse(BaseModel):
    """Quiz evaluation response with explanation and updated streak count."""

    is_correct: bool
    correct_option_index: int
    explanation: str
    updated_streak: int
