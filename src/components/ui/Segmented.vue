<script setup lang="ts" generic="T extends string">
import type { Component } from "vue";
import { computed, nextTick, onBeforeUnmount, onBeforeUpdate, onMounted, ref, watch } from "vue";

interface Option {
  value: T;
  label?: string;
  icon?: Component;
  ariaLabel?: string;
}

interface Props {
  modelValue: T;
  options: Option[];
  animated?: boolean;
  ariaLabel?: string;
  size?: "sm" | "md";
}

const props = withDefaults(defineProps<Props>(), {
  animated: true,
  size: "md",
  ariaLabel: undefined,
});

const emit = defineEmits<{ "update:modelValue": [value: T] }>();

const rootRef = ref<HTMLElement | null>(null);
const buttonRefs = ref<HTMLElement[]>([]);
const indicatorStyle = ref({
  transform: "translateX(0px)",
  width: "0px",
});

const selectedIndex = computed(() => {
  const index = props.options.findIndex(opt => opt.value === props.modelValue);
  return index >= 0 ? index : 0;
});

let resizeObserver: ResizeObserver | undefined;

function setButtonRef(el: unknown, index: number) {
  if (typeof HTMLElement !== "undefined" && el instanceof HTMLElement)
    buttonRefs.value[index] = el;
}

function updateIndicator() {
  const root = rootRef.value;
  const button = buttonRefs.value[selectedIndex.value];

  if (!root || !button)
    return;

  const rootRect = root.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();

  indicatorStyle.value = {
    transform: `translateX(${buttonRect.left - rootRect.left}px)`,
    width: `${buttonRect.width}px`,
  };
}

function select(value: T) {
  if (value !== props.modelValue)
    emit("update:modelValue", value);
}

onBeforeUpdate(() => {
  buttonRefs.value = [];
});

onMounted(() => {
  nextTick(() => {
    updateIndicator();

    if (typeof ResizeObserver === "undefined" || !rootRef.value)
      return;

    resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(rootRef.value);
  });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

watch(
  () => [props.modelValue, props.options] as const,
  () => nextTick(updateIndicator),
  { deep: true, flush: "post" },
);
</script>

<template>
  <div
    ref="rootRef"
    role="radiogroup"
    :aria-label="ariaLabel"
    class="relative inline-flex items-center gap-0.5 rounded-full bg-black/5 p-0.5 ring-1 ring-black/4 dark:bg-white/6 dark:ring-white/4"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0.5 left-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] motion-reduce:transition-none dark:bg-neutral-700"
      :class="animated ? 'transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]' : 'transition-none'"
      :style="indicatorStyle"
    />

    <button
      v-for="(opt, index) in options"
      :key="opt.value"
      :ref="el => setButtonRef(el, index)"
      type="button"
      role="radio"
      :aria-checked="opt.value === modelValue"
      :aria-label="opt.ariaLabel ?? opt.label"
      :title="opt.ariaLabel ?? opt.label"
      class="relative z-10 inline-flex items-center justify-center gap-1.5 rounded-full active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(10,132,255,0.45)] motion-reduce:transition-none dark:focus-visible:ring-[rgba(64,156,255,0.5)] [&>svg]:size-4"
      :class="[
        size === 'sm' ? 'h-7 px-2.5 text-[12px]' : 'h-8 px-3 text-[13px]',
        animated ? 'transition-[color,transform] duration-200 ease-out' : 'transition-none',
        opt.value === modelValue
          ? 'text-neutral-900 dark:text-white'
          : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white',
      ]"
      @click="select(opt.value)"
    >
      <component :is="opt.icon" v-if="opt.icon" />
      <span v-if="opt.label">{{ opt.label }}</span>
    </button>
  </div>
</template>
