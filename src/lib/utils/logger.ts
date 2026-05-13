/**
 * Structured Logger
 *
 * JSON-formatted console logger with pipelineRunId support.
 * All log output is valid JSON for easy ingestion by log aggregators.
 *
 * Usage:
 *   import { log } from "@/lib/utils/logger";
 *   log("info", "pipeline_start", { pipelineRunId, count: 4 });
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogData {
  [key: string]: unknown;
  /** Optional pipeline run ID for correlation */
  pipelineRunId?: string;
}

// ─── Internal State ─────────────────────────────────────────────────────────

/** Server start time for uptime calculation (set on first import) */
export const SERVER_START_TIME = Date.now();

// ─── Log Implementation ─────────────────────────────────────────────────────

/**
 * Emit a structured log entry as JSON to stdout (info/debug) or stderr (warn/error).
 *
 * @param level - Severity level
 * @param event - Event name / message identifier
 * @param data - Optional structured data to include in the log entry
 *
 * @example
 * ```ts
 * log("info", "pipeline_start", { pipelineRunId, count: 4, dryRun: false });
 * log("error", "generate_error", { pipelineRunId, error: "API key missing" });
 * log("warn", "mockup_skip_no_prompt", { pipelineRunId, ideaId: 42 });
 * ```
 */
export function log(level: LogLevel, event: string, data?: LogData): void {
  const entry: Record<string, unknown> = {
    level,
    event,
    timestamp: new Date().toISOString(),
  };

  if (data) {
    // Hoist pipelineRunId to top level for easy filtering
    if (data.pipelineRunId) {
      entry.pipelineRunId = data.pipelineRunId;
    }
    // Merge remaining data
    for (const [key, value] of Object.entries(data)) {
      if (key !== "pipelineRunId") {
        entry[key] = value;
      }
    }
  }

  const json = JSON.stringify(entry);

  if (level === "error" || level === "warn") {
    // Use stderr for warnings and errors
    if (level === "error") {
      console.error(json);
    } else {
      console.warn(json);
    }
  } else {
    console.log(json);
  }
}
