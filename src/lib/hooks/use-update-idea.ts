"use client";

import { useState, useCallback } from "react";

interface UseUpdateIdeaResult {
  updateStatus: (id: number, status: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to update a CRO idea's status (like/dislike/pending).
 *
 * Calls PATCH /api/ideas/[id] with the new status.
 * Throws on non-ok responses so callers can handle errors.
 *
 * @returns { updateStatus, loading, error }
 */
export function useUpdateIdea(): UseUpdateIdeaResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (id: number, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message =
          (body as { error?: string }).error ||
          `Failed to update idea (status ${res.status})`;
        throw new Error(message);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error updating idea";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateStatus, loading, error };
}
