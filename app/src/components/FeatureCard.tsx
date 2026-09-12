"use client";

import React from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  onClick?: () => void;
  icon?: React.ReactNode;
};

export function FeatureCard({ title, description, onClick, icon }: FeatureCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start justify-between rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-200">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        </div>
      </div>
    </button>
  );
}
