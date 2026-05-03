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
  <button
    type="button"
    class="group relative z-10 hidden w-6 shrink-0 cursor-col-resize touch-none flex-col items-center justify-center border-0 bg-transparent p-0 outline-none md:flex"
    :aria-label="t('workspace_resize_handle')"
    :title="t('workspace_resize_hint')"
    @pointerdown="$emit('pointerdown', $event)"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/6 dark:bg-white/6"
    />
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-[28px] -translate-x-1/2"
    />
    <span
      class="relative rounded-full bg-black/5 p-1.5 ring-1 ring-black/4 transition-[background-color,color,box-shadow] duration-150 ease-out dark:bg-white/6 dark:ring-white/4"
      :class="[
        dragging
          ? 'shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-[rgba(10,132,255,0.35)] dark:bg-neutral-700 dark:shadow-none dark:ring-[rgba(64,156,255,0.38)]'
          : 'shadow-[0_1px_2px_rgba(0,0,0,0.04)] group-hover:bg-black/[0.07] dark:group-hover:bg-white/9',
      ]"
    >
      <IconGripVertical
        class="size-4 transition-colors duration-150 ease-out"
        :class="dragging
          ? 'text-accent'
          : 'text-neutral-500 group-hover:text-neutral-800 dark:text-neutral-400 dark:group-hover:text-neutral-100'"
      />
    </span>
  </button>
</template>
