let suppressUntilAltRelease = false;

function isAltRelease(e: KeyboardEvent): boolean {
  return e.key === "Alt" || e.code === "AltLeft" || e.code === "AltRight";
}

if (typeof window !== "undefined") {
  window.addEventListener(
    "keyup",
    (e: KeyboardEvent) => {
      if (isAltRelease(e))
        suppressUntilAltRelease = false;
    },
    { passive: true },
  );
}

/** 若本次 Alt 和弦尚未用过则返回 true，并占用直至松开 Alt */
export function consumeAltChordToggle(): boolean {
  if (suppressUntilAltRelease)
    return false;
  suppressUntilAltRelease = true;
  return true;
}
