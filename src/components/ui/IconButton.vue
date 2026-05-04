<script setup lang="ts">
import { computed } from "vue";

interface Props {
  variant?: "ghost" | "soft";
  size?: "sm" | "md";
  disabled?: boolean;
  label: string;
  type?: "button" | "submit" | "reset";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "ghost",
  size: "md",
  disabled: false,
  type: "button",
});

defineEmits<{ click: [event: MouseEvent] }>();

const classes = computed(() => {
  const base = [
    "inline-flex items-center justify-center rounded-full",
    "transition-[background-color,opacity,transform] duration-150 ease-out motion-reduce:transition-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(10,132,255,0.45)] dark:focus-visible:ring-[color:rgba(64,156,255,0.5)]",
    "active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
  ];

  const sizes = {
    sm: "size-8 [&>svg]:size-4",
    md: "size-10 [&>svg]:size-5",
  } as const;

  const variants = {
    ghost: [
      "text-neutral-700 hover:bg-black/[0.06]",
      "dark:text-neutral-200 dark:hover:bg-white/[0.08]",
    ].join(" "),
    soft: [
      "bg-black/[0.05] text-neutral-800 hover:bg-black/[0.08]",
      "dark:bg-white/[0.06] dark:text-neutral-100 dark:hover:bg-white/[0.10]",
    ].join(" "),
  } as const;

  return [...base, sizes[props.size], variants[props.variant]];
});
</script>

<template>
  <button
    :class="classes"
    :disabled="disabled"
    :aria-label="label"
    :title="label"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
