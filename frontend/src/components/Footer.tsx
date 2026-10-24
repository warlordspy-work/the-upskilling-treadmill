"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-4 md:px-8 border-t border-outline-variant bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center gap-3 shrink-0 select-none z-30">
      <div className="flex items-center gap-4">
        <span className="text-body-sm font-code-md text-on-surface">
          © 2025 DevUpskill. Terminal-grade mastery for modern engineers.
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-label-code font-code-md">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          Documentation
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-primary hover:text-primary-container transition-colors"
        >
          Sandbox Environment
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          Curriculum Index
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
          Telemetry Status
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          Privacy
        </a>
      </div>
    </footer>
  );
};
