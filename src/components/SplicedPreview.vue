<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { computed, onMounted, onUnmounted, shallowRef, useTemplateRef, watch } from "vue";
import IconImageOff from "~icons/lucide/image-off";
import IconSave from "~icons/lucide/save";
import IconX from "~icons/lucide/x";

import PaneScroll from "@/components/PaneScroll.vue";
import AppButton from "@/components/ui/AppButton.vue";
import { useI18n } from "@/composables/useI18n";
import { useScreenshotsStore } from "@/composables/useScreenshotsStore";

import { canvasToBlob, drawSplicedScreenshot } from "@/utils/canvas";
import { downloadBlob, isIOSBrowser, shareImageBlob } from "@/utils/image";

const { t } = useI18n();
const store = useScreenshotsStore();

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const previewUrl = shallowRef<string | null>(null);
const previewBlob = shallowRef<Blob | null>(null);
const saving = shallowRef(false);
const saveSheetOpen = shallowRef(false);

const hasImages = computed(() => store.snapshots.value.length > 0);
const filename = computed(() => `${t("save.filename")}.jpg`);

let previewGeneration = 0;

function setPreviewBlob(blob: Blob) {
  if (previewUrl.value)
    URL.revokeObjectURL(previewUrl.value);
  previewBlob.value = blob;
  previewUrl.value = URL.createObjectURL(blob);
}

function clearPreviewBlob() {
  if (previewUrl.value)
    URL.revokeObjectURL(previewUrl.value);
  previewBlob.value = null;
  previewUrl.value = null;
  saveSheetOpen.value = false;
}

async function renderPreview() {
  const el = canvas.value;
  if (!el)
    return;
  const generation = ++previewGeneration;
  drawSplicedScreenshot(el, store.snapshots.value);

  if (!hasImages.value) {
    clearPreviewBlob();
    return;
  }

  const blob = await canvasToBlob(el, "image/jpeg", 0.95);
  if (!blob || generation !== previewGeneration)
    return;
  setPreviewBlob(blob);
}

const redraw = useDebounceFn(renderPreview, 60);

onMounted(redraw);
onUnmounted(() => {
  previewGeneration++;
  clearPreviewBlob();
});
watch(() => store.snapshots.value, () => redraw(), { deep: true });

async function getPreviewBlob() {
  if (previewBlob.value)
    return previewBlob.value;
  await renderPreview();
  return previewBlob.value;
}

async function handleSave() {
  if (!hasImages.value || saving.value)
    return;
  saving.value = true;
  try {
    const blob = await getPreviewBlob();
    if (!blob)
      return;
    if (await shareImageBlob(blob, filename.value))
      return;
    if (isIOSBrowser()) {
      saveSheetOpen.value = true;
      return;
    }
    downloadBlob(blob, filename.value);
  }
  finally {
    saving.value = false;
  }
}
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <PaneScroll class="min-h-0 flex-1">
      <div class="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-2 pb-3">
          <h2 class="text-[15px] font-semibold tracking-tight">
            {{ $t("preview.empty.title") }}
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
            v-show="hasImages && !previewUrl"
            ref="canvas"
            class="block w-full"
          />
          <img
            v-if="previewUrl"
            :src="previewUrl"
            :alt="$t('actions.save')"
            class="spliced-preview-image block h-auto w-full bg-white"
            draggable="false"
          >

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
                {{ $t("preview.empty.hint") }}
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
              :disabled="!hasImages || saving"
              @click="handleSave"
            >
              <IconSave />
              <span>{{ $t("actions.save") }}</span>
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
        :disabled="!hasImages || saving"
        @click="handleSave"
      >
        <IconSave />
        <span>{{ $t("actions.save") }}</span>
      </AppButton>
    </div>

    <Transition
      enter-active-class="transition-opacity duration-200 ease-out motion-reduce:transition-none"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-out motion-reduce:transition-none"
      leave-to-class="opacity-0"
    >
      <div
        v-if="saveSheetOpen && previewUrl"
        class="fixed inset-0 z-50 bg-black/45 px-4 py-5 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('save.sheet.title')"
      >
        <div class="mx-auto flex h-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-950">
          <div class="flex items-center justify-between gap-3 border-b border-black/6 px-4 py-3 dark:border-white/8">
            <div>
              <h3 class="text-[15px] font-semibold tracking-tight">
                {{ $t("save.sheet.title") }}
              </h3>
              <p class="pt-1 text-[12px] text-neutral-500 dark:text-neutral-400">
                {{ $t("save.sheet.hint") }}
              </p>
            </div>
            <button
              type="button"
              class="grid size-9 shrink-0 place-items-center rounded-xl text-neutral-500 transition-colors hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/8 dark:hover:text-neutral-100"
              :aria-label="$t('save.sheet.close')"
              @click="saveSheetOpen = false"
            >
              <IconX class="size-5" />
            </button>
          </div>
          <div class="min-h-0 flex-1 overflow-auto bg-neutral-100 p-3 dark:bg-neutral-900">
            <img
              :src="previewUrl"
              :alt="$t('actions.save')"
              class="spliced-preview-image mx-auto block h-auto max-w-full bg-white"
              draggable="false"
            >
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.spliced-preview-image {
  -webkit-touch-callout: default;
  user-select: auto;
}
</style>
