"use client";

import { useState, useCallback } from "react";

interface UseUpdateIdeaResult {
  updateStatus: (id: number, status: string) => Promise<void>;
  loading: boolean;
}

/**
 * Hook to update a CRO idea's status (like/dislike/pending).
 *
 * Calls PATCH /api/ideas/[id] with the new status.
 *
 * @returns { updateStatus, loading }
 */
export function useUpdateIdea(): UseUpdateIdeaResult {
  const [loading, setLoading] = useState(false);

  const updateStatus = useCallback(async (id: number, status: string) => {
    setLoading(true);
    try {
      await fetch(`/api/ideas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateStatus, loading };
}
