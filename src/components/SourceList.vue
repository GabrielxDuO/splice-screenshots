<script setup lang="ts">
import { computed } from "vue";
import IconImagePlus from "~icons/lucide/image-plus";
import IconTrash2 from "~icons/lucide/trash-2";

import Hero from "@/components/Hero.vue";
import PaneScroll from "@/components/PaneScroll.vue";
import ScreenshotItem from "@/components/ScreenshotItem.vue";

import AppButton from "@/components/ui/AppButton.vue";
import { useAddScreenshots } from "@/composables/useAddScreenshots";
import { useI18n } from "@/composables/useI18n";
import { useScreenshotsStore } from "@/composables/useScreenshotsStore";

const { t } = useI18n();
const store = useScreenshotsStore();
const { pick } = useAddScreenshots();

const isEmpty = computed(() => store.items.value.length === 0);
const showHero = computed(() => store.workspaceReady.value && isEmpty.value);
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <Transition
      mode="out-in"
      enter-active-class="transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition-opacity duration-150 ease-out motion-reduce:transition-none"
      leave-to-class="opacity-0"
    >
      <div
        v-if="!store.workspaceReady.value"
        class="flex min-h-[min(40vh,320px)] flex-1 items-center justify-center px-6 text-[13px] text-neutral-400 dark:text-neutral-500"
      >
        {{ t("workspace_loading") }}
      </div>

      <div v-else-if="showHero" class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <Hero />
      </div>

      <PaneScroll v-else class="min-h-0 flex-1">
        <div class="w-full space-y-4 px-4 py-6 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-[15px] font-semibold tracking-tight">
              {{ t("tab_sources") }}
              <span class="ml-1 text-[12px] font-normal text-neutral-500 dark:text-neutral-400">
                {{ store.items.value.length }}
              </span>
            </h2>
            <AppButton variant="ghost" size="md" @click="store.clearAll()">
              <IconTrash2 />
              <span>{{ t("clear_all") }}</span>
            </AppButton>
          </div>

          <TransitionGroup
            tag="div"
            class="source-masonry min-w-0 w-full"
            enter-active-class="transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none"
            enter-from-class="opacity-0 translate-y-2 scale-[0.99]"
            leave-active-class="transition-[opacity,transform] duration-150 ease-in motion-reduce:transition-none"
            leave-to-class="opacity-0 scale-[0.99]"
            move-class="transition-transform duration-300 ease-out motion-reduce:transition-none"
          >
            <ScreenshotItem
              v-for="(item, i) in store.items.value"
              :key="item.id"
              class="source-masonry-item min-w-0"
              :item="item"
              :index="i"
              :total="store.items.value.length"
            />
          </TransitionGroup>

          <AppButton variant="secondary" size="lg" block @click="pick()">
            <IconImagePlus />
            <span>{{ t("add_more") }}</span>
          </AppButton>
        </div>
      </PaneScroll>
    </Transition>
  </section>
</template>
