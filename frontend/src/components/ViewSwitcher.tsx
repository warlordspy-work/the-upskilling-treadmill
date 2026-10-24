"use client";

import React from "react";

interface ViewSwitcherProps {
  currentView: "dashboard" | "sandbox" | "mobile";
  onViewChange: (view: "dashboard" | "sandbox" | "mobile") => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
}) => {
  return (
    <section className="w-full bg-surface-container-lowest border-b border-outline-variant px-4 md:px-8 py-2 select-none">
      <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Toggle Pills */}
        <div className="flex items-center p-0.5 bg-surface-container border border-outline-variant rounded">
          <button
            onClick={() => onViewChange("dashboard")}
            className={`px-3 py-1 text-code-md font-code-md rounded transition-all flex items-center gap-2 ${
              currentView === "dashboard"
                ? "bg-surface text-primary border border-outline-variant shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {currentView === "dashboard" && (
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            )}
            Overview & Simulations
          </button>

          <button
            onClick={() => onViewChange("sandbox")}
            className={`px-3 py-1 text-code-md font-code-md rounded transition-all flex items-center gap-1.5 ${
              currentView === "sandbox"
                ? "bg-surface text-primary border border-outline-variant shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-body-sm">
              splitscreen
            </span>
            Split-Pane Sandbox
          </button>

          <button
            onClick={() => onViewChange("mobile")}
            className={`px-3 py-1 text-code-md font-code-md rounded transition-all flex items-center gap-1.5 ${
              currentView === "mobile"
                ? "bg-surface text-primary border border-outline-variant shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-body-sm">
              smartphone
            </span>
            Mobile Microlearning Nudge
          </button>
        </div>

        {/* Live Cluster Instrument Telemetry */}
        <div className="hidden sm:flex items-center gap-3 text-label-code font-label-code text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container beacon-pulse"></span>
            GCP CLUSTER: us-central1-c (ACTIVE)
          </span>
          <span className="text-outline">|</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-label-code">
              memory
            </span>
            RUN POD MEM: 412Mi / 1024Mi
          </span>
        </div>
      </div>
    </section>
  );
};
