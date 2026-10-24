"use client";

import React, { useState } from "react";
import { LearningModule } from "@/types";

interface DashboardProps {
  modules: LearningModule[];
  onSelectModule: (module: LearningModule) => void;
  onOpenMobilePreview: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  modules,
  onSelectModule,
  onOpenMobilePreview,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<string>("All Tracks");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tracks = [
    "All Tracks",
    "GCP Cloud Engineering",
    "Backend Architecture",
    "Full-Stack Web",
  ];

  const filteredModules = modules.filter((m) => {
    const matchesTrack =
      selectedTrack === "All Tracks" || m.track === selectedTrack;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesSearch;
  });

  const activeHeroModule = modules[0] || {
    id: 1,
    code_id: "GCP_ARCH_804",
    title: "Deploy Resilient Next.js Microservice to Cloud Run with Redis Ingress",
    track: "GCP Cloud Engineering",
    estimated_minutes: 10,
    difficulty: "Intermediate",
    badge_label: "ACTIVE SIMULATION",
    summary:
      "Configure container networking, port mappings, and memory budgets to eliminate 502 cold-start starvation under burst concurrency.",
  };

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
      {/* HERO: "Continue Learning" Active Simulation Banner */}
      <section className="relative bg-surface-container-low border border-outline-variant rounded-xl p-6 md:p-8 overflow-hidden group hover:border-outline transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1 flex flex-col gap-3">
            {/* Status & Code */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-label-code font-label-code bg-surface border border-primary-container/40 text-primary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container beacon-pulse"></span>
                {activeHeroModule.badge_label || "ACTIVE SIMULATION"}
              </span>
              <span className="text-label-code font-label-code text-on-surface-variant">
                {activeHeroModule.code_id} • TRACK: {activeHeroModule.track.toUpperCase()}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface tracking-tight">
              {activeHeroModule.title}
            </h1>

            {/* Description */}
            <p className="text-body-md text-on-surface-variant max-w-3xl leading-relaxed">
              {activeHeroModule.summary}
            </p>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-4 text-code-md font-code-md text-on-surface-variant pt-2">
              <span className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded border border-outline-variant">
                <span className="material-symbols-outlined text-sm text-primary">
                  timer
                </span>
                {activeHeroModule.estimated_minutes} min practical brief
              </span>
              <span className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded border border-outline-variant">
                <span className="material-symbols-outlined text-sm text-secondary">
                  signal_cellular_alt
                </span>
                {activeHeroModule.difficulty}
              </span>
              <span className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded border border-outline-variant">
                <span className="material-symbols-outlined text-sm text-primary-container">
                  task_alt
                </span>
                Zero setup sandbox • Instant assertions
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onSelectModule(activeHeroModule)}
              className="bg-primary-container text-on-primary-container font-code-md text-code-md font-bold px-6 py-3 rounded-lg hover:bg-[#84cc16] active:scale-[0.98] transition-all flex items-center justify-center gap-2 neon-halo cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-lg font-bold"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
              <span>Enter Sandbox Simulation</span>
            </button>

            <button
              onClick={onOpenMobilePreview}
              className="bg-surface-container text-on-surface hover:text-primary font-code-md text-code-md px-4 py-2.5 rounded-lg border border-outline-variant hover:border-primary transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">
                chat
              </span>
              <span>Preview WhatsApp 3-Min Nudge</span>
            </button>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Track Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {tracks.map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              className={`px-3 py-1.5 rounded-md text-code-md font-code-md transition-all ${
                selectedTrack === track
                  ? "bg-surface-container-high text-primary border border-primary-container/40"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/60"
              }`}
            >
              {track}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search simulations, briefs..."
            className="bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-4 py-1.5 text-code-md font-code-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none w-full md:w-64"
          />
        </div>
      </div>

      {/* CORPORATE BRIEFS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-title-sm font-title-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              corporate_fare
            </span>
            Simulated Corporate Briefs ({filteredModules.length})
          </h2>
          <span className="text-label-code font-label-code text-on-surface-variant">
            Replaces video courses with interactive execution
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModules.map((module) => (
            <div
              key={module.id}
              onClick={() => onSelectModule(module)}
              className="bg-surface-container-low border border-outline-variant hover:border-primary rounded-xl p-5 flex flex-col justify-between gap-4 cursor-pointer transition-all duration-200 group hover:shadow-lg hover:shadow-primary-container/5"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-label-code bg-surface-container border border-outline-variant text-primary font-medium">
                    {module.code_id}
                  </span>
                  <span className="text-[11px] font-code-md text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">
                      schedule
                    </span>
                    {module.estimated_minutes}m
                  </span>
                </div>

                <h3 className="text-base font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2">
                  {module.title}
                </h3>

                <p className="text-body-sm text-on-surface-variant line-clamp-3 leading-relaxed">
                  {module.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between text-code-md font-code-md">
                <span className="text-xs text-on-surface-variant bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant">
                  {module.track}
                </span>

                <div className="flex items-center gap-1 text-primary text-xs font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Start Brief</span>
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ARCHITECTURE & INTEGRATION BADGES */}
      <section className="bg-surface-container rounded-xl p-6 border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-title-sm font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-lg">
              hub
            </span>
            Automated Upskilling Architecture
          </h3>
          <p className="text-body-sm text-on-surface-variant">
            Zero friction, zero local dependencies. Integrates WhatsApp daily microlearning nudges (Make.com + WATI), PostgreSQL on Cloud SQL, and Razorpay subscriptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 bg-surface-container-high rounded border border-outline-variant font-code-md text-xs text-on-surface">
            GCP Cloud Run
          </div>
          <div className="px-3 py-1.5 bg-surface-container-high rounded border border-outline-variant font-code-md text-xs text-on-surface">
            Make.com Webhooks
          </div>
          <div className="px-3 py-1.5 bg-surface-container-high rounded border border-outline-variant font-code-md text-xs text-on-surface">
            WhatsApp WATI
          </div>
          <div className="px-3 py-1.5 bg-surface-container-high rounded border border-outline-variant font-code-md text-xs text-on-surface">
            Razorpay Billing
          </div>
        </div>
      </section>
    </div>
  );
};
