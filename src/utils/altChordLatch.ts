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

export function consumeAltChordToggle(): boolean {
  if (suppressUntilAltRelease)
    return false;
  suppressUntilAltRelease = true;
  return true;
}
