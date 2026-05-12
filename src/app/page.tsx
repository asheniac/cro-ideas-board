"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CROCard from "@/components/CROCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useIdeas } from "@/lib/hooks/use-ideas";
import { useUpdateIdea } from "@/lib/hooks/use-update-idea";
import { useSwipeKeyboard } from "@/lib/hooks/use-swipe-keyboard";

const STACK_DEPTH = 3;
const VERTICAL_OFFSET = 40;
const TOAST_DURATION = 5000;

/** Scale and opacity per stack position (0 = top card) */
const SCALES = [1.0, 0.95, 0.9];
const OPACITIES = [1, 0.85, 0.7];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    ideaId: number;
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ideas, loading, error, refetch } = useIdeas("pending");
  const { updateStatus, undoStatus } = useUpdateIdea();

  const clearToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showUndoToast = useCallback(
    (message: string, ideaId: number) => {
      clearToast();
      setToast({ message, ideaId });
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
      }, TOAST_DURATION);
    },
    [clearToast]
  );

  const advanceCard = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(false);
  }, []);

  const handleLike = useCallback(
    async (id: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      try {
        await updateStatus(id, "liked");
        advanceCard();
        showUndoToast("Idea liked!", id);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to like idea";
        clearToast();
        setToast({ message, ideaId: 0 });
        setIsTransitioning(false);
      }
    },
    [isTransitioning, updateStatus, advanceCard, showUndoToast, clearToast]
  );

  const handleDislike = useCallback(
    async (id: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      try {
        await updateStatus(id, "disliked");
        advanceCard();
        showUndoToast("Idea disliked!", id);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to dislike idea";
        clearToast();
        setToast({ message, ideaId: 0 });
        setIsTransitioning(false);
      }
    },
    [isTransitioning, updateStatus, advanceCard, showUndoToast, clearToast]
  );

  const handleUndo = useCallback(
    async (id: number) => {
      clearToast();
      try {
        await undoStatus(id);
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } catch {
        // Undo failed — silently ignore, user can manually re-like/dislike
      }
    },
    [clearToast, undoStatus]
  );

  // Keyboard navigation (left = dislike, right = like)
  useSwipeKeyboard({
    onLike: () => {
      const topCard = ideas[currentIndex];
      if (topCard && !isTransitioning) {
        handleLike(topCard.id);
      }
    },
    onDislike: () => {
      const topCard = ideas[currentIndex];
      if (topCard && !isTransitioning) {
        handleDislike(topCard.id);
      }
    },
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500 animate-pulse">Loading CRO ideas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            🎉 All caught up!
          </h2>
          <p className="text-zinc-500 mb-6">
            No pending CRO ideas right now. Check back soon for new research.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/liked"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              View Liked
            </a>
            <a
              href="/dislike"
              className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700"
            >
              View Disliked
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= ideas.length) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            ✅ Batch complete!
          </h2>
          <p className="text-zinc-500 mb-6">
            You&apos;ve reviewed all {ideas.length} ideas in this batch.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/liked"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              View Liked
            </a>
            <a
              href="/dislike"
              className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700"
            >
              View Disliked
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Build stack: up to STACK_DEPTH cards starting from currentIndex
  const stackCards: { idea: (typeof ideas)[number]; stackPos: number }[] = [];
  for (let i = 0; i < STACK_DEPTH; i++) {
    const idx = currentIndex + i;
    if (idx < ideas.length) {
      stackCards.push({ idea: ideas[idx], stackPos: i });
    }
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-6">
      {/* Undo toast at bottom of screen */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm flex items-center gap-3"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <span>{toast.message}</span>
          {toast.ideaId !== 0 && (
            <button
              onClick={() => handleUndo(toast.ideaId)}
              className="font-semibold text-blue-400 dark:text-blue-600 hover:underline whitespace-nowrap"
            >
              Undo
            </button>
          )}
        </div>
      )}

      <div className="text-center mb-6">
        <p className="text-sm text-zinc-500">
          {currentIndex + 1} of {ideas.length}
        </p>
      </div>

      {/* Card stack container */}
      <div className="relative w-full max-w-md" style={{ minHeight: "520px" }}>
        <AnimatePresence mode="popLayout">
          {stackCards.map(({ idea, stackPos }) => {
            const isTop = stackPos === 0;
            const scale = SCALES[stackPos] ?? 0.9;
            const opacity = OPACITIES[stackPos] ?? 0.7;
            const yOffset = stackPos * VERTICAL_OFFSET;

            // Differentiated shadows for lower cards
            const boxShadow =
              stackPos === 1
                ? "0 8px 30px rgba(0,0,0,0.12)"
                : stackPos === 2
                  ? "0 12px 40px rgba(0,0,0,0.18)"
                  : undefined;

            return (
              <motion.div
                key={idea.id}
                layout
                className="absolute top-0 left-0 right-0 rounded-2xl"
                style={{
                  zIndex: STACK_DEPTH - stackPos,
                  transformOrigin: "top center",
                  pointerEvents: isTop ? "auto" : "none",
                  boxShadow,
                }}
                initial={
                  stackPos === STACK_DEPTH - 1
                    ? { scale: 0.85, opacity: 0 }
                    : false
                }
                animate={{
                  scale,
                  y: yOffset,
                  opacity,
                }}
                exit={{ scale: 0.85, opacity: 0, transition: { duration: 0.2 } }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 26,
                }}
              >
                {isTransitioning && isTop ? (
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
    </div>
  );
}
