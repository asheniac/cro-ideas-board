"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CROCard from "@/components/CROCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useIdeas } from "@/lib/hooks/use-ideas";
import { useUpdateIdea } from "@/lib/hooks/use-update-idea";
import { useSwipeKeyboard } from "@/lib/hooks/use-swipe-keyboard";

const STACK_DEPTH = 3;
const VERTICAL_OFFSET = 16;
const TOAST_DURATION = 4000;

const SCALES = [1.0, 0.96, 0.92];
const OPACITIES = [1, 0.9, 0.8];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [toast, setToast] = useState<{ message: string; ideaId: number } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ideas, loading, error, refetch } = useIdeas("pending");
  const { updateStatus, undoStatus } = useUpdateIdea();

  const clearToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = null;
    setToast(null);
  }, []);

  const showUndoToast = useCallback((message: string, ideaId: number) => {
    clearToast();
    setToast({ message, ideaId });
    toastTimerRef.current = setTimeout(clearToast, TOAST_DURATION);
  }, [clearToast]);

  const advanceCard = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(false);
  }, []);

  const handleLike = useCallback(async (id: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    try {
      await updateStatus(id, "liked");
      advanceCard();
      showUndoToast("Added to collection", id);
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed", ideaId: 0 });
      setIsTransitioning(false);
    }
  }, [isTransitioning, updateStatus, advanceCard, showUndoToast]);

  const handleDislike = useCallback(async (id: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    try {
      await updateStatus(id, "disliked");
      advanceCard();
      showUndoToast("Dismissed", id);
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed", ideaId: 0 });
      setIsTransitioning(false);
    }
  }, [isTransitioning, updateStatus, advanceCard, showUndoToast]);

  const handleUndo = useCallback(async (id: number) => {
    clearToast();
    navigator.vibrate?.([10, 30, 10]);
    try {
      await undoStatus(id);
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    } catch { /* silent */ }
  }, [clearToast, undoStatus]);

  useSwipeKeyboard({
    onLike: () => {
      const topCard = ideas[currentIndex];
      if (topCard && !isTransitioning) handleLike(topCard.id);
    },
    onDislike: () => {
      const topCard = ideas[currentIndex];
      if (topCard && !isTransitioning) handleDislike(topCard.id);
    },
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-[var(--muted)] text-sm font-medium">Loading ideas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm mx-auto px-6">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button onClick={refetch} className="px-5 py-2.5 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (ideas.length === 0 || currentIndex >= ideas.length) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2 tracking-tight">
            {currentIndex >= ideas.length ? "Batch Complete" : "All Caught Up"}
          </h2>
          <p className="text-[var(--muted)] text-sm mb-8 max-w-xs mx-auto">
            {currentIndex >= ideas.length
              ? `You've reviewed ${ideas.length} ideas. Check back soon for more research.`
              : "No pending ideas right now. New research is on the way."}
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/liked" className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/25">
              View Collection
            </a>
            <a href="/dislike" className="px-5 py-2.5 bg-[var(--surface)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--border)] transition-colors border border-[var(--border)]">
              Dismissed
            </a>
          </div>
        </div>
      </div>
    );
  }

  const stackCards: { idea: (typeof ideas)[number]; stackPos: number }[] = [];
  for (let i = 0; i < STACK_DEPTH; i++) {
    const idx = currentIndex + i;
    if (idx < ideas.length) stackCards.push({ idea: ideas[idx], stackPos: i });
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-widest">
          Reviewing
        </p>
        <p className="text-3xl font-bold text-[var(--foreground)] tracking-tight mt-1">
          {currentIndex + 1}
          <span className="text-[var(--muted)] font-normal"> / {ideas.length}</span>
        </p>
      </motion.div>

      {/* Card stack */}
      <div
        className="relative w-full max-w-sm"
        style={{ minHeight: "480px" }}
      >
        <AnimatePresence mode="popLayout">
          {stackCards.map(({ idea, stackPos }) => {
            const isTop = stackPos === 0;
            const scale = SCALES[stackPos] ?? 0.92;
            const opacity = OPACITIES[stackPos] ?? 0.8;
            const yOffset = stackPos * VERTICAL_OFFSET;

            return (
              <motion.div
                key={idea.id}
                layout
                className="absolute top-0 left-0 right-0"
                style={{ zIndex: STACK_DEPTH - stackPos }}
                initial={{ scale: stackPos === STACK_DEPTH - 1 ? 0.88 : false, opacity: stackPos === STACK_DEPTH - 1 ? 0 : false }}
                animate={{ scale, y: yOffset, opacity }}
                exit={{ scale: 0.88, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                {isTop && isTransitioning ? (
                  <SkeletonCard />
                ) : (
                  <CROCard
                    idea={idea}
                    onLike={handleLike}
                    onDislike={handleDislike}
                    disabled={!isTop || isTransitioning}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Keyboard hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-xs text-[var(--muted)] font-medium"
      >
        Use arrow keys or swipe
      </motion.p>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--foreground)] text-[var(--background)] px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-4"
          >
            <span>{toast.message}</span>
            {toast.ideaId !== 0 && (
              <button
                onClick={() => handleUndo(toast.ideaId)}
                className="text-[var(--accent)] hover:underline"
              >
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
