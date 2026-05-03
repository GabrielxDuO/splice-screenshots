const DOUBLE_TAP_TIME = 280;
const DOUBLE_TAP_DIST = 10;

interface TapState {
  time: number;
  x: number;
  y: number;
}

const tapMap = new WeakMap<EventTarget, TapState>();

export function detectDoubleTap(event: PointerEvent): boolean {
  const target = event.target;
  if (!target)
    return false;

  const last = tapMap.get(target);
  const now = event.timeStamp;
  const x = event.clientX;
  const y = event.clientY;

  if (
    last
    && now - last.time <= DOUBLE_TAP_TIME
    && Math.hypot(x - last.x, y - last.y) <= DOUBLE_TAP_DIST
  ) {
    tapMap.delete(target);
    return true;
  }

  tapMap.set(target, { time: now, x, y });
  return false;
}
