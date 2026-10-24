"""
Mock Data Seeding Service.

Seeds realistic corporate briefs and microlearning modules covering
GCP Cloud Run, PostgreSQL Cloud SQL, Next.js, and Make.com integrations.
"""

import json
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.module import LearningModule
from app.models.progress import UserProgress


def seed_database(db: Session) -> None:
    """
    Populates initial data if the database is currently empty.

    Args:
        db (Session): Active SQLAlchemy database session.
    """
    # Check if data already exists
    if db.query(LearningModule).first():
        return

    # 1. Create Demo User matching Stitch UI persona ("alx.dev")
    demo_user = User(
        name="Alex Dev",
        email="alex@devsync.io",
        phone_number="+14155552671",
        is_active=True,
        streak_count=14,
        subscription_tier="pro",
        razorpay_customer_id="cust_devsync_alex_01",
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # 2. Module 1: The flagship Cloud Run Split-Pane module from Stitch UI
    manifest_files_1 = [
        {
            "filename": "service.yaml",
            "language": "yaml",
            "content": """# Cloud Run Service Definition - Exercise 2
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: microlearning-srv
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: '10'
    spec:
      containerConcurrency: 80
      containers:
      - image: gcr.io/devupskill/nextjs:v1.4
        ports:
        - containerPort: 8080
        resources:
          limits:
            memory: 512Mi
            cpu: "1000m"
        env:
        - name: NODE_ENV
          value: production
        - name: PORT
          value: "8080"
""",
        },
        {
            "filename": "Dockerfile",
            "language": "dockerfile",
            "content": """# Multi-stage production container for Next.js on Cloud Run
FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER node
CMD ["node", "server.js"]
""",
        },
        {
            "filename": "cloudbuild.yaml",
            "language": "yaml",
            "content": """steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'gcr.io/$PROJECT_ID/nextjs:v1.4', '.']
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/$PROJECT_ID/nextjs:v1.4']
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args: ['run', 'services', 'replace', 'service.yaml', '--region', 'us-central1']
""",
        },
    ]

    assertions_1 = [
        {
            "id": "probe_container_port",
            "description": "Expose ingress containerPort 8080 in spec.containers[0].ports",
            "passed": True,
            "details": "Verified containerPort: 8080 matches Cloud Run listener contract.",
        },
        {
            "id": "probe_memory_boundary",
            "description": "Enforce container memory limits <= 512Mi with 1000m vCPU",
            "passed": True,
            "details": "Resource limits validated against Cold Start budget.",
        },
        {
            "id": "probe_concurrency_lock",
            "description": "Configure containerConcurrency = 80 to avoid worker saturation",
            "passed": True,
            "details": "Concurrency locks preventing pod starvation under burst traffic.",
        },
    ]

    module_1 = LearningModule(
        slug="cloud-run-networking-concurrency",
        code_id="GCP_ARCH_804",
        title="Deploy Resilient Next.js Microservice to Cloud Run with Redis Ingress",
        track="GCP Cloud Engineering",
        estimated_minutes=10,
        difficulty="Intermediate",
        badge_label="ACTIVE SIMULATION",
        summary="Configure container networking, port mappings, and memory budgets to eliminate 502 cold-start starvation.",
        markdown_content="""### Architecture Objective
By default, Cloud Run passes incoming ingress traffic on the container's designated listener port. Mismatching this manifest declaration causes critical `502 Bad Gateway` cold starts and instant container starvation.

### Implementation Steps
1. **Specify the Ingress Container Port**: Update the specification in `service.yaml` under the `ports` block to expose port `8080`.
2. **Tune Container Memory & Concurrency**: Prevent out-of-memory container crashes under sudden traffic spikes. Allocate `512Mi` memory limit and explicitly lock concurrency to `80` requests per instance.
3. **Simulate Deployment & Verify Telemetry**: Click the **Run Code ▶** button in the right-hand panel to compile the manifest and pass the 3 health probe assertions.

### Key Takeaway
Cloud Run automatically scales to zero when no active requests are pending unless `min-instances` is configured to eliminate cold start penalties.
""",
        file_manifest=json.dumps(manifest_files_1),
        test_assertions=json.dumps(assertions_1),
        quiz_question="Why does Cloud Run return 502 Bad Gateway if a Next.js container listens on port 3000 without PORT configuration?",
        quiz_options=json.dumps(
            [
                "Cloud Run ingress proxy routes internal health checks strictly to PORT 8080 by default",
                "Next.js cannot run on Node.js inside Alpine containers",
                "Cloud Run requires root privileges to open ports below 1024",
                "Port 3000 is reserved for Cloud SQL Auth Proxy connections",
            ]
        ),
        quiz_correct_index=0,
        quiz_explanation="Cloud Run expects containers to listen on the port specified by the PORT environment variable (which defaults to 8080).",
    )
    db.add(module_1)

    # 3. Module 2: Cloud SQL Connection Pooling
    module_2 = LearningModule(
        slug="cloud-sql-connection-pooling",
        code_id="SQL_POOL_501",
        title="Deploy Cloud SQL PostgreSQL Database with Connection Pooling",
        track="Backend Architecture",
        estimated_minutes=8,
        difficulty="Advanced",
        badge_label="DATABASE BRIEF",
        summary="Implement PgBouncer connection pooling and SQLAlchemy pool_pre_ping to withstand sudden spike traffic.",
        markdown_content="""### Architecture Objective
High concurrency on serverless workers rapidly exhausts PostgreSQL's `max_connections` ceiling. Learn how to configure Cloud SQL Auth Proxy and application-side connection pooling.

### Implementation Steps
1. Set `pool_size=10` and `max_overflow=20` in the SQLAlchemy sessionmaker.
2. Enable `pool_pre_ping=True` to prune dead sockets after Cloud Run downscaling.
3. Verify test queries pass without `OperationalError: remaining connection slots are reserved`.
""",
        file_manifest=json.dumps(
            [
                {
                    "filename": "database.py",
                    "language": "python",
                    "content": """from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Configure robust connection pooling for Cloud SQL PostgreSQL
DATABASE_URL = "postgresql://user:pass@127.0.0.1:5432/upskill_db"

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=1800,
)
SessionLocal = sessionmaker(bind=engine)
""",
                }
            ]
        ),
        test_assertions=json.dumps(
            [
                {
                    "id": "pool_pre_ping",
                    "description": "Ensure pool_pre_ping is enabled for socket health verification",
                    "passed": True,
                    "details": "Pool pre-ping active.",
                }
            ]
        ),
        quiz_question="What is the primary benefit of enabling pool_pre_ping=True in SQLAlchemy with Cloud SQL?",
        quiz_options=json.dumps(
            [
                "It tests connections before checkout to transparently handle dropped serverless sockets",
                "It automatically encrypts query traffic with AES-256",
                "It compresses SQL queries over the wire",
                "It creates read replicas in secondary regions",
            ]
        ),
        quiz_correct_index=0,
        quiz_explanation="pool_pre_ping emits a fast SELECT 1 query on checkout to test whether a stale socket was severed by the database.",
    )
    db.add(module_2)

    # 4. Module 3: Next.js Server Components Hydration
    module_3 = LearningModule(
        slug="nextjs-hydration-debugging",
        code_id="REACT_HYDRATE_202",
        title="Fix UI Hydration Bug in Next.js Server & Client Components",
        track="Full-Stack Web",
        estimated_minutes=7,
        difficulty="Intermediate",
        badge_label="BUG FIX BRIEF",
        summary="Debug non-deterministic DOM tree mismatches caused by browser localStorage queries during server rendering.",
        markdown_content="""### Architecture Objective
Client-side state accessed during initial Server Component render produces React hydration mismatch error #418. Resolve this using `useEffect` or dynamic imports with `{ ssr: false }`.
""",
        file_manifest=json.dumps(
            [
                {
                    "filename": "UserProfile.tsx",
                    "language": "typescript",
                    "content": """'use client';
import { useState, useEffect } from 'react';

export default function UserProfile() {
  const [theme, setTheme] = useState<string>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
  }, []);

  if (!mounted) return <div className="h-8 w-24 bg-surface-container rounded" />;

  return <div>Active Theme: {theme}</div>;
}
""",
                }
            ]
        ),
        test_assertions=json.dumps(
            [
                {
                    "id": "hydration_guard",
                    "description": "Ensure localStorage access is guarded by mounted check",
                    "passed": True,
                    "details": "Server DOM matches Client DOM.",
                }
            ]
        ),
        quiz_question="Why should browser localStorage never be read during initial Next.js server-side component evaluation?",
        quiz_options=json.dumps(
            [
                "localStorage is undefined on Node.js server runtimes, triggering fatal hydration errors",
                "It slows down TTFB by more than 500ms",
                "Browsers block localStorage access from HTTP cookies",
                "It triggers an automatic Cross-Site Scripting (XSS) linter flag",
            ]
        ),
        quiz_correct_index=0,
        quiz_explanation="Server evaluation environments (Node.js/V8) have no window or localStorage object, leading to ReferenceErrors or markup discrepancies.",
    )
    db.add(module_3)

    db.commit()

    # Create initial progress for user on module 1
    progress_1 = UserProgress(
        user_id=demo_user.id,
        module_id=module_1.id,
        status="in_progress",
        current_step=2,
        total_steps=5,
        code_draft=manifest_files_1[0]["content"],
        all_assertions_passed=True,
    )
    db.add(progress_1)
    db.commit()
