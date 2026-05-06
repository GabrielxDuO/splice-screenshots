import type { PersistManifestV1 } from "@/utils/screenshotsIdb";
import { createGlobalState, useDebounceFn } from "@vueuse/core";
import { computed, ref } from "vue";

import { imageBitmapToJpegBlob, loadImageBitmap } from "@/utils/image";
import {
  screenshotsIdbClear,
  screenshotsIdbLoad,
  screenshotsIdbSave,
  screenshotsIdbSupported,
} from "@/utils/screenshotsIdb";

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

const DEFAULT_TOP_RATIO = 0.85;
const DEFAULT_BOTTOM_RATIO = 1;

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useScreenshotsStore = createGlobalState(() => {
  const items = ref<ScreenshotItem[]>([]);
  const topRatio = ref(DEFAULT_TOP_RATIO);
  const bottomRatio = ref(DEFAULT_BOTTOM_RATIO);
  const workspaceReady = ref(typeof indexedDB === "undefined");
  const blobSourceById = new Map<string, Blob>();

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

  let persistChain = Promise.resolve();

  function queuePersist() {
    if (import.meta.env.SSR || !screenshotsIdbSupported() || !workspaceReady.value)
      return;
    persistChain = persistChain
      .then(() => persistNow())
      .catch((err) => {
        console.error("[splice] persist failed", err);
      });
  }

  const queuePersistRatiosDebounced = useDebounceFn(queuePersist, 550);

  async function persistNow(): Promise<void> {
    const manifest: PersistManifestV1 = {
      v: 1,
      order: items.value.map(i => i.id),
      topRatio: topRatio.value,
      bottomRatio: bottomRatio.value,
      items: Object.fromEntries(
        items.value.map(i => [
          i.id,
          {
            useLocalRatio: i.useLocalRatio,
            localTopRatio: i.localTopRatio,
            localBottomRatio: i.localBottomRatio,
          },
        ]),
      ),
    };
    const blobs = new Map<string, Blob>();
    for (const item of items.value) {
      let b = blobSourceById.get(item.id);
      if (!b)
        b = await imageBitmapToJpegBlob(item.image);
      blobs.set(item.id, b);
    }
    await screenshotsIdbSave(manifest, blobs);
  }

  async function restoreFromIndexedDb(): Promise<void> {
    if (import.meta.env.SSR)
      return;
    if (!screenshotsIdbSupported()) {
      workspaceReady.value = true;
      return;
    }
    try {
      const { manifest, blobs } = await screenshotsIdbLoad();
      if (!manifest || manifest.v !== 1 || manifest.order.length === 0) {
        workspaceReady.value = true;
        return;
      }
      blobSourceById.clear();
      topRatio.value = clamp01(manifest.topRatio);
      bottomRatio.value = clamp01(manifest.bottomRatio);
      const next: ScreenshotItem[] = [];
      for (const id of manifest.order) {
        const blob = blobs.get(id);
        const meta = manifest.items[id];
        if (!blob || !meta)
          continue;
        blobSourceById.set(id, blob);
        try {
          const image = await loadImageBitmap(blob);
          next.push({
            id,
            image,
            width: image.width,
            height: image.height,
            useLocalRatio: meta.useLocalRatio,
            localTopRatio: clamp01(meta.localTopRatio),
            localBottomRatio: clamp01(meta.localBottomRatio),
          });
        }
        catch (e) {
          console.error("[splice] restore image", id, e);
        }
      }
      items.value = next;
    }
    catch (e) {
      console.error("[splice] restore", e);
    }
    finally {
      workspaceReady.value = true;
    }
  }

  function addImage(image: ImageBitmap, sourceBlob?: Blob | null) {
    const id = uid();
    items.value.push({
      id,
      image,
      width: image.width,
      height: image.height,
      useLocalRatio: false,
      localTopRatio: topRatio.value,
      localBottomRatio: bottomRatio.value,
    });
    if (sourceBlob)
      blobSourceById.set(id, sourceBlob);
    queuePersist();
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
    blobSourceById.delete(id);
    queuePersist();
  }

  function moveUp(id: string) {
    const i = indexOf(id);
    if (i <= 0)
      return;
    const [it] = items.value.splice(i, 1);
    items.value.splice(i - 1, 0, it);
    queuePersist();
  }

  function moveDown(id: string) {
    const i = indexOf(id);
    if (i === -1 || i >= items.value.length - 1)
      return;
    const [it] = items.value.splice(i, 1);
    items.value.splice(i + 1, 0, it);
    queuePersist();
  }

  function clearAll() {
    for (const item of items.value)
      item.image.close?.();
    items.value = [];
    topRatio.value = DEFAULT_TOP_RATIO;
    bottomRatio.value = DEFAULT_BOTTOM_RATIO;
    blobSourceById.clear();
    persistChain = persistChain
      .then(() => screenshotsIdbClear())
      .catch(e => console.error("[splice] idb clear", e));
  }

  function setGlobalTop(value: number) {
    topRatio.value = clamp01(value);
    queuePersistRatiosDebounced();
  }

  function setGlobalBottom(value: number) {
    bottomRatio.value = clamp01(value);
    queuePersistRatiosDebounced();
  }

  function setLocalTop(id: string, value: number) {
    const it = items.value[indexOf(id)];
    if (!it)
      return;
    it.localTopRatio = clamp01(value);
    queuePersistRatiosDebounced();
  }

  function setLocalBottom(id: string, value: number) {
    const it = items.value[indexOf(id)];
    if (!it)
      return;
    it.localBottomRatio = clamp01(value);
    queuePersistRatiosDebounced();
  }

  function toggleLocalRatio(id: string) {
    const it = items.value[indexOf(id)];
    if (!it)
      return;
    it.useLocalRatio = !it.useLocalRatio;
    it.localTopRatio = topRatio.value;
    it.localBottomRatio = bottomRatio.value;
    queuePersistRatiosDebounced();
  }

  return {
    items,
    topRatio,
    bottomRatio,
    snapshots,
    workspaceReady,
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
    restoreFromIndexedDb,
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
