<script setup lang="ts">
interface Props {
  tag?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tag: "div",
});
</script>

<template>
  <component
    :is="props.tag"
    class="app-pane-scroll min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain"
    :class="props.class"
  >
    <slot />
  </component>
</template>
