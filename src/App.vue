<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { useEventListener } from "@vueuse/core";
import { computed, onMounted, ref, useTemplateRef } from "vue";
import IconImagePlus from "~icons/lucide/image-plus";
import IconLayoutPanelLeft from "~icons/lucide/layout-panel-left";

import AppHeader from "@/components/AppHeader.vue";
import DropZone from "@/components/DropZone.vue";
import SourceList from "@/components/SourceList.vue";
import SplicedPreview from "@/components/SplicedPreview.vue";
import Segmented from "@/components/ui/Segmented.vue";
import WorkspaceDivider from "@/components/WorkspaceDivider.vue";
import { useAddScreenshots } from "@/composables/useAddScreenshots";
import { useI18n } from "@/composables/useI18n";
import { useScreenshotsStore } from "@/composables/useScreenshotsStore";
import { useWorkspaceSplit } from "@/composables/useWorkspaceSplit";
import { hasImportableDataTransferItems } from "@/utils/dataTransfer";

const { t, locale } = useI18n();
const { addFromDataTransferItems } = useAddScreenshots();
const screenshotsStore = useScreenshotsStore();

onMounted(() => {
  void screenshotsStore.restoreFromIndexedDb();
});

const workspaceRef = useTemplateRef<HTMLElement>("workspace");
const { dragging, leftPaneStyle, onResizePointerDown, resetSplit } = useWorkspaceSplit(workspaceRef);

useHead({
  title: () => t("app.title"),
  htmlAttrs: { lang: () => locale.value },
  meta: [
    { name: "description", content: () => t("meta.description") },
  ],
});

const mobileTab = ref<"sources" | "preview">("sources");
const tabOptions = computed(() => [
  { value: "sources" as const, icon: IconImagePlus, label: t("tabs.sources") },
  { value: "preview" as const, icon: IconLayoutPanelLeft, label: t("tabs.preview") },
]);

useEventListener(typeof window !== "undefined" ? window : null, "dragover", (e) => {
  e.preventDefault();
});

useEventListener(typeof window !== "undefined" ? window : null, "paste", (e) => {
  const event = e as ClipboardEvent;
  if (!hasImportableDataTransferItems(event.clipboardData?.items ?? null))
    return;
  event.preventDefault();
  void addFromDataTransferItems(event.clipboardData?.items ?? null);
});
</script>

<template>
  <DropZone class="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
    <AppHeader />

    <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div class="flex shrink-0 justify-center px-3 py-2 md:hidden">
        <Segmented v-model="mobileTab" :options="tabOptions" />
      </div>

      <div
        ref="workspace"
        class="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:flex-row"
        :class="dragging ? 'cursor-col-resize select-none' : ''"
      >
        <div
          class="flex min-h-0 min-w-0 flex-col overflow-hidden md:min-w-60 md:pr-3"
          :class="[
            mobileTab === 'sources' ? 'flex-1' : 'hidden md:flex',
          ]"
          :style="leftPaneStyle"
        >
          <SourceList class="min-h-0 w-full min-w-0 flex-1" />
        </div>

        <WorkspaceDivider
          :dragging="dragging"
          @dblclick="resetSplit"
          @pointerdown="onResizePointerDown"
        />

        <div
          class="flex min-h-0 min-w-0 flex-col overflow-hidden md:flex-1"
          :class="[
            mobileTab === 'preview' ? 'flex flex-1' : 'hidden md:flex',
          ]"
        >
          <SplicedPreview class="min-h-0 w-full min-w-0 flex-1" />
        </div>
      </div>
    </div>
  </DropZone>
</template>
