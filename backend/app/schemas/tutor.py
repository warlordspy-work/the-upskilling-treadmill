"""
In-Flow AI Tutor Schemas.

Defines contextual question and answer models for the floating Copilot widget.
"""

from typing import Optional
from pydantic import BaseModel, Field


class TutorQueryRequest(BaseModel):
    """Contextual question sent by learner to the in-flow AI tutor."""

    module_id: int
    user_query: str = Field(..., min_length=2, max_length=1000)
    current_code_snippet: Optional[str] = None
    current_step: Optional[int] = 1


class TutorQueryResponse(BaseModel):
    """AI Tutor response tailored specifically to the active corporate brief."""

    response: str
    suggested_actions: list[str] = Field(default_factory=list)
    code_fix: Optional[str] = None
