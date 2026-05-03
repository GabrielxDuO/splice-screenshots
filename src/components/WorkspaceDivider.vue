<script setup lang="ts">
import IconGripVertical from "~icons/lucide/grip-vertical";

import { useI18n } from "@/composables/useI18n";

defineProps<{
  dragging?: boolean;
}>();

defineEmits<{
  pointerdown: [e: PointerEvent];
}>();

const { t } = useI18n();
</script>

<template>
  <div
    class="pointer-events-none relative hidden w-0 shrink-0 self-stretch overflow-visible md:block"
  >
    <button
      type="button"
      class="group pointer-events-auto absolute inset-y-0 left-1/2 z-10 flex w-8 -translate-x-1/2 cursor-col-resize touch-none flex-col items-center justify-center border-0 bg-transparent p-0 outline-none"
      :aria-label="t('workspace_resize_handle')"
      :title="t('workspace_resize_hint')"
      @pointerdown="$emit('pointerdown', $event)"
    >
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/6 dark:bg-white/6"
      />
      <span
        class="relative rounded-full bg-black/5 p-1 ring-1 ring-black/4 transition-[background-color,box-shadow] duration-150 ease-out dark:bg-white/6 dark:ring-white/4"
        :class="[
          dragging
            ? 'shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-[rgba(10,132,255,0.35)] dark:bg-neutral-700 dark:shadow-none dark:ring-[rgba(64,156,255,0.38)]'
            : 'shadow-[0_1px_2px_rgba(0,0,0,0.04)] group-hover:bg-black/[0.07] dark:group-hover:bg-white/9',
        ]"
      >
        <IconGripVertical
          class="size-3.5 transition-colors duration-150 ease-out"
          :class="dragging
            ? 'text-accent'
            : 'text-neutral-400 group-hover:text-neutral-700 dark:text-neutral-500 dark:group-hover:text-neutral-100'"
        />
      </span>
    </button>
  </div>
</template>
