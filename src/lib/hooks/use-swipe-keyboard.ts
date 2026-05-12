"use client";

import { useEffect } from "react";

interface SwipeKeyboardHandlers {
  onLike: () => void;
  onDislike: () => void;
}

/**
 * Listens for left/right arrow keys to trigger swipe actions.
 * Skips when focus is in an input, textarea, or select element
 * so that normal typing/editing is not interrupted.
 */
export function useSwipeKeyboard(handlers: SwipeKeyboardHandlers): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if focus is inside a form input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlers.onDislike();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handlers.onLike();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers.onLike, handlers.onDislike]);
}
