<script setup lang="ts">
import { computed } from "vue";

interface Props {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  block?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "secondary",
  size: "md",
  disabled: false,
  type: "button",
  block: false,
});

defineEmits<{ click: [event: MouseEvent] }>();

const classes = computed(() => {
  const base = [
    "inline-flex items-center justify-center gap-2",
    "font-medium tracking-tight",
    "select-none whitespace-nowrap",
    "transition-[background-color,box-shadow,opacity,color] duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(10,132,255,0.45)] dark:focus-visible:ring-[color:rgba(64,156,255,0.5)]",
    "disabled:cursor-not-allowed",
  ];

  const sizes = {
    md: "h-10 px-4 text-[14px] rounded-xl",
    lg: "h-12 px-5 text-[15px] rounded-2xl",
  } as const;

  const variants = {
    primary: [
      "bg-[color:var(--color-accent)] text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
      "[&_svg]:text-white [&_svg]:opacity-100",
      "hover:bg-[color:var(--color-accent-hover)]",
      "active:brightness-[0.96]",
      "disabled:bg-neutral-100 disabled:text-neutral-500 disabled:shadow-none",
      "disabled:ring-1 disabled:ring-inset disabled:ring-black/[0.08] dark:disabled:bg-white/[0.06] dark:disabled:text-neutral-400",
      "dark:disabled:ring-white/[0.1] disabled:[&_svg]:opacity-55",
    ].join(" "),
    secondary: [
      "bg-white text-neutral-900",
      "ring-1 ring-black/[0.08]",
      "hover:bg-neutral-50",
      "dark:bg-white/[0.08] dark:text-neutral-100 dark:ring-white/[0.06]",
      "dark:hover:bg-white/[0.12]",
      "disabled:opacity-45",
    ].join(" "),
    ghost: [
      "bg-transparent text-neutral-700",
      "hover:bg-black/[0.05]",
      "dark:text-neutral-200 dark:hover:bg-white/[0.06]",
      "disabled:opacity-45",
    ].join(" "),
  } as const;

  return [
    ...base,
    sizes[props.size],
    variants[props.variant],
    props.block && "w-full",
  ];
});
</script>

<template>
  <button :class="classes" :disabled="disabled" :type="type" @click="$emit('click', $event)">
    <slot />
  </button>
</template>
