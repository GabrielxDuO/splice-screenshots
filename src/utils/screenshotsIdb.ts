export interface PersistManifestV1 {
  v: 1;
  order: string[];
  topRatio: number;
  bottomRatio: number;
  items: Record<string, {
    useLocalRatio: boolean;
    localTopRatio: number;
    localBottomRatio: number;
  }>;
}

const DB_NAME = "splice-screenshots-v1";
const DB_VERSION = 1;

function idbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("meta"))
        db.createObjectStore("meta");
      if (!db.objectStoreNames.contains("blobs"))
        db.createObjectStore("blobs");
    };
  });
}

export function screenshotsIdbSupported(): boolean {
  return idbAvailable();
}

export async function screenshotsIdbSave(
  manifest: PersistManifestV1,
  blobs: Map<string, Blob>,
): Promise<void> {
  if (!idbAvailable())
    return;
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["blobs", "meta"], "readwrite");
      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
      const blobStore = tx.objectStore("blobs");
      blobStore.clear();
      for (const [id, blob] of blobs)
        blobStore.put(blob, id);
      tx.objectStore("meta").put(manifest, "v1");
    });
  }
  finally {
    db.close();
  }
}

export async function screenshotsIdbLoad(): Promise<{
  manifest: PersistManifestV1 | null;
  blobs: Map<string, Blob>;
}> {
  const blobs = new Map<string, Blob>();
  if (!idbAvailable())
    return { manifest: null, blobs };
  const db = await openDb();
  try {
    const manifest = await new Promise<PersistManifestV1 | null>((resolve, reject) => {
      const r = db.transaction("meta").objectStore("meta").get("v1");
      r.onsuccess = () => resolve((r.result as PersistManifestV1 | undefined) ?? null);
      r.onerror = () => reject(r.error);
    });
    if (!manifest || manifest.v !== 1 || !manifest.order?.length)
      return { manifest, blobs };

    for (const id of manifest.order) {
      const blob = await new Promise<Blob | undefined>((resolve, reject) => {
        const r = db.transaction("blobs").objectStore("blobs").get(id);
        r.onsuccess = () => resolve(r.result instanceof Blob ? r.result : undefined);
        r.onerror = () => reject(r.error);
      });
      if (blob)
        blobs.set(id, blob);
    }
    return { manifest, blobs };
  }
  finally {
    db.close();
  }
}

export async function screenshotsIdbClear(): Promise<void> {
  if (!idbAvailable())
    return;
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["blobs", "meta"], "readwrite");
      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
      tx.objectStore("blobs").clear();
      tx.objectStore("meta").clear();
    });
  }
  finally {
    db.close();
  }
}
