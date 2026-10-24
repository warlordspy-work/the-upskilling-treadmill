"""
Learning Modules API Routes.

Provides endpoints to list corporate briefs, fetch module details,
and execute simulated sandbox test assertions.
"""

import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.module import LearningModule
from app.models.progress import UserProgress
from app.schemas.module import (
    ModuleListItem,
    ModuleDetailResponse,
    FileItem,
    AssertionItem,
    CodeExecutionRequest,
    CodeExecutionResponse,
)

router = APIRouter(prefix="/api/modules", tags=["Learning Modules"])


@router.get("", response_model=List[ModuleListItem])
def list_modules(db: Session = Depends(get_db)):
    """
    Returns all available corporate brief simulations.
    """
    modules = db.query(LearningModule).all()
    return modules


@router.get("/{identifier}", response_model=ModuleDetailResponse)
def get_module(identifier: str, db: Session = Depends(get_db)):
    """
    Retrieves full module details, instruction markdown, and code tabs.

    Args:
        identifier: Either numeric module ID or slug.
    """
    if identifier.isdigit():
        module = (
            db.query(LearningModule)
            .filter(LearningModule.id == int(identifier))
            .first()
        )
    else:
        module = (
            db.query(LearningModule)
            .filter(LearningModule.slug == identifier)
            .first()
        )

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Learning module '{identifier}' not found.",
        )

    # Parse JSON strings into structured objects
    try:
        files_data = json.loads(module.file_manifest)
        files = [FileItem(**f) for f in files_data]
    except Exception:
        files = []

    try:
        assertions_data = json.loads(module.test_assertions)
        assertions = [AssertionItem(**a) for a in assertions_data]
    except Exception:
        assertions = []

    try:
        quiz_options = json.loads(module.quiz_options)
    except Exception:
        quiz_options = []

    return ModuleDetailResponse(
        id=module.id,
        slug=module.slug,
        code_id=module.code_id,
        title=module.title,
        track=module.track,
        estimated_minutes=module.estimated_minutes,
        difficulty=module.difficulty,
        badge_label=module.badge_label,
        summary=module.summary,
        markdown_content=module.markdown_content,
        files=files,
        assertions=assertions,
        quiz_question=module.quiz_question,
        quiz_options=quiz_options,
        created_at=module.created_at,
    )


@router.post("/{module_id}/execute", response_model=CodeExecutionResponse)
def execute_sandbox_code(
    module_id: int,
    payload: CodeExecutionRequest,
    db: Session = Depends(get_db),
):
    """
    Simulates container deployment / code execution and tests assertions.
    """
    module = (
        db.query(LearningModule)
        .filter(LearningModule.id == module_id)
        .first()
    )
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module ID {module_id} not found.",
        )

    # Dynamic assertion evaluation based on user submission
    code_text = payload.code
    logs = [
        "$ gcloud run deploy microlearning-srv --region=us-central1 --quiet",
        "[i] Parsing manifest target service.yaml ... Validated Knative schema 1.0.",
    ]

    has_port = "containerPort: 8080" in code_text or "8080" in code_text
    has_memory = "512Mi" in code_text
    has_concurrency = "containerConcurrency: 80" in code_text or "80" in code_text

    assertions = [
        AssertionItem(
            id="probe_container_port",
            description="Expose ingress containerPort 8080 in spec.containers[0].ports",
            passed=has_port,
            details="Port 8080 matches ingress contract." if has_port else "Port 8080 missing.",
        ),
        AssertionItem(
            id="probe_memory_boundary",
            description="Enforce container memory limits <= 512Mi with 1000m vCPU",
            passed=has_memory,
            details="Memory limits match Cold Start budget." if has_memory else "Memory limit missing.",
        ),
        AssertionItem(
            id="probe_concurrency_lock",
            description="Configure containerConcurrency = 80 to avoid worker saturation",
            passed=has_concurrency,
            details="Concurrency lock 80 validated." if has_concurrency else "Concurrency 80 missing.",
        ),
    ]

    all_passed = all(a.passed for a in assertions)

    if all_passed:
        logs.extend([
            "[+] Container image verified: gcr.io/devupskill/nextjs:v1.4",
            "[✓] Service URL: https://microlearning-srv-prod.a.run.app",
            "Status: 200 OK - All assertions passed (3/3) ✓",
        ])
    else:
        logs.extend([
            "[-] Validation error: Some assertions failed health check probes.",
            "Status: 422 Unprocessable Entity - Review step requirements.",
        ])

    # Update UserProgress
    progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == payload.user_id,
            UserProgress.module_id == module_id,
        )
        .first()
    )

    if progress:
        progress.code_draft = code_text
        progress.last_terminal_output = "\n".join(logs)
        progress.all_assertions_passed = all_passed
        if all_passed and progress.current_step < progress.total_steps:
            progress.current_step += 1
        db.commit()

    return CodeExecutionResponse(
        success=all_passed,
        status_code=200 if all_passed else 422,
        terminal_logs=logs,
        assertions=assertions,
        service_url="https://microlearning-srv-prod.a.run.app" if all_passed else None,
        next_step_available=all_passed,
    )
