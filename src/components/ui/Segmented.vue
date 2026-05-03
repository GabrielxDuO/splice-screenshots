<script setup lang="ts" generic="T extends string">
import type { Component } from "vue";

interface Option {
  value: T;
  label?: string;
  icon?: Component;
  ariaLabel?: string;
}

interface Props {
  modelValue: T;
  options: Option[];
  ariaLabel?: string;
  size?: "sm" | "md";
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  ariaLabel: undefined,
});

const emit = defineEmits<{ "update:modelValue": [value: T] }>();

function select(value: T) {
  if (value !== props.modelValue)
    emit("update:modelValue", value);
}
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="ariaLabel"
    class="inline-flex items-center gap-0.5 rounded-full p-0.5 bg-black/5 dark:bg-white/6 ring-1 ring-black/4 dark:ring-white/4"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      role="radio"
      :aria-checked="opt.value === modelValue"
      :aria-label="opt.ariaLabel ?? opt.label"
      :title="opt.ariaLabel ?? opt.label"
      class="inline-flex items-center justify-center gap-1.5 rounded-full transition-[background-color,color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(10,132,255,0.45)] dark:focus-visible:ring-[rgba(64,156,255,0.5)] [&>svg]:size-4" :class="[
        size === 'sm' ? 'h-7 px-2.5 text-[12px]' : 'h-8 px-3 text-[13px]',
        opt.value === modelValue
          ? 'bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:bg-neutral-700 dark:text-white'
          : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white',
      ]"
      @click="select(opt.value)"
    >
      <component :is="opt.icon" v-if="opt.icon" />
      <span v-if="opt.label">{{ opt.label }}</span>
    </button>
  </div>
</template>
