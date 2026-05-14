"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIdeas } from "@/lib/hooks/use-ideas";
import { useUpdateIdea } from "@/lib/hooks/use-update-idea";

function IdeaCard({ idea, onMove }: { idea: any; onMove: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group glass rounded-2xl overflow-hidden cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        <img
          src={idea.mockupUrl || `https://picsum.photos/seed/${idea.id}/800/450`}
          alt={idea.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          {idea.category.name}
        </span>
        <h3 className="text-base font-semibold text-[var(--foreground)] mt-3 mb-2 tracking-tight leading-snug">
          {idea.title}
        </h3>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          {expanded ? idea.description : idea.description.slice(0, 100) + (idea.description.length > 100 ? "..." : "")}
        </p>

        {/* Expandable details */}
        <motion.div
          initial={false}
          animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="border-t border-[var(--border)] pt-4 mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Why this works
              </h4>
              <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
                {idea.reason}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Purpose
              </h4>
              <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
                {idea.purpose}
              </p>
            </div>
          </div>
        </motion.div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(idea.id);
          }}
          className="mt-4 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
        >
          Move to Dismissed
        </button>
      </div>
    </motion.div>
  );
}

export default function LikedPage() {
  const { ideas, loading, refetch } = useIdeas("liked");
  const { updateStatus } = useUpdateIdea();
  const [removing, setRemoving] = useState<number | null>(null);

  const moveToDislike = async (id: number) => {
    setRemoving(id);
    await updateStatus(id, "disliked");
    refetch();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-10">
          <div className="h-10 w-56 rounded-xl bg-[var(--border)] animate-pulse" />
          <div className="h-5 w-32 rounded-lg bg-[var(--border)] animate-pulse mt-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              <div className="aspect-[16/9] bg-[var(--border)] animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-20 rounded-full bg-[var(--border)] animate-pulse" />
                <div className="h-6 w-full rounded-lg bg-[var(--border)] animate-pulse" />
                <div className="h-4 w-3/4 rounded-lg bg-[var(--border)] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Saved Ideas
          </h1>
        </div>
        <p className="text-[var(--muted)] text-sm ml-1">
          {ideas.length} idea{ideas.length !== 1 ? "s" : ""} in your collection
        </p>
      </motion.div>

      {ideas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--border)] flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <p className="text-[var(--muted)] text-sm mb-6">No saved ideas yet.</p>
          <a href="/" className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20">
            Start Swiping
          </a>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onMove={moveToDislike} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}