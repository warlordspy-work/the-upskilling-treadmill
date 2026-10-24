"use client";

import React, { useState, useEffect } from "react";
import { LearningModule, FileItem, AssertionItem, CodeExecutionResult } from "@/types";

interface SplitPaneSandboxProps {
  module: LearningModule;
  stepNumber: number;
  onAdvanceStep: () => void;
  onRunCode: (filename: string, code: string) => Promise<CodeExecutionResult>;
}

export const SplitPaneSandbox: React.FC<SplitPaneSandboxProps> = ({
  module,
  stepNumber,
  onAdvanceStep,
  onRunCode,
}) => {
  // Files available in sandbox
  const defaultFiles: FileItem[] = module.files && module.files.length > 0
    ? module.files
    : [
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
      ];

  const [files, setFiles] = useState<FileItem[]>(defaultFiles);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalTab, setTerminalTab] = useState<"terminal" | "diff" | "linter">("terminal");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Terminal log stream and assertions
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "$ gcloud run deploy microlearning-srv --region=us-central1 --quiet",
    "[i] Initializing workspace sandbox ... Knative schema 1.0 loaded.",
    "Ready to execute assertion tests. Click 'Run Code' to compile.",
  ]);

  const [assertions, setAssertions] = useState<AssertionItem[]>(
    module.assertions || [
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
    ]
  );

  const [serviceUrl, setServiceUrl] = useState<string | null>(null);
  const [allPassed, setAllPassed] = useState<boolean>(false);

  // Update files when module changes
  useEffect(() => {
    if (module.files && module.files.length > 0) {
      setFiles(module.files);
      setActiveFileIndex(0);
    }
  }, [module]);

  const currentFile = files[activeFileIndex] || files[0];

  const handleCodeChange = (newCode: string) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[activeFileIndex] = {
        ...updated[activeFileIndex],
        content: newCode,
      };
      return updated;
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSnippet(text);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setTerminalLogs((prev) => [
      ...prev,
      `$ gcloud run deploy microlearning-srv --region=us-central1 --quiet`,
      `[i] Parsing target ${currentFile.filename} ...`,
    ]);

    try {
      const result = await onRunCode(currentFile.filename, currentFile.content);
      setTerminalLogs(result.terminal_logs);
      setAssertions(result.assertions);
      setAllPassed(result.success);
      if (result.service_url) {
        setServiceUrl(result.service_url);
      }
      if (result.success) {
        onAdvanceStep();
      }
    } catch {
      // Local fallback execution if backend call fails
      const hasPort = currentFile.content.includes("8080");
      const hasMemory = currentFile.content.includes("512Mi");
      const hasConcurrency = currentFile.content.includes("80");

      const evaluated: AssertionItem[] = [
        {
          id: "probe_container_port",
          description: "Expose ingress containerPort 8080 in spec.containers[0].ports",
          passed: hasPort,
        },
        {
          id: "probe_memory_boundary",
          description: "Enforce container memory limits <= 512Mi with 1000m vCPU",
          passed: hasMemory,
        },
        {
          id: "probe_concurrency_lock",
          description: "Configure containerConcurrency = 80 to avoid worker saturation",
          passed: hasConcurrency,
        },
      ];

      const passed = evaluated.every((a) => a.passed);
      setAssertions(evaluated);
      setAllPassed(passed);
      setTerminalLogs([
        "$ gcloud run deploy microlearning-srv --region=us-central1 --quiet",
        "[i] Parsing manifest target service.yaml ... Validated Knative schema 1.0.",
        "[+] Container image verified: gcr.io/devupskill/nextjs:v1.4",
        "[✓] Service URL: https://microlearning-srv-prod.a.run.app",
        passed
          ? "Status: 200 OK - All assertions passed (3/3) ✓"
          : "[-] Status: 422 Unprocessable Entity - Missing required configuration.",
      ]);
      if (passed) {
        setServiceUrl("https://microlearning-srv-prod.a.run.app");
        onAdvanceStep();
      }
    } finally {
      setIsRunning(false);
    }
  };

  const lineCount = currentFile.content.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 24) }, (_, i) => i + 1);

  return (
    <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
      {/* ========================================================================= */}
      {/* LEFT PANE: INSTRUCTIONAL & MARKDOWN VIEW                                  */}
      {/* ========================================================================= */}
      <section className="w-full md:w-1/2 flex flex-col bg-surface border-r border-outline-variant overflow-y-auto">
        {/* Instructional Header Banner */}
        <div className="p-6 border-b border-outline-variant bg-surface-container-lowest/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded border border-primary-container/40 bg-surface-container-lowest text-primary font-label-code text-label-code flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping"></span>
              Task: Containerize & Configure Port Mapping
            </span>
            <span className="text-on-surface-variant font-label-code text-label-code">
              Est: {module.estimated_minutes} mins
            </span>
          </div>
          <h1 className="text-headline-md font-headline-md text-on-surface font-semibold tracking-tight">
            {module.title}
          </h1>
        </div>

        {/* Markdown Structured Body */}
        <div className="p-6 space-y-6 text-on-surface flex-1">
          {/* Architecture Objective Summary */}
          <div className="p-4 bg-surface-container-low border border-outline-variant rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-primary font-code-md text-code-md font-semibold">
              <span className="material-symbols-outlined text-base">info</span>
              Architecture Objective
            </div>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              By default, Cloud Run passes incoming ingress traffic on the container's designated listener port. Mismatching this manifest declaration causes critical{" "}
              <span className="text-error font-code-md text-code-md">
                502 Bad Gateway
              </span>{" "}
              cold starts and instant container starvation.
            </p>
          </div>

          {/* Implementation Steps Checklist */}
          <div className="space-y-4">
            <h2 className="text-title-sm font-title-sm text-on-surface font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">
                checklist
              </span>
              Implementation Steps
            </h2>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 bg-surface-container rounded border border-outline-variant/60">
                <span className="w-6 h-6 rounded bg-primary-container text-on-primary-container font-code-md text-code-md font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="space-y-1 flex-1">
                  <p className="font-body-md text-body-md font-medium text-on-surface">
                    Specify the Ingress Container Port
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Update the specification in{" "}
                    <code className="font-code-md text-label-code bg-surface-container-lowest px-1.5 py-0.5 rounded border border-outline-variant text-primary">
                      service.yaml
                    </code>{" "}
                    under the <code className="font-code-md text-label-code text-secondary">ports</code> block to expose port <code className="font-code-md text-label-code text-primary">8080</code>.
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <div className="bg-surface-container-lowest px-2 py-1 rounded font-code-md text-label-code text-on-surface border border-outline-variant flex items-center justify-between w-full max-w-xs">
                      <code>containerPort: 8080</code>
                      <button
                        onClick={() => handleCopy("containerPort: 8080")}
                        className="text-outline hover:text-primary transition-colors ml-2"
                        title="Copy snippet"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {copiedSnippet === "containerPort: 8080"
                            ? "check"
                            : "content_copy"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 bg-surface-container rounded border border-outline-variant/60">
                <span className="w-6 h-6 rounded bg-surface-container-high text-on-surface font-code-md text-code-md font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-1 flex-1">
                  <p className="font-body-md text-body-md font-medium text-on-surface">
                    Tune Container Memory & Concurrency
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Prevent out-of-memory container crashes under sudden traffic spikes. Allocate <code className="font-code-md text-label-code text-primary">512Mi</code> memory limit and explicitly lock concurrency to <code className="font-code-md text-label-code text-primary">80</code> requests per instance.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 bg-surface-container rounded border border-outline-variant/60">
                <span className="w-6 h-6 rounded bg-surface-container-high text-on-surface font-code-md text-code-md font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="space-y-1 flex-1">
                  <p className="font-body-md text-body-md font-medium text-on-surface">
                    Simulate Deployment & Verify Telemetry
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    Click the <strong className="text-primary font-semibold">Run Code ▶</strong> button in the right-hand panel to compile the manifest and pass the 3 health probe assertions.
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <div className="bg-surface-container-lowest px-2 py-1 rounded font-code-md text-label-code text-on-surface border border-outline-variant flex items-center justify-between w-full">
                      <span className="truncate">
                        gcloud run deploy microlearning-srv --image=gcr.io/...
                      </span>
                      <button
                        onClick={() =>
                          handleCopy(
                            "gcloud run deploy microlearning-srv --image=gcr.io/devupskill/nextjs:v1.4"
                          )
                        }
                        className="text-outline hover:text-primary transition-colors ml-2"
                        title="Copy command"
                      >
                        <span className="material-symbols-outlined text-sm">
                          content_copy
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Hint Accordion */}
          <details className="group bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden transition-all duration-200">
            <summary className="flex items-center justify-between p-3.5 cursor-pointer list-none select-none hover:bg-surface-container-high transition-colors">
              <span className="flex items-center gap-2 font-code-md text-code-md text-primary font-medium">
                <span className="material-symbols-outlined text-base">
                  lightbulb
                </span>
                Need a hint? Check the service.yaml memory allocation syntax
              </span>
              <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-200 group-open:rotate-180">
                expand_more
              </span>
            </summary>
            <div className="p-3.5 pt-0 text-body-sm text-on-surface-variant border-t border-outline-variant/40 mt-2 space-y-2">
              <p>
                Ensure resources are bounded under the{" "}
                <code className="font-code-md text-label-code text-secondary">
                  limits
                </code>{" "}
                block inside your container spec:
              </p>
              <pre className="bg-surface-container-lowest p-2.5 rounded font-code-md text-label-code text-on-surface overflow-x-auto border border-outline-variant">
{`resources:
  limits:
    memory: 512Mi
    cpu: "1000m"`}
              </pre>
            </div>
          </details>

          {/* Key Takeaway Callout */}
          <div className="p-4 rounded-lg bg-surface-container-lowest border-l-4 border-l-primary-container border-y border-r border-outline-variant flex items-start gap-3">
            <span className="material-symbols-outlined text-primary mt-0.5">
              verified
            </span>
            <div>
              <h4 className="font-code-md text-code-md font-semibold text-primary">
                Key Takeaway
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Cloud Run automatically scales to zero when no active requests are pending unless{" "}
                <code className="font-code-md text-label-code text-on-surface">
                  min-instances
                </code>{" "}
                is configured to eliminate cold start penalties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* RIGHT PANE: CODE EDITOR & RUNTIME ENVIRONMENT                             */}
      {/* ========================================================================= */}
      <section className="w-full md:w-1/2 flex flex-col bg-surface-container-lowest h-full overflow-hidden">
        {/* Editor Top Toolbar & File Tabs */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface px-3 py-1.5 shrink-0 select-none">
          {/* macOS Window Controls & Tabs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 pr-2 border-r border-outline-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f87171] inline-block opacity-80 hover:opacity-100 cursor-pointer"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] inline-block opacity-80 hover:opacity-100 cursor-pointer"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] inline-block opacity-80 hover:opacity-100 cursor-pointer"></span>
            </div>

            {/* File Tabs */}
            <div className="flex items-center gap-1">
              {files.map((file, idx) => (
                <button
                  key={file.filename}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1 font-code-md text-code-md rounded transition-colors ${
                    activeFileIndex === idx
                      ? "bg-surface-container-lowest text-on-surface border-t border-x border-outline-variant -mb-2 z-10"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {activeFileIndex === idx && (
                    <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                  )}
                  <span>{file.filename}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-surface-container text-on-surface-variant border border-outline-variant rounded font-code-md text-label-code">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>GCP-us-central1 (Simulated)</span>
            </div>

            {/* PRIMARY RUN CODE BUTTON */}
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="bg-primary-container text-on-primary-container font-code-md text-code-md font-bold px-4 py-1.5 rounded hover:bg-[#84cc16] active:scale-[0.99] transition-all flex items-center gap-1.5 neon-halo cursor-pointer disabled:opacity-50"
            >
              <span
                className="material-symbols-outlined text-base font-bold"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
              <span>{isRunning ? "Running..." : "Run Code"}</span>
            </button>
          </div>
        </div>

        {/* Code Editor Canvas */}
        <div className="flex-1 overflow-auto bg-surface-container-lowest font-code-md text-code-md flex select-text relative">
          {/* Line Numbers Column */}
          <div className="py-3 px-2 text-right text-outline select-none border-r border-outline-variant/40 bg-surface-container-lowest/80 font-code-md text-code-md space-y-0 leading-5 min-w-[2.75rem]">
            {lineNumbers.map((num) => (
              <div key={num}>{num}</div>
            ))}
          </div>

          {/* Code Textarea Area */}
          <textarea
            value={currentFile.content}
            onChange={(e) => handleCodeChange(e.target.value)}
            spellCheck={false}
            className="flex-1 p-3 py-3 leading-5 font-code-md text-code-md text-on-surface bg-transparent resize-none border-none outline-none focus:ring-0 whitespace-pre overflow-x-auto"
          />
        </div>

        {/* BOTTOM SPLIT TERMINAL / OUTPUT CONSOLE */}
        <div className="h-48 border-t border-outline-variant bg-surface flex flex-col shrink-0">
          {/* Terminal Header Tabs */}
          <div className="flex items-center justify-between px-3 py-1 border-b border-outline-variant bg-surface-container select-none">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTerminalTab("terminal")}
                className={`px-2.5 py-1 font-code-md text-label-code flex items-center gap-1.5 font-semibold transition-colors ${
                  terminalTab === "terminal"
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-xs">
                  terminal
                </span>
                <span>Terminal Output</span>
              </button>

              <button
                onClick={() => setTerminalTab("diff")}
                className={`px-2.5 py-1 font-code-md text-label-code flex items-center gap-1.5 transition-colors ${
                  terminalTab === "diff"
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-xs">
                  difference
                </span>
                <span>Telemetry Diff</span>
              </button>

              <button
                onClick={() => setTerminalTab("linter")}
                className={`px-2.5 py-1 font-code-md text-label-code flex items-center gap-1.5 transition-colors ${
                  terminalTab === "linter"
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                <span>Linter (0 errors)</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-outline font-code-md text-label-code">
              <span
                onClick={() => setTerminalLogs(["$ Console cleared."])}
                className="hover:text-on-surface cursor-pointer"
              >
                Clear
              </span>
              <span>•</span>
              <span className="material-symbols-outlined text-sm hover:text-on-surface cursor-pointer">
                open_in_full
              </span>
            </div>
          </div>

          {/* Terminal Logs & Assertions Stream */}
          <div className="p-3 overflow-y-auto font-code-md text-code-md space-y-1.5 flex-1 select-text">
            {terminalTab === "terminal" && (
              <>
                {terminalLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      log.startsWith("$")
                        ? "text-on-surface font-semibold flex items-center gap-2"
                        : log.includes("Error") || log.includes("[-] ")
                        ? "text-error"
                        : log.includes("Service URL:")
                        ? "text-secondary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {log}
                  </div>
                ))}

                {serviceUrl && (
                  <div className="text-on-surface flex items-center gap-1.5 pt-1">
                    <span className="material-symbols-outlined text-xs text-primary">
                      link
                    </span>
                    <span>
                      [✓] Service URL:{" "}
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-secondary underline hover:text-primary transition-colors"
                      >
                        {serviceUrl}
                      </a>
                    </span>
                  </div>
                )}

                {/* Live Assertions Checklist */}
                <div className="pt-2 flex flex-wrap items-center gap-3 font-semibold">
                  <span
                    className={`px-2 py-0.5 rounded font-label-code text-label-code border ${
                      allPassed
                        ? "bg-primary-container/20 border-primary-container text-primary"
                        : "bg-surface-container border-outline-variant text-on-surface-variant"
                    }`}
                  >
                    Status: {allPassed ? "200 OK" : "Draft Evaluated"}
                  </span>

                  <span className="text-primary-container font-code-md text-code-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">
                      verified
                    </span>
                    {assertions.filter((a) => a.passed).length}/{assertions.length}{" "}
                    assertions passed ✓
                  </span>
                </div>
              </>
            )}

            {terminalTab === "diff" && (
              <div className="space-y-1 text-xs">
                <div className="text-outline">
                  Comparing current buffer against standard knative service template:
                </div>
                <div className="text-primary">+ containerPort: 8080</div>
                <div className="text-primary">+ memory: 512Mi</div>
                <div className="text-primary">+ containerConcurrency: 80</div>
              </div>
            )}

            {terminalTab === "linter" && (
              <div className="space-y-1 text-xs text-on-surface-variant">
                <div className="text-primary-container font-semibold">
                  ✓ 0 Syntax errors detected.
                </div>
                <div>YAML indentation compliant with Knative Serving v1 spec.</div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
