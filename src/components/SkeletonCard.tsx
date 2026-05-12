"use client";

export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Image area skeleton */}
      <div className="h-40 bg-zinc-100 dark:bg-zinc-800 animate-pulse">
        <div className="w-full h-full bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800" />
      </div>

      <div className="p-4 space-y-3">
        {/* Category badge skeleton */}
        <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse" />

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
