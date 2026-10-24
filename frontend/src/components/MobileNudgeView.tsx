"use client";

import React, { useState } from "react";
import { LearningModule } from "@/types";

interface MobileNudgeViewProps {
  module: LearningModule;
  streakCount: number;
  onOpenSandbox: () => void;
  onSubmitQuiz: (selectedIndex: number) => Promise<{
    is_correct: boolean;
    explanation: string;
    updated_streak: number;
  }>;
}

export const MobileNudgeView: React.FC<MobileNudgeViewProps> = ({
  module,
  streakCount,
  onOpenSandbox,
  onSubmitQuiz,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [currentStreak, setCurrentStreak] = useState<number>(streakCount);

  const options = module.quiz_options || [
    "Cloud Run ingress proxy routes internal health checks strictly to PORT 8080 by default",
    "Next.js cannot run on Node.js inside Alpine containers",
    "Cloud Run requires root privileges to open ports below 1024",
    "Port 3000 is reserved for Cloud SQL Auth Proxy connections",
  ];

  const handleSelectOption = async (idx: number) => {
    if (isSubmitted) return;
    setSelectedIndex(idx);
    setIsSubmitted(true);

    try {
      const res = await onSubmitQuiz(idx);
      setIsCorrect(res.is_correct);
      setExplanation(res.explanation);
      setCurrentStreak(res.updated_streak);
    } catch {
      // Local fallback
      const correct = idx === 0;
      setIsCorrect(correct);
      setExplanation(
        "Cloud Run expects inbound HTTP traffic on the port designated by the PORT environment variable (default 8080). If mismatched, health probes fail with 502 Bad Gateway."
      );
      if (correct) {
        setCurrentStreak((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-8 flex flex-col items-center justify-center">
      {/* Simulation Header Banner */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant font-code-md text-xs text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
          <span>WATI WhatsApp Business + Make.com Automation Engine</span>
        </div>
        <h2 className="text-headline-md font-bold text-on-surface">
          3-Minute Daily Microlearning Nudge
        </h2>
        <p className="text-body-sm text-on-surface-variant max-w-lg mx-auto">
          Time-poor engineers receive daily contextual quizzes directly on WhatsApp. Passing quizzes keeps the streak alive without context-switching.
        </p>
      </div>

      {/* Smartphone Chassis Container */}
      <div className="w-full max-w-md bg-surface-container-lowest border-4 border-surface-container-high rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Phone Notch & Status Bar */}
        <div className="bg-surface px-6 pt-3 pb-2 flex justify-between items-center text-xs text-on-surface-variant border-b border-outline-variant select-none">
          <span className="font-semibold text-on-surface">9:41</span>
          <div className="w-20 h-4 bg-surface-container-highest rounded-full"></div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xs">signal_cellular_alt</span>
            <span className="material-symbols-outlined text-xs">wifi</span>
            <span className="material-symbols-outlined text-xs">battery_full</span>
          </div>
        </div>

        {/* WhatsApp Chat Header */}
        <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-container/20 border border-primary-container flex items-center justify-center font-bold text-primary text-sm">
              <span className="material-symbols-outlined text-primary text-base">
                terminal
              </span>
            </div>
            <div>
              <div className="font-semibold text-sm text-on-surface flex items-center gap-1">
                <span>DevSync Bot</span>
                <span className="material-symbols-outlined text-xs text-primary">
                  verified
                </span>
              </div>
              <div className="text-[11px] text-on-surface-variant">
                WhatsApp Business • Active Daily
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface border border-outline-variant text-xs text-primary font-code-md">
            <span
              className="material-symbols-outlined text-xs text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span>{currentStreak}d Streak</span>
          </div>
        </div>

        {/* WhatsApp Chat Message Canvas */}
        <div className="p-4 space-y-4 bg-surface flex-1 overflow-y-auto min-h-[460px]">
          {/* Timestamp Pill */}
          <div className="flex justify-center">
            <span className="bg-surface-container px-2.5 py-0.5 rounded-full text-[10px] font-code-md text-on-surface-variant">
              TODAY • 8:00 AM
            </span>
          </div>

          {/* Incoming Nudge Bubble */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl rounded-tl-none p-4 space-y-3 shadow-md">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-label-code bg-surface text-primary border border-outline-variant">
                  {module.code_id}
                </span>
                <span className="text-[11px] font-code-md text-on-surface-variant">
                  3-Min Nudge
                </span>
              </div>
              <h3 className="font-bold text-sm text-on-surface">
                {module.title}
              </h3>
            </div>

            {/* Quiz Question */}
            <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/60 text-xs text-on-surface font-medium leading-relaxed">
              <div className="text-primary font-code-md mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">quiz</span>
                <span>Daily Technical Assessment:</span>
              </div>
              {module.quiz_question ||
                "Why does Cloud Run return 502 Bad Gateway if a Next.js container listens on port 3000 without PORT configuration?"}
            </div>

            {/* 4 Interactive Choices */}
            <div className="space-y-2 pt-1">
              {options.map((option, idx) => {
                const isSelected = selectedIndex === idx;
                const isCorrectOption = idx === 0;

                let btnStyle =
                  "bg-surface-container hover:bg-surface-container-high border-outline-variant text-on-surface";
                if (isSubmitted) {
                  if (isSelected && isCorrectOption) {
                    btnStyle =
                      "bg-primary-container/20 border-primary-container text-primary font-semibold";
                  } else if (isSelected && !isCorrectOption) {
                    btnStyle = "bg-error/20 border-error text-error";
                  } else if (isCorrectOption) {
                    btnStyle =
                      "bg-primary-container/20 border-primary-container text-primary";
                  } else {
                    btnStyle = "opacity-40 border-outline-variant";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs leading-snug transition-all flex items-start gap-2 ${btnStyle}`}
                  >
                    <span className="font-code-md font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span className="flex-1">{option}</span>
                    {isSubmitted && isCorrectOption && (
                      <span className="material-symbols-outlined text-sm text-primary shrink-0">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Result & Explanation Feedback */}
            {isSubmitted && (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                  isCorrect
                    ? "bg-primary-container/10 border-primary-container text-on-surface"
                    : "bg-surface-container-high border-outline-variant text-on-surface"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-primary">
                  <span className="material-symbols-outlined text-sm">
                    {isCorrect ? "verified" : "info"}
                  </span>
                  <span>{isCorrect ? "Correct! +1 Streak Day" : "Explanation"}</span>
                </div>
                <p className="text-on-surface-variant text-[11px] leading-relaxed">
                  {explanation}
                </p>
              </div>
            )}

            {/* Magic Link to Full Sandbox */}
            <div className="pt-2 border-t border-outline-variant/60">
              <button
                onClick={onOpenSandbox}
                className="w-full bg-primary-container text-on-primary-container font-code-md text-xs font-bold py-2 rounded-lg hover:bg-[#84cc16] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 neon-halo cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">
                  splitscreen
                </span>
                <span>Open in Dual-Pane Sandbox</span>
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp Message Input Bar */}
        <div className="bg-surface-container-low p-2.5 border-t border-outline-variant flex items-center gap-2">
          <div className="flex-1 bg-surface-container rounded-full px-3 py-1.5 text-xs text-on-surface-variant flex items-center justify-between">
            <span>Tap option A, B, C, or D above...</span>
            <span className="material-symbols-outlined text-sm">attach_file</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined text-sm font-bold">
              mic
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
