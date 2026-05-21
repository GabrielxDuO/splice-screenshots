import { unzip } from "fflate";

import { imageMimeFromName, isImageFile } from "@/utils/image";

const zipMimeTypes = new Set([
  "application/zip",
  "application/x-zip",
  "application/x-zip-compressed",
  "application/octet-stream",
]);

export function isZipFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(".zip")
    || (zipMimeTypes.has(file.type) && file.name.toLowerCase().endsWith(".zip"));
}

export async function expandImportableImages(files: FileList | File[]): Promise<File[]> {
  const images: File[] = [];
  for (const file of Array.from(files)) {
    if (isImageFile(file)) {
      images.push(file);
      continue;
    }
    if (isZipFile(file)) {
      try {
        images.push(...await unzipImages(file));
      }
      catch (err) {
        console.error("Failed to unzip archive", file.name, err);
      }
    }
  }
  return images;
}

async function unzipImages(file: File): Promise<File[]> {
  const entries = await unzipFile(file);
  return Object.entries(entries)
    .filter(([name]) => !name.endsWith("/") && imageMimeFromName(name) !== null)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([name, bytes]) => new File([toArrayBuffer(bytes)], name.split("/").pop() ?? name, {
      type: imageMimeFromName(name) ?? undefined,
    }));
}

async function unzipFile(file: File): Promise<Record<string, Uint8Array>> {
  const data = new Uint8Array(await file.arrayBuffer());
  return await new Promise((resolve, reject) => {
    unzip(data, (err, unzipped) => {
      if (err)
        reject(err);
      else
        resolve(unzipped);
    });
  });
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}
