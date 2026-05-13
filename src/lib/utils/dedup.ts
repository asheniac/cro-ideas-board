/**
 * Deduplication Utilities
 *
 * Levenshtein distance-based similarity checking to prevent near-duplicate
 * CRO ideas from being stored. Used both pre-generation (inject existing
 * titles into the prompt) and post-generation (filter out generated ideas
 * that are too similar to existing ones).
 */

// ─── Levenshtein Distance (Wagner-Fischer) ──────────────────────────────

/**
 * Compute the Levenshtein (edit) distance between two strings.
 * Uses the Wagner-Fischer algorithm with O(n*m) time and O(min(n,m)) space.
 *
 * The distance is the minimum number of single-character edits
 * (insertions, deletions, substitutions) required to change one string
 * into the other.
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;

  // Ensure `a` is the shorter string for the space-optimized version
  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  // Swap so that `a` is the shorter string
  if (aLen > bLen) {
    return levenshteinDistance(b, a);
  }

  // Single-row DP: prev row and current row
  let prevRow = Array.from({ length: aLen + 1 }, (_, i) => i);
  const currRow = new Array<number>(aLen + 1);

  for (let j = 1; j <= bLen; j++) {
    currRow[0] = j;

    for (let i = 1; i <= aLen; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[i] = Math.min(
        currRow[i - 1] + 1,       // insertion
        prevRow[i] + 1,           // deletion
        prevRow[i - 1] + cost,    // substitution
      );
    }

    // Swap rows
    const temp = prevRow;
    prevRow = currRow.slice();
    // Reuse array to avoid allocation
    for (let k = 0; k <= aLen; k++) {
      (temp as number[])[k] = prevRow[k];
    }
  }

  return prevRow[aLen];
}

// ─── Similarity Checking ────────────────────────────────────────────────

export interface SimilarityResult {
  /** Whether the new title is too similar to any existing title */
  tooSimilar: boolean;
  /** The matching existing title, if any */
  similarTo?: string;
  /** The normalized similarity score (0 = completely different, 1 = identical) */
  similarityScore?: number;
}

/**
 * Check if a new title is too similar to any existing title.
 *
 * Uses normalized Levenshtein distance: distance / max(len1, len2).
 * If the normalized distance is less than 0.2 (i.e., >80% similarity),
 * the new title is considered too similar and should be rejected.
 *
 * @param newTitle - The candidate title to check
 * @param existingTitles - Array of existing titles to compare against
 * @param threshold - Normalized distance threshold (default: 0.2, meaning >80% similarity is rejected)
 */
export function checkTitleSimilarity(
  newTitle: string,
  existingTitles: string[],
  threshold: number = 0.2,
): SimilarityResult {
  if (!existingTitles.length) {
    return { tooSimilar: false };
  }

  const normalizedNew = newTitle.toLowerCase().trim();
  if (!normalizedNew) {
    return { tooSimilar: false };
  }

  for (const existing of existingTitles) {
    const normalizedExisting = existing.toLowerCase().trim();
    if (!normalizedExisting) continue;

    const distance = levenshteinDistance(normalizedNew, normalizedExisting);
    const maxLen = Math.max(normalizedNew.length, normalizedExisting.length);
    const normalizedDistance = distance / maxLen;
    const similarity = 1 - normalizedDistance;

    if (normalizedDistance < threshold) {
      return {
        tooSimilar: true,
        similarTo: existing,
        similarityScore: similarity,
      };
    }
  }

  return { tooSimilar: false };
}

// ─── Batch Dedup ────────────────────────────────────────────────────────

/**
 * Filter an array of candidate titles, removing any that are too similar
 * to the existing titles. Returns only the unique/non-duplicate candidates.
 *
 * @param candidates - Array of candidate title strings to filter
 * @param existingTitles - Array of existing titles to compare against
 * @param threshold - Normalized distance threshold (default: 0.2)
 * @returns Array of titles that passed the dedup check
 */
export function deduplicateTitles(
  candidates: string[],
  existingTitles: string[],
  threshold: number = 0.2,
): string[] {
  return candidates.filter((title) => {
    const result = checkTitleSimilarity(title, existingTitles, threshold);
    if (result.tooSimilar) {
      console.log(
        `[Dedup] Rejected "${title}" — too similar to "${result.similarTo}" (${((result.similarityScore ?? 0) * 100).toFixed(0)}%)`,
      );
      return false;
    }
    return true;
  });
}
