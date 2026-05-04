<script setup lang="ts">
import { useDropZone } from "@vueuse/core";
import { ref } from "vue";
import IconUpload from "~icons/lucide/upload";

import { useAddScreenshots } from "@/composables/useAddScreenshots";
import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();
const { addFromFiles } = useAddScreenshots();

const root = ref<HTMLElement | null>(null);

const { isOverDropZone } = useDropZone(root, {
  dataTypes: types => types.some(t => t.startsWith("image/")),
  onDrop: files => addFromFiles(files),
});
</script>

<template>
  <div ref="root" class="relative flex h-full min-h-0 flex-col overflow-hidden">
    <slot />

    <Transition
      enter-active-class="transition-opacity duration-150 ease-out motion-reduce:transition-none"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-out motion-reduce:transition-none"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOverDropZone"
        class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)] backdrop-blur-sm"
      >
        <div
          class="app-animate-pop-in flex flex-col items-center gap-3 rounded-3xl bg-white/85 px-10 py-8 text-center shadow-[0_24px_60px_-20px_rgba(10,132,255,0.45)] ring-1 ring-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] dark:bg-neutral-900/85 dark:ring-[color-mix(in_srgb,var(--color-accent)_55%,transparent)]"
        >
          <span
            class="grid size-12 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)] text-accent"
          >
            <IconUpload class="size-6" />
          </span>
          <p class="text-[15px] font-semibold tracking-tight">
            {{ t("drop_overlay_title") }}
          </p>
          <p class="text-[13px] text-neutral-500 dark:text-neutral-400">
            {{ t("drop_overlay_hint") }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
