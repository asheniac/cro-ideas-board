/**
 * CRO Idea Generator Module
 *
 * Generates 3-5 structured CRO ideas for Samsung AU using an LLM client.
 * Works with Claude (Anthropic), GPT-4o (OpenAI), or a mock client for testing.
 *
 * Usage:
 *   import { generateCROIdeas } from "@/lib/research/generator";
 *   const ideas = await generateCROIdeas({ count: 4 });
 */

import { buildSystemPrompt, buildUserPrompt } from "./prompts";
import { LLMClient, createMockLLMClient, ChatMessage } from "./mock-llm";
import { CRO_CATEGORIES } from "./knowledge-base";
import { withRetry } from "@/lib/utils/retry";
import { checkTitleSimilarity } from "../utils/dedup";

// ─── Types ──────────────────────────────────────────────────────────────

export interface GeneratedCROIdea {
  title: string;
  description: string;
  reason: string;
  purpose: string;
  category: string; // category slug
  mockupPrompt: string;
}

export interface GenerateOptions {
  /** Number of ideas to generate (3-5, default 4) */
  count?: number;
  /** LLM client instance (uses mock if not provided) */
  llmClient?: LLMClient;
  /** Existing idea titles from recent batches (used for dedup in prompt + post-generation filtering) */
  existingTitles?: string[];
}

// ─── Validation ─────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set(CRO_CATEGORIES.map((c) => c.slug));

function isValidIdea(obj: unknown): obj is GeneratedCROIdea {
  if (!obj || typeof obj !== "object") return false;
  const idea = obj as Record<string, unknown>;
  return (
    typeof idea.title === "string" && idea.title.length > 0 &&
    typeof idea.description === "string" && idea.description.length > 0 &&
    typeof idea.reason === "string" && idea.reason.length > 0 &&
    typeof idea.purpose === "string" && idea.purpose.length > 0 &&
    typeof idea.category === "string" && VALID_CATEGORIES.has(idea.category) &&
    typeof idea.mockupPrompt === "string" && idea.mockupPrompt.length > 0
  );
}

function validateAndCleanIdeas(raw: unknown[]): GeneratedCROIdea[] {
  const valid: GeneratedCROIdea[] = [];

  for (const item of raw) {
    if (isValidIdea(item)) {
      valid.push(item);
    } else {
      console.warn("[Generator] Skipping invalid idea:", JSON.stringify(item).slice(0, 200));
    }
  }

  return valid;
}

// ─── Real LLM Clients ───────────────────────────────────────────────────

/**
 * OpenAI (GPT-4o) client using direct fetch.
 */
function createOpenAIClient(): LLMClient {
  return {
    async chat(messages: ChatMessage[]): Promise<string> {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is not set");
      }

      return withRetry(async () => {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            temperature: 0.8,
            max_tokens: 4096,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`OpenAI API error (${response.status}): ${err}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";
      });
    },
  };
}

/**
 * Anthropic (Claude) client using direct fetch.
 */
function createAnthropicClient(): LLMClient {
  return {
    async chat(messages: ChatMessage[]): Promise<string> {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY environment variable is not set");
      }

      // Extract system message if present (Anthropic has a separate system param)
      const systemMsg = messages.find((m) => m.role === "system");
      const chatMessages = messages.filter((m) => m.role !== "system");

      return withRetry(async () => {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            temperature: 0.8,
            system: systemMsg?.content || "",
            messages: chatMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Anthropic API error (${response.status}): ${err}`);
        }

        const data = await response.json();
        return data.content?.[0]?.text || "";
      });
    },
  };
}

// ─── LLM Client Resolution ──────────────────────────────────────────────

function resolveLLMClient(providedClient?: LLMClient): LLMClient {
  if (providedClient) return providedClient;

  // Try Anthropic first, then OpenAI, then mock
  if (process.env.ANTHROPIC_API_KEY) {
    console.log("[Generator] Using Anthropic Claude (ANTHROPIC_API_KEY found)");
    return createAnthropicClient();
  }

  if (process.env.OPENAI_API_KEY) {
    console.log("[Generator] Using OpenAI GPT-4o (OPENAI_API_KEY found)");
    return createOpenAIClient();
  }

  console.log("[Generator] Using Mock LLM (no API keys configured)");
  return createMockLLMClient();
}

// ─── JSON Parsing ───────────────────────────────────────────────────────

function extractJSON(text: string): string {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  // Try to find the outermost { }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text;
}

// ─── Main Generator Function ────────────────────────────────────────────

/**
 * Generate CRO ideas for Samsung AU.
 *
 * @param options.count - Number of ideas to generate (default: 4, range: 3-5)
 * @param options.llmClient - LLM client to use (auto-detected from env vars if not provided)
 * @param options.existingTitles - Recent idea titles for dedup (injected into prompt + post-generation filtering)
 * @returns Array of generated CRO ideas
 */
export async function generateCROIdeas(
  options: GenerateOptions = {}
): Promise<GeneratedCROIdea[]> {
  const count = Math.max(3, Math.min(5, options.count ?? 4));
  const client = resolveLLMClient(options.llmClient);

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(count, options.existingTitles);

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const rawResponse = await client.chat(messages);
    const jsonString = extractJSON(rawResponse);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      console.error("[Generator] Failed to parse LLM response as JSON:", jsonString.slice(0, 500));
      return [];
    }

    const ideasArray =
      (parsed && typeof parsed === "object" && "ideas" in (parsed as Record<string, unknown>)
        ? (parsed as Record<string, unknown>).ideas
        : Array.isArray(parsed)
          ? parsed
          : []) as unknown[];

    if (!Array.isArray(ideasArray)) {
      console.error("[Generator] LLM response does not contain an ideas array");
      return [];
    }

    let validIdeas = validateAndCleanIdeas(ideasArray);
    console.log(`[Generator] Generated ${validIdeas.length}/${count} valid ideas`);

    // ── Post-generation dedup filter ──
    if (options.existingTitles && options.existingTitles.length > 0) {
      const beforeCount = validIdeas.length;
      validIdeas = validIdeas.filter((idea) => {
        const result = checkTitleSimilarity(idea.title, options.existingTitles!);
        if (result.tooSimilar) {
          console.log(
            `[Generator] Dedup rejected "${idea.title}" — too similar to "${result.similarTo}" (${((result.similarityScore ?? 0) * 100).toFixed(0)}%)`,
          );
          return false;
        }
        return true;
      });
      if (validIdeas.length < beforeCount) {
        console.log(
          `[Generator] Dedup filtered ${beforeCount - validIdeas.length} ideas, ${validIdeas.length} remaining`,
        );
      }
    }

    return validIdeas.slice(0, count);
  } catch (error) {
    console.error("[Generator] LLM call failed:", error);
    return [];
  }
}

// ─── Re-exports ─────────────────────────────────────────────────────────

export { createMockLLMClient } from "./mock-llm";
export type { LLMClient, ChatMessage } from "./mock-llm";
