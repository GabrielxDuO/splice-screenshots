import { useFileDialog } from "@vueuse/core";
import { useScreenshotsStore } from "@/composables/useScreenshotsStore";

import { expandImportableImages } from "@/utils/archive";
import { filesFromDataTransferItems } from "@/utils/dataTransfer";
import { loadImageBitmap } from "@/utils/image";

export function useAddScreenshots() {
  const store = useScreenshotsStore();

  const { open, onChange, reset } = useFileDialog({
    accept: "image/*,.zip,application/zip",
    multiple: true,
  });

  onChange(async (files) => {
    if (!files)
      return;
    await addFromFiles(files);
    reset();
  });

  async function addFromFiles(files: FileList | File[] | null): Promise<number> {
    if (!files)
      return 0;
    const list = await expandImportableImages(files);
    let added = 0;
    for (const file of list) {
      try {
        const image = await loadImageBitmap(file);
        store.addImage(image, file);
        added += 1;
      }
      catch (err) {
        console.error("Failed to load image", file.name, err);
      }
    }
    return added;
  }

  async function addFromDataTransferItems(items: DataTransferItemList | null): Promise<number> {
    if (!items)
      return 0;
    return await addFromFiles(await filesFromDataTransferItems(items));
  }

  return { pick: open, addFromFiles, addFromDataTransferItems };
}
