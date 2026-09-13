"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

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
      className="group flex w-full items-start gap-4 rounded-3xl bg-white/70 p-6 text-left ring-1 ring-zinc-900/5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-zinc-900/60 dark:ring-white/10 dark:hover:bg-zinc-900"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/25 transition duration-300 group-hover:scale-105">
        {icon}
      </span>

      <span className="flex-1">
        <span className="block text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </span>
      </span>

      <ChevronRight
        className="mt-1 size-4 shrink-0 text-zinc-400 transition duration-300 group-hover:translate-x-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
        aria-hidden="true"
      />
    </button>
  );
}
