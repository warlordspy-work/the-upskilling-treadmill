"use client";

import React, { useState } from "react";
import { LearningModule, TutorMessage } from "@/types";

interface AiTutorWidgetProps {
  module: LearningModule;
  stepNumber: number;
}

export const AiTutorWidget: React.FC<AiTutorWidgetProps> = ({
  module,
  stepNumber,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: "1",
      sender: "user",
      text: "Why did my previous container fail health checks on port 3000?",
      timestamp: "10:14 AM",
    },
    {
      id: "2",
      sender: "ai",
      text: "Cloud Run defaults to listening on **PORT 8080**. You mapped 3000 in your Dockerfile without setting the PORT environment variable. Updating line 18 in `service.yaml` to `containerPort: 8080` resolves this instantly.",
      codeFix: "containerPort: 8080",
      timestamp: "10:14 AM",
    },
  ]);

  const [suggestions, setSuggestions] = useState<string[]>([
    "Explain Line 18",
    "Show Best Practices",
    "Test Edge Cases",
  ]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: TutorMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/tutor/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: module.id,
          user_query: textToSend,
          current_step: stepNumber,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: TutorMessage = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: data.response,
          codeFix: data.code_fix,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (data.suggested_actions?.length > 0) {
          setSuggestions(data.suggested_actions);
        }
      } else {
        throw new Error("Backend offline");
      }
    } catch {
      // Local contextual fallback response
      let fallbackText =
        "Cloud Run expects inbound HTTP traffic on port 8080. Check your `service.yaml` specification and ensure concurrency is locked to 80 to prevent cold start starvation.";
      if (textToSend.toLowerCase().includes("line 18")) {
        fallbackText =
          "Line 18 specifies the containerPort. Cloud Run forwards external traffic to this exact container port. If this is 3000, your container will never report healthy.";
      } else if (textToSend.toLowerCase().includes("best practice")) {
        fallbackText =
          "Cloud Run best practices: 1) Keep images under 150MB with multi-stage builds. 2) Set `min-instances: 1` in production to eliminate cold starts. 3) Configure connection pooling for Cloud SQL.";
      }

      const aiMsg: TutorMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end pointer-events-none">
      {isOpen ? (
        <div className="pointer-events-auto w-96 mb-3 bg-surface-container border border-outline-variant rounded-xl shadow-2xl overflow-hidden backdrop-blur-md flex flex-col border-primary-container/30 transition-all duration-300">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-surface-container-high border-b border-outline-variant flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary-container/20 border border-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">
                  smart_toy
                </span>
              </div>
              <div>
                <h3 className="font-code-md text-code-md font-semibold text-on-surface">
                  DevAI Copilot
                </h3>
                <p className="font-label-code text-label-code text-outline-variant">
                  In-Context Tutor • Active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="text-on-surface-variant hover:text-primary p-1 transition-colors"
                title="Minimize Tutor"
              >
                <span className="material-symbols-outlined text-sm">
                  minimize
                </span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-on-surface-variant hover:text-error p-1 transition-colors"
                title="Close Tutor"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>

          {/* Chat Conversation Body */}
          <div className="p-3.5 space-y-3 max-h-72 overflow-y-auto font-body-sm text-body-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start gap-2 items-start"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-0.5">
                    <span
                      className="material-symbols-outlined text-on-primary-container text-xs font-bold"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      bolt
                    </span>
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-surface-container-highest text-on-surface rounded-tr-none max-w-[85%] border border-outline-variant/40"
                      : "bg-surface-container-lowest text-on-surface-variant rounded-tl-none border border-outline-variant space-y-1.5"
                  }`}
                >
                  <p className="text-on-surface whitespace-pre-wrap">{msg.text}</p>
                  {msg.codeFix && (
                    <div className="pt-1">
                      <code className="font-code-md text-label-code text-primary bg-surface px-1.5 py-0.5 rounded border border-outline-variant">
                        {msg.codeFix}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
                <span>DevAI is analyzing lesson context...</span>
              </div>
            )}

            {/* Quick Suggestion Pills */}
            <div className="pt-1 flex flex-wrap gap-1.5">
              {suggestions.map((pill) => (
                <button
                  key={pill}
                  onClick={() => handleSend(pill)}
                  className="px-2 py-0.5 rounded-full bg-surface-container-lowest border border-outline-variant hover:border-primary font-code-md text-label-code text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-surface-container-lowest border-t border-outline-variant">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5 bg-surface rounded border border-outline-variant focus-within:border-primary-container px-2.5 py-1.5 transition-colors"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask AI Tutor a question..."
                className="bg-transparent border-none text-on-surface placeholder:text-outline text-body-sm focus:ring-0 p-0 w-full outline-none"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="text-primary hover:text-primary-container p-0.5 transition-colors disabled:opacity-30"
                title="Send query"
              >
                <span className="material-symbols-outlined text-lg">
                  arrow_upward
                </span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto w-12 h-12 rounded-full bg-surface-container border-2 border-primary-container text-primary flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all neon-halo group"
          title="Open DevAI Tutor"
        >
          <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">
            forum
          </span>
        </button>
      )}
    </div>
  );
};
