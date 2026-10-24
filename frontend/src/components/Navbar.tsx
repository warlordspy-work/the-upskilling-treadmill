"use client";

import React from "react";
import { UserProfile, LearningModule } from "@/types";

interface NavbarProps {
  currentView: "dashboard" | "sandbox" | "mobile";
  onViewChange: (view: "dashboard" | "sandbox" | "mobile") => void;
  activeModule?: LearningModule;
  user: UserProfile;
  stepNumber?: number;
  totalSteps?: number;
  onResetCode?: () => void;
  onTriggerNudge?: () => void;
  isNudgeTriggering?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  activeModule,
  user,
  stepNumber = 2,
  totalSteps = 5,
  onResetCode,
  onTriggerNudge,
  isNudgeTriggering,
}) => {
  const percentComplete = Math.round((stepNumber / totalSteps) * 100);

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-8 h-14 border-b border-outline-variant bg-surface sticky top-0 z-50 shrink-0 select-none">
      {/* Left: Brand Logo & Contextual Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => onViewChange("dashboard")}
          className="text-title-sm font-bold tracking-tight text-primary flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-primary text-xl">
            terminal
          </span>
          <span>DevUpskill</span>
        </div>

        {currentView === "sandbox" && activeModule && (
          <div className="hidden lg:flex items-center gap-2 text-outline-variant font-code-md text-code-md">
            <span>/</span>
            <span
              onClick={() => onViewChange("dashboard")}
              className="text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors"
            >
              Corporate Briefs
            </span>
            <span>/</span>
            <span className="text-on-surface-variant truncate max-w-[200px]">
              {activeModule.title}
            </span>
            <span>/</span>
            <span className="text-on-surface font-medium flex items-center gap-1.5 bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
              {activeModule.code_id} • Step {stepNumber}
            </span>
          </div>
        )}
      </div>

      {/* Center: Interactive Step Progress Tracker (Shown in Sandbox View) */}
      {currentView === "sandbox" && (
        <div className="hidden md:flex items-center gap-3 bg-surface-container-lowest px-4 py-1.5 rounded-full border border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="font-label-code text-label-code text-on-surface-variant uppercase tracking-wider">
              Step
            </span>
            <span className="font-code-md text-code-md font-semibold text-primary">
              {stepNumber}
            </span>
            <span className="font-code-md text-code-md text-outline">
              of {totalSteps}
            </span>
          </div>
          <div className="w-28 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex">
            <div
              className="h-full bg-primary-container rounded-full neon-halo transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
          <span className="font-label-code text-label-code text-primary font-medium">
            {percentComplete}% Complete
          </span>
        </div>
      )}

      {/* Right: Actions, Streaks & Developer Profile */}
      <div className="flex items-center gap-3">
        {/* Nudge Trigger Button */}
        {onTriggerNudge && (
          <button
            onClick={onTriggerNudge}
            disabled={isNudgeTriggering}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-primary-container/40 hover:border-primary-container rounded text-label-code font-code-md text-primary transition-all active:scale-95"
            title="Dispatch 3-minute WhatsApp technical quiz via Make.com webhook"
          >
            <span className="material-symbols-outlined text-sm text-primary">
              send_to_mobile
            </span>
            <span>
              {isNudgeTriggering ? "Sending Nudge..." : "Send WhatsApp Nudge"}
            </span>
          </button>
        )}

        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container border border-outline-variant rounded font-code-md text-code-md text-on-surface">
          <span
            className="material-symbols-outlined text-primary-container text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            local_fire_department
          </span>
          <span className="font-semibold text-primary">
            Streak {user.streak_count}
          </span>
        </div>

        {currentView === "sandbox" && onResetCode && (
          <button
            onClick={onResetCode}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-on-surface-variant hover:text-on-surface hover:border-outline-variant border border-transparent rounded font-code-md text-label-code transition-all"
            title="Reset sandbox files to original brief"
          >
            <span className="material-symbols-outlined text-base">
              restart_alt
            </span>
            <span>Reset</span>
          </button>
        )}

        {/* Notifications and Settings */}
        <button
          className="p-1.5 text-on-surface-variant hover:text-primary transition-colors duration-150"
          title="Telemetry Notifications"
        >
          <span className="material-symbols-outlined text-xl">
            notifications
          </span>
        </button>

        {/* User Profile Avatar */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          title={`${user.name} (${user.email})`}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full border border-outline-variant bg-surface-container-high flex items-center justify-center font-bold text-primary text-xs">
              AD
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary-container border-2 border-surface"></span>
          </div>
          <span className="hidden sm:inline font-code-md text-code-md text-on-surface font-medium">
            alx.dev
          </span>
        </div>
      </div>
    </header>
  );
};
