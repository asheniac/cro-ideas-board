/**
 * Retry Utility
 *
 * Generic retry wrapper with exponential backoff for external API calls.
 * Handles rate limiting (429) with Retry-After header support.
 *
 * Usage:
 *   import { withRetry } from "@/lib/utils/retry";
 *   const result = await withRetry(() => fetch("https://api.example.com"), { maxRetries: 3 });
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in milliseconds before first retry (default: 1000) */
  baseDelay?: number;
  /** Optional callback invoked before each retry */
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Check if an error indicates a rate limit (HTTP 429).
 * Handles MiniMaxRateLimitError, standard Error with status codes,
 * and Response objects directly.
 */
function isRateLimited(error: unknown): boolean {
  if (error instanceof Error) {
    // Check for MiniMaxRateLimitError by name (imported dynamically to avoid circular deps)
    if (error.name === "MiniMaxRateLimitError") return true;
    // Check error message for common 429 patterns
    if (error.message.includes("429") || error.message.includes("rate limit")) return true;
  }
  return false;
}

/**
 * Extract a Retry-After delay (in ms) from an error if available.
 * Returns null if no Retry-After can be determined.
 */
function getRetryAfterMs(error: unknown): number | null {
  if (error instanceof Error) {
    // Try to extract Retry-After from MiniMaxRateLimitError or similar
    const match = error.message.match(/Retry-After[:\s]*(\d+)/i);
    if (match) {
      return parseInt(match[1], 10) * 1000;
    }
  }
  return null;
}

/**
 * Classify whether an error is retryable.
 * Retryable: network errors, 429, 5xx server errors.
 * Non-retryable: 400, 401, 403, 404, etc.
 */
function isRetryableError(error: unknown): boolean {
  if (isRateLimited(error)) return true;

  if (error instanceof Error) {
    const msg = error.message;

    // Non-retryable status codes
    if (/\b(400|401|403|404|405|422)\b/.test(msg)) return false;

    // Retryable status codes
    if (/\b(408|429|500|502|503|504)\b/.test(msg)) return true;

    // Network errors (fetch failures, DNS, TCP, TLS)
    if (
      msg.includes("ECONNREFUSED") ||
      msg.includes("ECONNRESET") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("EPIPE") ||
      msg.includes("fetch failed") ||
      msg.includes("network") ||
      msg.includes("timeout") ||
      msg.includes("aborted")
    ) {
      return true;
    }
  }

  // Default: retry unknown errors (could be transient)
  return true;
}

/**
 * Calculate the delay before the next retry using exponential backoff.
 * Formula: baseDelay * 2^attempt, capped at 30 seconds.
 */
function calculateBackoff(attempt: number, baseDelay: number): number {
  const raw = baseDelay * Math.pow(2, attempt);
  return Math.min(raw, 30_000);
}

/**
 * Determine the delay for a retry. Checks Retry-After first,
 * then falls back to exponential backoff.
 */
function getRetryDelay(error: unknown, attempt: number, baseDelay: number): number {
  const retryAfter = getRetryAfterMs(error);
  if (retryAfter !== null) {
    return Math.min(retryAfter, 30_000);
  }
  return calculateBackoff(attempt, baseDelay);
}

// ─── Main Retry Function ────────────────────────────────────────────────────

/**
 * Execute an async function with automatic retry on failure.
 * Uses exponential backoff: 1s → 2s → 4s for default settings.
 * Respects Retry-After headers on 429 responses (especially MiniMax).
 *
 * @param fn - The async function to execute with retry
 * @param options - Retry configuration
 * @returns The result of the function
 *
 * @example
 * ```ts
 * const data = await withRetry(
 *   () => fetch("https://api.example.com/data").then(r => r.json()),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelay = options.baseDelay ?? 1000;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts
      if (attempt >= maxRetries) break;

      // Don't retry non-retryable errors
      if (!isRetryableError(error)) throw error;

      const delay = getRetryDelay(error, attempt, baseDelay);

      if (options.onRetry) {
        options.onRetry(error, attempt + 1, delay);
      }

      console.log(
        JSON.stringify({
          event: "retry",
          attempt: attempt + 1,
          maxRetries,
          delayMs: delay,
          error: error instanceof Error ? error.message.slice(0, 200) : String(error).slice(0, 200),
        }),
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
