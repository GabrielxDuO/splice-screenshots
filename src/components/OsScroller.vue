<script setup lang="ts">
import { OverlayScrollbarsComponent } from "overlayscrollbars-vue";
import { computed } from "vue";
import { usePreferencesStore } from "@/composables/usePreferencesStore";

interface Props {
  tag?: string;
  class?: string;
  defer?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tag: "div",
  defer: true,
});

const { theme } = usePreferencesStore();

const options = computed(() => ({
  scrollbars: {
    theme: "os-theme-app",
    autoHide: "leave" as const,
    autoHideDelay: 600,
  },
  overflow: { x: "hidden", y: "scroll" } as const,
}));

const themeKey = computed(() => theme.value);
</script>

<template>
  <ClientOnly>
    <OverlayScrollbarsComponent
      :key="themeKey"
      :element="props.tag"
      :options="options"
      :defer="props.defer"
      :class="props.class"
    >
      <slot />
    </OverlayScrollbarsComponent>
    <template #placeholder>
      <component :is="props.tag" class="overflow-y-auto" :class="[props.class]">
        <slot />
      </component>
    </template>
  </ClientOnly>
</template>
