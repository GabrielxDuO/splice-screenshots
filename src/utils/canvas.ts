import type { SplicedSnapshot } from "@/composables/useScreenshotsStore";

export function drawSplicedScreenshot(
  canvas: HTMLCanvasElement,
  snapshots: SplicedSnapshot[],
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx)
    return;

  if (snapshots.length === 0) {
    canvas.width = 16;
    canvas.height = 9;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const outputWidth = Math.max(
    ...snapshots.map(s => s.image.width).filter(w => w > 0),
  );

  interface Slice {
    image: ImageBitmap;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    dw: number;
    dh: number;
  }

  let totalHeight = 0;
  const slices: Slice[] = [];

  for (const s of snapshots) {
    const { image, topRatio, bottomRatio } = s;
    const sy = topRatio * image.height;
    const sBottom = bottomRatio * image.height;
    const sh = Math.max(0, sBottom - sy);
    const dh = (sh / image.width) * outputWidth;
    slices.push({
      image,
      sx: 0,
      sy,
      sw: image.width,
      sh,
      dw: outputWidth,
      dh,
    });
    totalHeight += dh;
  }

  canvas.width = Math.max(1, Math.round(outputWidth));
  canvas.height = Math.max(1, Math.round(totalHeight));

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const drawable = slices.filter(s => s.sh > 0 && s.dh > 0);
  let destY = 0;
  for (let i = 0; i < drawable.length; i++) {
    const slice = drawable[i]!;
    const isLast = i === drawable.length - 1;
    const destY1 = isLast ? canvas.height : Math.round(destY + slice.dh);
    const destH = Math.max(1, destY1 - destY);
    ctx.drawImage(
      slice.image,
      slice.sx,
      slice.sy,
      slice.sw,
      slice.sh,
      0,
      destY,
      slice.dw,
      destH,
    );
    destY = destY1;
  }
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.95,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(blob => resolve(blob), type, quality);
  });
}
