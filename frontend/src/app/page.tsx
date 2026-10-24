"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import { Dashboard } from "@/components/Dashboard";
import { SplitPaneSandbox } from "@/components/SplitPaneSandbox";
import { MobileNudgeView } from "@/components/MobileNudgeView";
import { AiTutorWidget } from "@/components/AiTutorWidget";
import { Footer } from "@/components/Footer";
import { LearningModule, UserProfile, CodeExecutionResult } from "@/types";

// Default fallback modules matching Stitch UI specifications
const INITIAL_MODULES: LearningModule[] = [
  {
    id: 1,
    slug: "cloud-run-networking-concurrency",
    code_id: "GCP_ARCH_804",
    title: "Deploy Resilient Next.js Microservice to Cloud Run with Redis Ingress",
    track: "GCP Cloud Engineering",
    estimated_minutes: 10,
    difficulty: "Intermediate",
    badge_label: "ACTIVE SIMULATION",
    summary:
      "Configure container networking, port mappings, and memory budgets to eliminate 502 cold-start starvation under burst concurrency.",
    files: [
      {
        filename: "service.yaml",
        language: "yaml",
        content: `# Cloud Run Service Definition - Exercise 2
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
          value: "8080"`,
      },
      {
        filename: "Dockerfile",
        language: "dockerfile",
        content: `FROM node:20-alpine AS base
WORKDIR /app
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]`,
      },
      {
        filename: "cloudbuild.yaml",
        language: "yaml",
        content: `steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'gcr.io/$PROJECT_ID/nextjs:v1.4', '.']
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/$PROJECT_ID/nextjs:v1.4']`,
      },
    ],
    assertions: [
      {
        id: "probe_container_port",
        description: "Expose ingress containerPort 8080 in spec.containers[0].ports",
        passed: true,
      },
      {
        id: "probe_memory_boundary",
        description: "Enforce container memory limits <= 512Mi with 1000m vCPU",
        passed: true,
      },
      {
        id: "probe_concurrency_lock",
        description: "Configure containerConcurrency = 80 to avoid worker saturation",
        passed: true,
      },
    ],
    quiz_question:
      "Why does Cloud Run return 502 Bad Gateway if a Next.js container listens on port 3000 without PORT configuration?",
    quiz_options: [
      "Cloud Run ingress proxy routes internal health checks strictly to PORT 8080 by default",
      "Next.js cannot run on Node.js inside Alpine containers",
      "Cloud Run requires root privileges to open ports below 1024",
      "Port 3000 is reserved for Cloud SQL Auth Proxy connections",
    ],
  },
  {
    id: 2,
    slug: "cloud-sql-connection-pooling",
    code_id: "SQL_POOL_501",
    title: "Deploy Cloud SQL PostgreSQL Database with Connection Pooling",
    track: "Backend Architecture",
    estimated_minutes: 8,
    difficulty: "Advanced",
    badge_label: "DATABASE BRIEF",
    summary:
      "Implement PgBouncer connection pooling and SQLAlchemy pool_pre_ping to withstand sudden spike traffic.",
    quiz_question:
      "What is the primary benefit of enabling pool_pre_ping=True in SQLAlchemy with Cloud SQL?",
    quiz_options: [
      "It tests connections before checkout to transparently handle dropped serverless sockets",
      "It automatically encrypts query traffic with AES-256",
      "It compresses SQL queries over the wire",
      "It creates read replicas in secondary regions",
    ],
  },
  {
    id: 3,
    slug: "nextjs-hydration-debugging",
    code_id: "REACT_HYDRATE_202",
    title: "Fix UI Hydration Bug in Next.js Server & Client Components",
    track: "Full-Stack Web",
    estimated_minutes: 7,
    difficulty: "Intermediate",
    badge_label: "BUG FIX BRIEF",
    summary:
      "Debug non-deterministic DOM tree mismatches caused by browser localStorage queries during server rendering.",
    quiz_question:
      "Why should browser localStorage never be read during initial Next.js server-side component evaluation?",
    quiz_options: [
      "localStorage is undefined on Node.js server runtimes, triggering fatal hydration errors",
      "It slows down TTFB by more than 500ms",
      "Browsers block localStorage access from HTTP cookies",
      "It triggers an automatic Cross-Site Scripting (XSS) linter flag",
    ],
  },
];

export default function Home() {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "sandbox" | "mobile"
  >("sandbox");
  const [modules, setModules] = useState<LearningModule[]>(INITIAL_MODULES);
  const [activeModule, setActiveModule] = useState<LearningModule>(
    INITIAL_MODULES[0]
  );
  const [stepNumber, setStepNumber] = useState<number>(2);
  const [isNudgeTriggering, setIsNudgeTriggering] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [user, setUser] = useState<UserProfile>({
    id: 1,
    name: "Alex Dev",
    email: "alex@devsync.io",
    phone_number: "+14155552671",
    streak_count: 14,
    subscription_tier: "pro",
  });

  // Fetch modules and user from FastAPI backend if available
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modRes, userRes] = await Promise.all([
          fetch("http://localhost:8000/api/modules"),
          fetch("http://localhost:8000/api/user/me"),
        ]);

        if (modRes.ok) {
          const modData = await modRes.json();
          if (modData.length > 0) {
            setModules(modData);
            // Fetch detailed first module
            const detailRes = await fetch(
              `http://localhost:8000/api/modules/${modData[0].slug}`
            );
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              setActiveModule(detailData);
            }
          }
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }
      } catch {
        // Retain initial rich state if backend server isn't reached yet
      }
    };

    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Trigger Make.com daily nudge flow
  const handleTriggerNudge = async () => {
    setIsNudgeTriggering(true);
    try {
      const res = await fetch(
        "http://localhost:8000/api/webhooks/trigger-daily-nudge",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            module_id: activeModule.id,
          }),
        }
      );

      if (res.ok) {
        showToast(
          `🚀 Make.com Webhook Fired! WhatsApp quiz nudge dispatched to ${user.phone_number}`
        );
      } else {
        showToast(
          `📱 Webhook Simulated: Daily WhatsApp nudge ready for ${user.phone_number}`
        );
      }
    } catch {
      showToast(
        `📱 Webhook Simulated: Daily WhatsApp nudge sent via Make.com scenario to ${user.phone_number}`
      );
    } finally {
      setIsNudgeTriggering(false);
    }
  };

  // Run code simulation via FastAPI
  const handleRunCode = async (
    filename: string,
    code: string
  ): Promise<CodeExecutionResult> => {
    const res = await fetch(
      `http://localhost:8000/api/modules/${activeModule.id}/execute`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          filename,
          code,
        }),
      }
    );

    if (res.ok) {
      return await res.json();
    }
    throw new Error("Execution failed");
  };

  // Submit WhatsApp quiz answer
  const handleSubmitQuiz = async (selectedIndex: number) => {
    const res = await fetch("http://localhost:8000/api/progress/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        module_id: activeModule.id,
        selected_option_index: selectedIndex,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.is_correct) {
        setUser((prev) => ({
          ...prev,
          streak_count: data.updated_streak,
        }));
      }
      return data;
    }
    throw new Error("Quiz submission failed");
  };

  const handleSelectModule = async (mod: LearningModule) => {
    try {
      const res = await fetch(`http://localhost:8000/api/modules/${mod.slug}`);
      if (res.ok) {
        const fullMod = await res.json();
        setActiveModule(fullMod);
      } else {
        setActiveModule(mod);
      }
    } catch {
      setActiveModule(mod);
    }
    setCurrentView("sandbox");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-surface-container border border-primary text-primary px-4 py-2.5 rounded-lg shadow-xl font-code-md text-xs flex items-center gap-2 neon-halo animate-bounce">
          <span className="material-symbols-outlined text-base">send</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        activeModule={activeModule}
        user={user}
        stepNumber={stepNumber}
        totalSteps={5}
        onResetCode={() => {
          if (activeModule.files) {
            setActiveModule({ ...activeModule });
          }
        }}
        onTriggerNudge={handleTriggerNudge}
        isNudgeTriggering={isNudgeTriggering}
      />

      {/* View Switcher Bar */}
      <ViewSwitcher
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Dynamic Main Views */}
      {currentView === "dashboard" && (
        <Dashboard
          modules={modules}
          onSelectModule={handleSelectModule}
          onOpenMobilePreview={() => setCurrentView("mobile")}
        />
      )}

      {currentView === "sandbox" && (
        <SplitPaneSandbox
          module={activeModule}
          stepNumber={stepNumber}
          onAdvanceStep={() => setStepNumber((prev) => Math.min(prev + 1, 5))}
          onRunCode={handleRunCode}
        />
      )}

      {currentView === "mobile" && (
        <MobileNudgeView
          module={activeModule}
          streakCount={user.streak_count}
          onOpenSandbox={() => setCurrentView("sandbox")}
          onSubmitQuiz={handleSubmitQuiz}
        />
      )}

      {/* In-Flow AI Tutor Copilot (Persistent across Sandbox & Dashboard) */}
      <AiTutorWidget module={activeModule} stepNumber={stepNumber} />

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
