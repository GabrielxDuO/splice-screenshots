import { useFileDialog } from "@vueuse/core";
import { useScreenshotsStore } from "@/composables/useScreenshotsStore";

import { expandImportableImages } from "@/utils/archive";
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

  async function addFromFiles(files: FileList | File[] | null) {
    if (!files)
      return;
    const list = await expandImportableImages(files);
    for (const file of list) {
      try {
        const image = await loadImageBitmap(file);
        store.addImage(image, file);
      }
      catch (err) {
        console.error("Failed to load image", file.name, err);
      }
    }
  }

  return { pick: open, addFromFiles };
}
