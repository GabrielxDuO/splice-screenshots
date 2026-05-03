<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { useEventListener } from "@vueuse/core";
import { computed, ref, useTemplateRef } from "vue";
import IconImagePlus from "~icons/lucide/image-plus";
import IconLayoutPanelLeft from "~icons/lucide/layout-panel-left";

import AppHeader from "@/components/AppHeader.vue";
import DropZone from "@/components/DropZone.vue";
import JoinedPreview from "@/components/JoinedPreview.vue";
import SourceList from "@/components/SourceList.vue";
import Segmented from "@/components/ui/Segmented.vue";
import WorkspaceDivider from "@/components/WorkspaceDivider.vue";
import { useI18n } from "@/composables/useI18n";
import { useWorkspaceSplit } from "@/composables/useWorkspaceSplit";

const { t, locale } = useI18n();

const workspaceRef = useTemplateRef<HTMLElement>("workspace");
const { dragging, leftPaneStyle, onResizePointerDown } = useWorkspaceSplit(workspaceRef);

useHead({
  title: () => t("app_title"),
  htmlAttrs: { lang: () => locale.value },
  meta: [
    { name: "description", content: () => t("meta_description") },
  ],
});

const mobileTab = ref<"sources" | "preview">("sources");
const tabOptions = computed(() => [
  { value: "sources" as const, icon: IconImagePlus, label: t("tab_sources") },
  { value: "preview" as const, icon: IconLayoutPanelLeft, label: t("tab_preview") },
]);

useEventListener(typeof window !== "undefined" ? window : null, "dragover", (e) => {
  e.preventDefault();
});
</script>

<template>
  <DropZone class="flex h-full min-h-screen flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <AppHeader />

    <div class="flex min-h-0 flex-1 flex-col">
      <div class="flex justify-center px-3 py-2 md:hidden">
        <Segmented v-model="mobileTab" :options="tabOptions" />
      </div>

      <div
        ref="workspace"
        class="relative flex min-h-0 min-w-0 flex-1 flex-col md:flex-row"
        :class="dragging ? 'cursor-col-resize select-none' : ''"
      >
        <div
          class="flex min-h-0 min-w-0 flex-col md:min-w-[240px]"
          :class="[
            mobileTab === 'sources' ? 'flex-1' : 'hidden md:flex',
          ]"
          :style="leftPaneStyle"
        >
          <SourceList class="h-full min-h-0 w-full min-w-0" />
        </div>

        <WorkspaceDivider :dragging="dragging" @pointerdown="onResizePointerDown" />

        <div
          class="min-h-0 min-w-0 flex flex-col md:flex-1"
          :class="[
            mobileTab === 'preview' ? 'flex flex-1' : 'hidden md:flex',
          ]"
        >
          <JoinedPreview class="h-full min-h-0 w-full min-w-0" />
        </div>
      </div>
    </div>
  </DropZone>
</template>
