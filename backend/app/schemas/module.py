"""
Learning Module and Sandbox Execution Schemas.

Defines schemas for module representation, sandbox files, and simulated execution.
"""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class FileItem(BaseModel):
    """Represents a code editor tab and its initial content."""

    filename: str
    content: str
    language: str = "yaml"


class AssertionItem(BaseModel):
    """Represents an automated unit/integration assertion test."""

    id: str
    description: str
    passed: bool = False
    details: Optional[str] = None


class ModuleListItem(BaseModel):
    """Brief metadata summary for module dashboard listings."""

    id: int
    slug: str
    code_id: str
    title: str
    track: str
    estimated_minutes: int
    difficulty: str
    badge_label: str
    summary: str

    model_config = ConfigDict(from_attributes=True)


class ModuleDetailResponse(ModuleListItem):
    """Full module details including markdown instruction, files, and quiz."""

    markdown_content: str
    files: list[FileItem] = Field(default_factory=list)
    assertions: list[AssertionItem] = Field(default_factory=list)
    quiz_question: str
    quiz_options: list[str] = Field(default_factory=list)
    created_at: datetime


class CodeExecutionRequest(BaseModel):
    """Request payload submitted when user clicks 'Run Code'."""

    user_id: int
    filename: str
    code: str


class CodeExecutionResponse(BaseModel):
    """Result of sandbox compilation and assertion testing."""

    success: bool
    status_code: int
    terminal_logs: list[str]
    assertions: list[AssertionItem]
    service_url: Optional[str] = None
    next_step_available: bool = False
