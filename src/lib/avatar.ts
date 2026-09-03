"use client";

/**
 * Turn a picked file into a small square JPEG data URL. Profile pictures live
 * in localStorage next to the account, and a phone photo pasted in whole
 * would fill the quota on its own — so it is cropped to a centred square and
 * scaled down before it is ever stored.
 */
export async function squareThumbnail(file: File, size = 256): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable");
    ctx.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size
    );
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    bitmap.close();
  }
}
