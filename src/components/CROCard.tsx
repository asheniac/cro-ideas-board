"use client";

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import MockupImage from "./MockupImage";
import type { CROIdea } from "@/lib/types";

interface CROCardProps {
  idea: CROIdea;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
  disabled?: boolean;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY = 500;

export default function CROCard({ idea, onLike, onDislike, disabled = false }: CROCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [decided, setDecided] = useState<"like" | "dislike" | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(0);

  // Rotation proportional to horizontal drag (max ±25° at ±300px)
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);

  // Opacity fades as card approaches edge
  const cardOpacity = useTransform(
    x,
    [-300, -150, 0, 150, 300],
    [0.5, 1, 1, 1, 0.5]
  );

  // Directional overlay opacities
  const likeStampOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeStampOpacity = useTransform(x, [-100, 0], [1, 0]);

  const isInteractive = !disabled && !decided;

  // Prevent page scroll while dragging horizontally
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    document.body.classList.add("overflow-hidden");
  }, []);

  const handleDragEnd = useCallback(
    (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: { offset: { x: number }; velocity: { x: number } }
    ) => {
      document.body.classList.remove("overflow-hidden");
      setIsDragging(false);
      if (!isInteractive) return;

      const flewRight =
        info.offset.x > SWIPE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY;
      const flewLeft =
        info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY;

      if (flewRight) {
        setDecided("like");
      } else if (flewLeft) {
        setDecided("dislike");
      } else {
        // Snap back to center
        animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
      }
    },
    [isInteractive, x]
  );

  const handleLike = () => {
    if (!isInteractive) return;
    setDecided("like");
  };

  const handleDislike = () => {
    if (!isInteractive) return;
    setDecided("dislike");
  };

  // Action buttons rendered via portal for fixed bottom positioning
  const actionButtons =
    typeof document !== "undefined"
      ? createPortal(
          <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-between px-6 pointer-events-none">
            {/* Dislike — left thumb */}
            <button
              onClick={handleDislike}
              disabled={!isInteractive}
              className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-2xl hover:scale-110 transition-transform hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-zinc-200 dark:disabled:hover:border-zinc-700 pointer-events-auto"
              aria-label="Dislike"
            >
              ❌
            </button>
            {/* Like — right thumb */}
            <button
              onClick={handleLike}
              disabled={!isInteractive}
              className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-2xl hover:scale-110 transition-transform hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-zinc-200 dark:disabled:hover:border-zinc-700 pointer-events-auto"
              aria-label="Like"
            >
              ❤️
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <motion.div
        className="relative w-full max-w-md mx-auto touch-pan-y"
        drag={isInteractive ? "x" : false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onAnimationComplete={() => {
          if (decided === "like") {
            onLike(idea.id);
          } else if (decided === "dislike") {
            onDislike(idea.id);
          }
        }}
        animate={
          decided === "like"
            ? { x: 800, opacity: 0, rotate: 30 }
            : decided === "dislike"
            ? { x: -800, opacity: 0, rotate: -30 }
            : {}
        }
        transition={
          decided
            ? { duration: 0.4, ease: "easeOut" }
            : { type: "spring", stiffness: 300, damping: 25 }
        }
        style={{
          x: decided ? undefined : x,
          rotate: decided ? undefined : rotate,
          opacity: decided ? undefined : cardOpacity,
        }}
      >
        {/* LIKE stamp overlay — visible when dragging right */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          style={{ opacity: decided ? undefined : likeStampOpacity }}
        >
          <span className="text-5xl font-extrabold text-green-500 border-4 border-green-500 rounded-2xl px-6 py-3 rotate-[15deg] select-none">
            LIKE
          </span>
        </motion.div>

        {/* NOPE stamp overlay — visible when dragging left */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          style={{ opacity: decided ? undefined : nopeStampOpacity }}
        >
          <span className="text-5xl font-extrabold text-red-500 border-4 border-red-500 rounded-2xl px-6 py-3 -rotate-[15deg] select-none">
            NOPE
          </span>
        </motion.div>

        {/* Card body */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Mockup Image */}
          <MockupImage src={idea.mockupUrl} alt={idea.title} />

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
      </motion.div>

      {/* Portal-rendered action buttons — fixed bottom for thumb reach */}
      {actionButtons}
    </>
  );
}
