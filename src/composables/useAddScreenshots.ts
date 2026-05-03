import { useFileDialog } from "@vueuse/core";
import { useScreenshotsStore } from "@/composables/useScreenshotsStore";

import { isImageFile, loadImageBitmap } from "@/utils/image";

export function useAddScreenshots() {
  const store = useScreenshotsStore();

  const { open, onChange, reset } = useFileDialog({
    accept: "image/*",
    multiple: true,
  });

  onChange(async (files) => {
    if (!files)
      return;
    const list = Array.from(files).filter(isImageFile);
    for (const file of list) {
      try {
        const image = await loadImageBitmap(file);
        store.addImage(image);
      }
      catch (err) {
        console.error("Failed to load image", file.name, err);
      }
    }
    reset();
  });

  async function addFromFiles(files: FileList | File[] | null) {
    if (!files)
      return;
    const list = Array.from(files).filter(isImageFile);
    for (const file of list) {
      try {
        const image = await loadImageBitmap(file);
        store.addImage(image);
      }
      catch (err) {
        console.error("Failed to load image", file.name, err);
      }
    }
  }

  return { pick: open, addFromFiles };
}
