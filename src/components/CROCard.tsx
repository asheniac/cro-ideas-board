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

const SWIPE_THRESHOLD = 120;
const SWIPE_VELOCITY = 500;

export default function CROCard({ idea, onLike, onDislike, disabled = false }: CROCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [decided, setDecided] = useState<"like" | "dislike" | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20]);
  const cardOpacity = useTransform(x, [-300, -150, 0, 150, 300], [0.6, 1, 1, 1, 0.6]);
  const likeStampOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeStampOpacity = useTransform(x, [-80, 0], [1, 0]);

  const isInteractive = !disabled && !decided;

  const handleDragStart = useCallback(() => {
    document.body.classList.add("overflow-hidden");
  }, []);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) => {
      document.body.classList.remove("overflow-hidden");
      if (!isInteractive) return;

      const flewRight = info.offset.x > SWIPE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY;
      const flewLeft = info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY;

      if (flewRight) {
        navigator.vibrate?.(10);
        setDecided("like");
      } else if (flewLeft) {
        navigator.vibrate?.(10);
        setDecided("dislike");
      } else {
        animate(x, 0, { type: "spring", stiffness: 300, damping: 28 });
      }
    },
    [isInteractive, x]
  );

  const handleLike = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation();
    setDecided("like");
  };

  const handleDislike = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation();
    setDecided("dislike");
  };

  const actionButtons =
    typeof document !== "undefined"
      ? createPortal(
          <div className="fixed top-1/2 left-0 right-0 z-40 flex justify-between px-8 pointer-events-none -translate-y-1/2">
            {/* Dislike — left side */}
            <motion.button
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleDislike}
              disabled={!isInteractive}
              className="w-12 h-12 rounded-full glass flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Dismiss"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </motion.button>

            {/* Like — right side */}
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleLike}
              disabled={!isInteractive}
              className="w-12 h-12 rounded-full glass flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Save"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </motion.button>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <motion.div
        className="relative w-full max-w-sm mx-auto"
        drag={isInteractive ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onAnimationComplete={() => {
          if (decided === "like") onLike(idea.id);
          else if (decided === "dislike") onDislike(idea.id);
        }}
        animate={
          decided === "like"
            ? { x: 600, opacity: 0, rotate: 15 }
            : decided === "dislike"
            ? { x: -600, opacity: 0, rotate: -15 }
            : {}
        }
        transition={decided ? { duration: 0.35, ease: [0.32, 0.72, 0, 1] } : { type: "spring", stiffness: 260, damping: 26 }}
        style={{ x: decided ? undefined : x, rotate: decided ? undefined : rotate, opacity: decided ? undefined : cardOpacity }}
      >
        {/* LIKE stamp */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          style={{ opacity: decided ? undefined : likeStampOpacity }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-3xl" />
            <span className="relative text-5xl font-black text-emerald-500 border-[3px] border-emerald-500 rounded-2xl px-6 py-2 rotate-[12deg] tracking-wider">
              SAVE
            </span>
          </div>
        </motion.div>

        {/* NOPE stamp */}
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
          style={{ opacity: decided ? undefined : nopeStampOpacity }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-3xl" />
            <span className="relative text-5xl font-black text-red-500 border-[3px] border-red-500 rounded-2xl px-6 py-2 -rotate-[12deg] tracking-wider">
              PASS
            </span>
          </div>
        </motion.div>

        {/* Card body */}
        <div className="glass rounded-3xl overflow-hidden">
          {/* Mockup Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <MockupImage src={idea.mockupUrl} alt={idea.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[var(--accent-soft)] text-[var(--accent)] dark:bg-emerald-900/40">
                {idea.category.name}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2 tracking-tight leading-tight">
              {idea.title}
            </h2>
            <p className="text-[var(--muted)] text-sm leading-relaxed">
              {idea.description}
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
              onClick={() => setExpanded(!expanded)}
              className="mt-4 text-sm font-medium text-[var(--accent)] hover:underline"
            >
              {expanded ? "Show less" : "Show details"}
            </button>
          </div>
        </div>
      </motion.div>

      {actionButtons}
    </>
  );
}