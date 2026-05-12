"use client";

import { useState } from "react";

interface CROIdea {
  id: number;
  title: string;
  description: string;
  reason: string;
  purpose: string;
  category: { id: number; name: string; slug: string };
  status: string;
  mockupUrl: string | null;
  createdAt: string;
}

interface CROCardProps {
  idea: CROIdea;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
}

export default function CROCard({ idea, onLike, onDislike }: CROCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);

  const handleLike = () => {
    setExiting("right");
    setTimeout(() => onLike(idea.id), 300);
  };

  const handleDislike = () => {
    setExiting("left");
    setTimeout(() => onDislike(idea.id), 300);
  };

  return (
    <div
      className={`relative w-full max-w-md mx-auto transition-all duration-300 ${
        exiting === "right"
          ? "translate-x-[150%] rotate-12 opacity-0"
          : exiting === "left"
          ? "-translate-x-[150%] -rotate-12 opacity-0"
          : ""
      }`}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Mockup Image */}
        {idea.mockupUrl && (
          <div className="relative w-full h-56 bg-zinc-100 dark:bg-zinc-800">
            <img
              src={idea.mockupUrl}
              alt={idea.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {idea.category.name}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            {idea.title}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3">
            {idea.description}
          </p>

          {/* Expandable details */}
          {expanded && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 mt-3 space-y-3">
              <div>
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  🎯 Why this is a good idea
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {idea.reason}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  📌 Purpose
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {idea.purpose}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 dark:text-blue-400 mt-2 hover:underline"
          >
            {expanded ? "Show less" : "Show details"}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6 mt-5">
        <button
          onClick={handleDislike}
          className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-2xl hover:scale-110 transition-transform hover:border-red-400"
          aria-label="Dislike"
        >
          ❌
        </button>
        <button
          onClick={handleLike}
          className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-2xl hover:scale-110 transition-transform hover:border-green-400"
          aria-label="Like"
        >
          ❤️
        </button>
      </div>
    </div>
  );
}
