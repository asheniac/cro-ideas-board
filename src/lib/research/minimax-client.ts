/**
 * MiniMax Image Generation API Client
 *
 * Calls the MiniMax image generation API to create mockup images
 * from CRO idea prompts. Used to generate visual mockups for each CRO idea.
 *
 * API docs: https://www.minimaxi.com/document/api/image-generation
 */

import { withRetry } from "@/lib/utils/retry";

// ─── Types ────────────────────────────────────────────────────────────────

/** Supported aspect ratios for generated images */
export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface MiniMaxImageOptions {
  /** The image generation prompt — describe what the mockup should look like */
  prompt: string;
  /** Aspect ratio (default: "16:9" for desktop mockups) */
  aspectRatio?: AspectRatio;
  /** What to avoid in the generated image */
  negativePrompt?: string;
  /** Number of images to generate (default: 1) */
  numImages?: number;
  /** MiniMax model to use (default: "image-01") */
  model?: string;
}

export interface MiniMaxImageResult {
  /** URL or data URI of the generated image */
  url: string;
  /** Whether the URL is a base64 data URI (vs a remote URL) */
  isDataUri?: boolean;
  /** The prompt used to generate this image */
  prompt: string;
  /** When this image expires (if expiry info is available) */
  expiresAt?: string;
}

// ─── API Configuration ───────────────────────────────────────────────────

const MINIMAX_API_BASE = "https://api.minimax.io/v1";
const DEFAULT_MODEL = "image-01";
const DEFAULT_ASPECT_RATIO: AspectRatio = "16:9";

/**
 * Standard negative prompt for UI/e-commerce mockups.
 * Prevents common image generation issues when creating website mockups.
 */
const UI_MOCKUP_NEGATIVE_PROMPT = [
  "photorealistic people",
  "real human faces",
  "photographs",
  "blurry text",
  "distorted text",
  "illegible writing",
  "cluttered layout",
  "watermarks",
  "signatures",
  "3D renders (use flat UI design)",
  "sketches",
  "hand-drawn elements",
  "pixelated",
  "low resolution",
  "grainy",
].join(", ");

// ─── Error Types ─────────────────────────────────────────────────────────

export class MiniMaxAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public apiErrorCode?: string,
  ) {
    super(message);
    this.name = "MiniMaxAPIError";
  }
}

export class MiniMaxAuthError extends MiniMaxAPIError {
  constructor() {
    super(
      "MiniMax API authentication failed. Check your MINIMAX_API_KEY environment variable.",
      401,
      "auth_error",
    );
    this.name = "MiniMaxAuthError";
  }
}

export class MiniMaxRateLimitError extends MiniMaxAPIError {
  constructor() {
    super(
      "MiniMax API rate limit exceeded. Please wait before retrying.",
      429,
      "rate_limit",
    );
    this.name = "MiniMaxRateLimitError";
  }
}

// ─── API Call ─────────────────────────────────────────────────────────────

interface MiniMaxImageResponse {
  code?: number;
  msg?: string;
  data?: {
    image_urls?: string[];
    image_base64?: string[];
  };
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
}

/**
 * Call the MiniMax image generation API.
 *
 * @example
 * ```ts
 * const result = await generateImage({
 *   prompt: "Samsung AU Galaxy phone product buy page mockup showing...",
 *   aspectRatio: "16:9",
 * });
 * console.log(result.url);
 * ```
 */
export async function generateImage(
  options: MiniMaxImageOptions,
): Promise<MiniMaxImageResult> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MINIMAX_API_KEY environment variable is not set. " +
      "Get an API key from https://platform.minimaxi.com and set it in your .env file.",
    );
  }

  const {
    prompt,
    aspectRatio = DEFAULT_ASPECT_RATIO,
    negativePrompt = UI_MOCKUP_NEGATIVE_PROMPT,
    model = DEFAULT_MODEL,
  } = options;

  const body: Record<string, unknown> = {
    model,
    prompt,
    aspect_ratio: aspectRatio,
  };

  // Only include negative_prompt if provided (MiniMax may error on empty string)
  if (negativePrompt) {
    body.negative_prompt = negativePrompt;
  }

  const result = await withRetry(async (): Promise<MiniMaxImageResult> => {
    let response: Response;
    try {
      response = await fetch(`${MINIMAX_API_BASE}/image_generation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        // MiniMax image generation can take 10-30 seconds
        signal: AbortSignal.timeout(60_000),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new MiniMaxAPIError(
          "MiniMax image generation timed out after 60 seconds. The prompt may be too complex or the API is under heavy load.",
        );
      }
      throw new MiniMaxAPIError(
        `Failed to connect to MiniMax API: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const raw = await response.text();
    let data: MiniMaxImageResponse;

    try {
      data = JSON.parse(raw);
    } catch {
      throw new MiniMaxAPIError(
        `MiniMax API returned non-JSON response (${response.status}): ${raw.slice(0, 300)}`,
        response.status,
      );
    }

    // Handle errors
    if (!response.ok) {
      const statusCode = response.status;

      if (statusCode === 401 || statusCode === 403) {
        throw new MiniMaxAuthError();
      }
      if (statusCode === 429) {
        throw new MiniMaxRateLimitError();
      }

      const errorMsg =
        data.msg || data.base_resp?.status_msg || `HTTP ${statusCode}`;
      throw new MiniMaxAPIError(
        `MiniMax API error: ${errorMsg}`,
        statusCode,
        String(data.code ?? ""),
      );
    }

    // Check response structure
    if (data.code && data.code !== 0) {
      throw new MiniMaxAPIError(
        `MiniMax API returned error code ${data.code}: ${data.msg || "Unknown error"}`,
        response.status,
        String(data.code),
      );
    }

    const imageUrls = data.data?.image_urls;
    const imageBase64 = data.data?.image_base64;

    // Prefer URL field; fall back to base64 decoding
    let finalUrl: string;
    if (imageUrls && imageUrls.length > 0) {
      finalUrl = imageUrls[0];
    } else if (imageBase64 && imageBase64.length > 0) {
      // base64 doesn't need download — it's already the image data
      // Return a data URI so it can be used directly
      finalUrl = `data:image/png;base64,${imageBase64[0]}`;
    } else {
      throw new MiniMaxAPIError(
        "MiniMax API returned a successful response but no image URLs or base64 data were found.",
      );
    }

    return {
      url: finalUrl,
      prompt,
    };
  });

  return result;
}

/**
 * Generate multiple image variants for a single prompt.
 * Useful for generating options to choose from.
 */
export async function generateImages(
  options: MiniMaxImageOptions,
): Promise<MiniMaxImageResult[]> {
  const numImages = options.numImages ?? 2;
  const results: MiniMaxImageResult[] = [];

  for (let i = 0; i < numImages; i++) {
    try {
      const r = await generateImage({ ...options, numImages: undefined });
      results.push(r);
    } catch {
      // Silently skip failed variants — partial results are still useful
    }
  }

  return results;
}

/**
 * Build a complete image generation prompt from a CRO idea mockupPrompt,
 * appending standard UI/website mockup style guidance.
 *
 * Generates a React component / Figma-style UI mockup — clean, professional,
 * like a product design wireframe showing the actual UI element described.
 */
export function buildMockupPrompt(basePrompt: string): string {
  const styleGuidance = [
    "React component UI mockup",
    "Clean Figma-style product design",
    "Professional e-commerce UI wireframe",
    "Samsung brand aesthetic with blue accent (#2189FF)",
    "Mobile-first responsive layout",
    "Flat design with subtle shadows",
    "High-fidelity prototype screenshot",
    "No photography, no real people",
    "UI component layout, not illustration",
  ].join(", ");

  return `${basePrompt}. Style: ${styleGuidance}. Aspect ratio 9:16 for mobile mockup.`;
}

// ─── Re-exports ───────────────────────────────────────────────────────────

export { UI_MOCKUP_NEGATIVE_PROMPT, DEFAULT_ASPECT_RATIO, DEFAULT_MODEL };
