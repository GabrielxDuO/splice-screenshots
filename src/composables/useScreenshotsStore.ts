import { createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";

export interface ScreenshotItem {
  id: string;
  image: ImageBitmap;
  width: number;
  height: number;
  useLocalRatio: boolean;
  localTopRatio: number;
  localBottomRatio: number;
}

export interface JoinedSnapshot {
  id: string;
  image: ImageBitmap;
  topRatio: number;
  bottomRatio: number;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useScreenshotsStore = createGlobalState(() => {
  const items = ref<ScreenshotItem[]>([]);
  const topRatio = ref(0.85);
  const bottomRatio = ref(1);

  const snapshots = computed<JoinedSnapshot[]>(() =>
    items.value.map((item, i, arr) => ({
      id: item.id,
      image: item.image,
      topRatio: i === 0
        ? 0
        : item.useLocalRatio
          ? item.localTopRatio
          : topRatio.value,
      bottomRatio: i === arr.length - 1
        ? 1
        : item.useLocalRatio
          ? item.localBottomRatio
          : bottomRatio.value,
    })),
  );

  function addImage(image: ImageBitmap) {
    items.value.push({
      id: uid(),
      image,
      width: image.width,
      height: image.height,
      useLocalRatio: false,
      localTopRatio: topRatio.value,
      localBottomRatio: bottomRatio.value,
    });
  }

  function indexOf(id: string) {
    return items.value.findIndex(it => it.id === id);
  }

  function remove(id: string) {
    const i = indexOf(id);
    if (i === -1)
      return;
    const [removed] = items.value.splice(i, 1);
    removed?.image.close?.();
  }

  function moveUp(id: string) {
    const i = indexOf(id);
    if (i <= 0)
      return;
    const [it] = items.value.splice(i, 1);
    items.value.splice(i - 1, 0, it);
  }

  function moveDown(id: string) {
    const i = indexOf(id);
    if (i === -1 || i >= items.value.length - 1)
      return;
    const [it] = items.value.splice(i, 1);
    items.value.splice(i + 1, 0, it);
  }

  function clearAll() {
    for (const item of items.value) item.image.close?.();
    items.value = [];
  }

  function setGlobalTop(value: number) {
    topRatio.value = clamp01(value);
  }

  function setGlobalBottom(value: number) {
    bottomRatio.value = clamp01(value);
  }

  function setLocalTop(id: string, value: number) {
    const it = items.value[indexOf(id)];
    if (!it)
      return;
    it.localTopRatio = clamp01(value);
  }

  function setLocalBottom(id: string, value: number) {
    const it = items.value[indexOf(id)];
    if (!it)
      return;
    it.localBottomRatio = clamp01(value);
  }

  function toggleLocalRatio(id: string) {
    const it = items.value[indexOf(id)];
    if (!it)
      return;
    it.useLocalRatio = !it.useLocalRatio;
    if (!it.useLocalRatio) {
      it.localTopRatio = topRatio.value;
      it.localBottomRatio = bottomRatio.value;
    }
  }

  return {
    items,
    topRatio,
    bottomRatio,
    snapshots,
    addImage,
    remove,
    moveUp,
    moveDown,
    clearAll,
    setGlobalTop,
    setGlobalBottom,
    setLocalTop,
    setLocalBottom,
    toggleLocalRatio,
  };
});

function clamp01(value: number): number {
  if (Number.isNaN(value))
    return 0;
  if (value < 0)
    return 0;
  if (value > 1)
    return 1;
  return value;
}
