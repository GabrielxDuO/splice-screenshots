<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import IconDownload from "~icons/lucide/download";
import IconImageOff from "~icons/lucide/image-off";

import PaneScroll from "@/components/PaneScroll.vue";
import AppButton from "@/components/ui/AppButton.vue";
import { useI18n } from "@/composables/useI18n";
import { useScreenshotsStore } from "@/composables/useScreenshotsStore";

import { canvasToBlob, drawJoinedScreenshot } from "@/utils/canvas";
import { downloadBlob } from "@/utils/image";

const { t } = useI18n();
const store = useScreenshotsStore();

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const downloading = ref(false);

const hasImages = computed(() => store.snapshots.value.length > 0);

const redraw = useDebounceFn(() => {
  const el = canvas.value;
  if (!el)
    return;
  drawJoinedScreenshot(el, store.snapshots.value);
}, 60);

onMounted(redraw);
watch(() => store.snapshots.value, () => redraw(), { deep: true });

async function handleDownload() {
  const el = canvas.value;
  if (!el || !hasImages.value || downloading.value)
    return;
  downloading.value = true;
  try {
    const blob = await canvasToBlob(el, "image/jpeg", 0.95);
    if (!blob)
      return;
    downloadBlob(blob, `${t("download_filename")}.jpg`);
  }
  finally {
    downloading.value = false;
  }
}
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <PaneScroll class="min-h-0 flex-1">
      <div class="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-2 pb-3">
          <h2 class="text-[15px] font-semibold tracking-tight">
            {{ t("preview_empty_title") }}
          </h2>
          <span
            v-if="hasImages"
            class="text-[12px] text-neutral-500 dark:text-neutral-400"
          >
            {{ store.snapshots.value.length }}
          </span>
        </div>

        <div
          class="relative overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/6 transition-shadow duration-200 ease-out dark:bg-neutral-900 dark:ring-white/6"
        >
          <canvas
            v-show="hasImages"
            ref="canvas"
            class="block w-full"
          />

          <Transition
            enter-active-class="transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none"
            enter-from-class="opacity-0 translate-y-2"
            leave-active-class="transition-opacity duration-150 ease-out motion-reduce:transition-none"
            leave-to-class="opacity-0"
          >
            <div
              v-if="!hasImages"
              class="flex aspect-16/10 flex-col items-center justify-center gap-3 text-center"
            >
              <span
                class="grid size-12 place-items-center rounded-2xl bg-black/4 text-neutral-400 dark:bg-white/4"
              >
                <IconImageOff class="size-6" />
              </span>
              <p class="px-6 text-[13px] text-neutral-500 dark:text-neutral-400">
                {{ t("preview_empty_hint") }}
              </p>
            </div>
          </Transition>
        </div>

        <div class="hidden pt-4 md:block">
          <div class="mx-auto w-full max-w-sm">
            <AppButton
              variant="primary"
              size="lg"
              block
              :disabled="!hasImages || downloading"
              @click="handleDownload"
            >
              <IconDownload />
              <span>{{ t("download") }}</span>
            </AppButton>
          </div>
        </div>
      </div>
    </PaneScroll>

    <div
      class="border-t border-black/6 bg-white/80 px-4 py-3 backdrop-blur-xl md:hidden dark:border-white/6 dark:bg-neutral-950/80"
      style="padding-bottom: calc(env(safe-area-inset-bottom) + 12px);"
    >
      <AppButton
        variant="primary"
        size="lg"
        block
        :disabled="!hasImages || downloading"
        @click="handleDownload"
      >
        <IconDownload />
        <span>{{ t("download") }}</span>
      </AppButton>
    </div>
  </section>
</template>
