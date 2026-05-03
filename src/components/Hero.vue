<script setup lang="ts">
import { computed } from "vue";
import IconDownload from "~icons/lucide/download";
import IconImagePlus from "~icons/lucide/image-plus";
import IconMoveVertical from "~icons/lucide/move-vertical";
import IconUpload from "~icons/lucide/upload";

import AppButton from "@/components/ui/AppButton.vue";
import { useAddScreenshots } from "@/composables/useAddScreenshots";

import { useI18n } from "@/composables/useI18n";

const { t } = useI18n();
const { pick } = useAddScreenshots();

const steps = computed(() => [
  { icon: IconImagePlus, text: t("step_add") },
  { icon: IconMoveVertical, text: t("step_drag") },
  { icon: IconDownload, text: t("step_download") },
]);
</script>

<template>
  <div class="flex h-full w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
    <div class="w-full max-w-[2200px]">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch lg:gap-12">
        <div class="flex min-h-0 flex-col justify-center">
          <div
            class="relative flex min-h-[min(52vh,420px)] w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-white/60 ring-1 ring-black/6 backdrop-blur-md dark:bg-white/4 dark:ring-white/6 lg:min-h-[min(60vh,520px)]"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none absolute inset-3 rounded-2xl border border-dashed border-black/10 dark:border-white/10"
            />
            <div class="flex max-w-md flex-col items-center gap-3 px-6">
              <span
                class="grid size-14 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-accent"
              >
                <IconUpload class="size-7" />
              </span>
              <p class="text-center text-[15px] font-medium tracking-tight">
                {{ t("empty_title") }}
              </p>
              <p class="text-center text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                {{ t("empty_subtitle") }}
              </p>
            </div>
          </div>

          <AppButton class="mt-6 w-full" variant="primary" size="lg" block @click="pick()">
            <IconImagePlus />
            <span>{{ t("add") }}</span>
          </AppButton>
        </div>

        <ul class="flex flex-col justify-center space-y-2 lg:py-4">
          <li
            v-for="(step, i) in steps"
            :key="i"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-neutral-600 dark:text-neutral-300"
          >
            <span
              class="grid size-6 shrink-0 place-items-center rounded-full bg-black/5 text-[11px] font-semibold tabular-nums text-neutral-700 dark:bg-white/6 dark:text-neutral-200"
            >
              {{ i + 1 }}
            </span>
            <component :is="step.icon" class="size-4 shrink-0 text-neutral-400" />
            <span>{{ step.text }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
