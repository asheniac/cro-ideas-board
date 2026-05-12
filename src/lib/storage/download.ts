/**
 * Download an image from a URL and return it as a Buffer.
 *
 * Used to fetch images from MiniMax's temporary URLs so they can be
 * re-uploaded to Vercel Blob for persistent storage.
 */
export async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });

    if (!response.ok) {
      throw new Error(
        `Failed to download image: HTTP ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Failed to download")) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "Unknown download error";
    throw new Error(`Failed to download image from URL: ${message}`);
  }
}
