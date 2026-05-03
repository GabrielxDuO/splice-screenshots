export async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  if (typeof window === "undefined" || !("createImageBitmap" in window)) {
    throw new Error("createImageBitmap is not supported in this browser");
  }
  return await window.createImageBitmap(file);
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

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}
