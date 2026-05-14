"use client";

export default function SkeletonCard() {
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="aspect-[4/3] relative overflow-hidden">
        <div className="absolute inset-0 shimmer" />
      </div>
      <div className="p-6 space-y-3">
        <div className="h-6 w-24 rounded-full shimmer" />
        <div className="space-y-2">
          <div className="h-6 w-full rounded-xl shimmer" />
          <div className="h-6 w-2/3 rounded-xl shimmer" />
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="h-4 w-full rounded-lg shimmer" />
          <div className="h-4 w-4/5 rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
}