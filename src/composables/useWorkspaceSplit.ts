import type { Ref } from "vue";
import { useLocalStorage, useMediaQuery } from "@vueuse/core";
import { computed, ref } from "vue";

const STORAGE_KEY = "splice-workspace-split";
const MIN_PCT = 28;
const MAX_PCT = 78;
const DEFAULT_PCT = 54;

function clampPct(n: number): number {
  return Math.min(MAX_PCT, Math.max(MIN_PCT, Math.round(n * 10) / 10));
}

function normalizeStored(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? ""));
  if (!Number.isFinite(n))
    return DEFAULT_PCT;
  return clampPct(n);
}

export function useWorkspaceSplit(workspaceRef: Ref<HTMLElement | null>) {
  const stored = useLocalStorage(STORAGE_KEY, DEFAULT_PCT);
  const dragging = ref(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const split = computed({
    get: () => normalizeStored(stored.value),
    set: (v: number) => {
      stored.value = clampPct(v);
    },
  });

  const leftPaneStyle = computed(() => {
    if (!isDesktop.value)
      return undefined;
    return { flex: `0 0 ${split.value}%` };
  });

  function onResizePointerDown(e: PointerEvent) {
    if (!isDesktop.value || e.button !== 0)
      return;
    e.preventDefault();
    dragging.value = true;

    const root = workspaceRef.value;
    if (!root) {
      dragging.value = false;
      return;
    }

    const rect = root.getBoundingClientRect();
    const width = rect.width;
    const startX = e.clientX;
    const startSplit = split.value;

    const target = e.currentTarget as HTMLElement | null;
    target?.setPointerCapture(e.pointerId);

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const next = startSplit + (dx / width) * 100;
      split.value = next;
    }

    function onUp() {
      dragging.value = false;
      try {
        target?.releasePointerCapture(e.pointerId);
      }
      catch {}
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  return {
    split,
    dragging,
    isDesktop,
    leftPaneStyle,
    onResizePointerDown,
  };
}
