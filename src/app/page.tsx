"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CROCard from "@/components/CROCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useIdeas } from "@/lib/hooks/use-ideas";
import { useUpdateIdea } from "@/lib/hooks/use-update-idea";

const STACK_DEPTH = 3;
const VERTICAL_OFFSET = 15;

/** Scale and opacity per stack position (0 = top card) */
const SCALES = [1.0, 0.95, 0.9];
const OPACITIES = [1, 0.85, 0.7];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { ideas, loading, error, refetch } = useIdeas("pending");
  const { updateStatus } = useUpdateIdea();

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const advanceCard = () => {
    setCurrentIndex((prev) => prev + 1);
    setIsTransitioning(false);
  };

  const handleLike = async (id: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    try {
      await updateStatus(id, "liked");
      advanceCard();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to like idea";
      showToast(message);
      setIsTransitioning(false);
    }
  };

  const handleDislike = async (id: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    try {
      await updateStatus(id, "disliked");
      advanceCard();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to dislike idea";
      showToast(message);
      setIsTransitioning(false);
    }
  };

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
      {/* Toast notification for errors */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm max-w-sm">
          {toast}
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

            return (
              <motion.div
                key={idea.id}
                layout
                className="absolute top-0 left-0 right-0"
                style={{
                  zIndex: STACK_DEPTH - stackPos,
                  transformOrigin: "top center",
                  pointerEvents: isTop ? "auto" : "none",
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
