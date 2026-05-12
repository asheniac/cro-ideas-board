"use client";

import { useState, useEffect, useCallback } from "react";
import type { CROIdea } from "@/lib/types";

interface UseIdeasResult {
  ideas: CROIdea[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch CRO ideas from the API filtered by status.
 *
 * @param status - Status to filter by ("pending", "liked", "disliked")
 * @returns { ideas, loading, error, refetch }
 */
export function useIdeas(status: string): UseIdeasResult {
  const [ideas, setIdeas] = useState<CROIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/ideas?status=${status}`);
      if (!res.ok) throw new Error("Failed to fetch ideas");
      const data = await res.json();
      setIdeas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ideas");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  return { ideas, loading, error, refetch: fetchIdeas };
}
