<script setup lang="ts">
import { computed } from "vue";
import IconImagePlus from "~icons/lucide/image-plus";
import IconTrash2 from "~icons/lucide/trash-2";

import Hero from "@/components/Hero.vue";
import OsScroller from "@/components/OsScroller.vue";
import ScreenshotItem from "@/components/ScreenshotItem.vue";

import AppButton from "@/components/ui/AppButton.vue";
import { useAddScreenshots } from "@/composables/useAddScreenshots";
import { useI18n } from "@/composables/useI18n";
import { useScreenshotsStore } from "@/composables/useScreenshotsStore";

const { t } = useI18n();
const store = useScreenshotsStore();
const { pick } = useAddScreenshots();

const isEmpty = computed(() => store.items.value.length === 0);
</script>

<template>
  <section class="flex h-full min-h-0 flex-col">
    <Hero v-if="isEmpty" />

    <OsScroller v-else class="min-h-0 flex-1">
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

        <div
          class="grid min-w-0 w-full gap-4 grid-cols-[repeat(auto-fill,minmax(min(100%,520px),1fr))]"
        >
          <ScreenshotItem
            v-for="(item, i) in store.items.value"
            :key="item.id"
            class="min-w-0"
            :item="item"
            :index="i"
            :total="store.items.value.length"
          />
        </div>

        <AppButton variant="secondary" size="lg" block @click="pick()">
          <IconImagePlus />
          <span>{{ t("add_more") }}</span>
        </AppButton>
      </div>
    </OsScroller>
  </section>
</template>
