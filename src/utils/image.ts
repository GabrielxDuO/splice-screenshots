export async function loadImageBitmap(source: Blob): Promise<ImageBitmap> {
  if (typeof window === "undefined" || !("createImageBitmap" in window)) {
    throw new Error("createImageBitmap is not supported in this browser");
  }
  return await window.createImageBitmap(source);
}

export async function imageBitmapToJpegBlob(
  bitmap: ImageBitmap,
  quality = 0.92,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx)
    throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(bitmap, 0, 0);
  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob)
    throw new Error("canvas.toBlob failed");
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareImageBlob(blob: Blob, filename: string): Promise<boolean> {
  if (!navigator.share || !navigator.canShare || typeof File === "undefined")
    return false;

  const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
  if (!navigator.canShare({ files: [file] }))
    return false;

  try {
    await navigator.share({ files: [file] });
    return true;
  }
  catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      return true;
    return false;
  }
}

export function isIOSBrowser(): boolean {
  const platform = navigator.platform;
  return /iPad|iPhone|iPod/.test(platform)
    || (platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || imageMimeFromName(file.name) !== null;
}

const imageMimeByExtension: Record<string, string> = {
  avif: "image/avif",
  bmp: "image/bmp",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

export function imageMimeFromName(name: string): string | null {
  const extension = name.split(".").pop()?.toLowerCase();
  if (!extension)
    return null;
  return imageMimeByExtension[extension] ?? null;
}
