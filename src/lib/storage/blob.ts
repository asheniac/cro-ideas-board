import { put } from "@vercel/blob";

/**
 * Upload an image buffer to Vercel Blob storage and return the public URL.
 *
 * Requires BLOB_READ_WRITE_TOKEN environment variable to be set.
 * Throws if the token is missing or the upload fails.
 */
export async function uploadImageToBlob(
  imageBuffer: Buffer,
  filename: string
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN environment variable is not set. " +
        "Set it in your .env file or Vercel project settings."
    );
  }

  try {
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: "image/png",
    });

    return blob.url;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown blob upload error";
    throw new Error(`Failed to upload image to Vercel Blob: ${message}`);
  }
}
