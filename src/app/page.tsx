"use client";

import { useState } from "react";
import CROCard from "@/components/CROCard";
import { useIdeas } from "@/lib/hooks/use-ideas";
import { useUpdateIdea } from "@/lib/hooks/use-update-idea";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { ideas, loading, error, refetch } = useIdeas("pending");
  const { updateStatus } = useUpdateIdea();

  const handleLike = (id: number) => {
    updateStatus(id, "liked");
    setCurrentIndex((prev) => prev + 1);
  };

  const handleDislike = (id: number) => {
    updateStatus(id, "disliked");
    setCurrentIndex((prev) => prev + 1);
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

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-6">
      <div className="text-center mb-6">
        <p className="text-sm text-zinc-500">
          {currentIndex + 1} of {ideas.length}
        </p>
      </div>
      <CROCard
        idea={ideas[currentIndex]}
        onLike={handleLike}
        onDislike={handleDislike}
      />
    </div>
  );
}
