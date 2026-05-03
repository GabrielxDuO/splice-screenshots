import type { JoinedSnapshot } from "@/composables/useScreenshotsStore";

export function drawJoinedScreenshot(
  canvas: HTMLCanvasElement,
  snapshots: JoinedSnapshot[],
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

  const minWidth = Math.min(
    ...snapshots.map(s => s.image.width).filter(w => w > 0),
  );

  interface Slice {
    image: ImageBitmap;
    sx: number;
    sy: number;
    sw: number;
    sh: number;
    dy: number;
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
    const dh = (sh / image.width) * minWidth;
    slices.push({
      image,
      sx: 0,
      sy,
      sw: image.width,
      sh,
      dy: totalHeight,
      dw: minWidth,
      dh,
    });
    totalHeight += dh;
  }

  canvas.width = Math.max(1, Math.round(minWidth));
  canvas.height = Math.max(1, Math.round(totalHeight));

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const slice of slices) {
    if (slice.sh <= 0 || slice.dh <= 0)
      continue;
    ctx.drawImage(
      slice.image,
      slice.sx,
      slice.sy,
      slice.sw,
      slice.sh,
      0,
      slice.dy,
      slice.dw,
      slice.dh,
    );
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
