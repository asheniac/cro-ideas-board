"use client";

import { useState } from "react";

interface MockupImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

export default function MockupImage({ src, alt, className = "" }: MockupImageProps) {
  const [hasError, setHasError] = useState(false);

  // No URL at all — show generating skeleton
  if (!src) {
    return (
      <div className={`relative w-full h-56 bg-zinc-100 dark:bg-zinc-800 ${className}`}>
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <svg
            className="w-6 h-6 text-zinc-400 dark:text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Generating mockup...
          </span>
        </div>
      </div>
    );
  }

  // Error loading the image — show fallback
  if (hasError) {
    return (
      <div className={`relative w-full h-56 bg-zinc-100 dark:bg-zinc-800 ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <svg
            className="w-8 h-8 text-zinc-400 dark:text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v.01"
            />
          </svg>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            Mockup unavailable
          </span>
        </div>
      </div>
    );
  }

  // Normal loaded state
  return (
    <div className={`relative w-full h-56 bg-zinc-100 dark:bg-zinc-800 ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
