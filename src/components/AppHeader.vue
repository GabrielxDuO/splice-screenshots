<script setup lang="ts">
import { computed } from "vue";
import IconLayers from "~icons/lucide/layers";
import IconMonitor from "~icons/lucide/monitor";
import IconMoon from "~icons/lucide/moon";
import IconSun from "~icons/lucide/sun";

import Segmented from "@/components/ui/Segmented.vue";
import { useI18n } from "@/composables/useI18n";
import { usePreferencesStore } from "@/composables/usePreferencesStore";

const { t, locale } = useI18n();
const prefs = usePreferencesStore();

const themeOptions = computed(() => [
  { value: "light" as const, icon: IconSun, ariaLabel: t("theme_light") },
  { value: "auto" as const, icon: IconMonitor, ariaLabel: t("theme_auto") },
  { value: "dark" as const, icon: IconMoon, ariaLabel: t("theme_dark") },
]);

const localeOptions = computed(() => [
  { value: "zh-CN" as const, label: "中" },
  { value: "en-US" as const, label: "EN" },
]);

const themeModel = computed({
  get: () => (prefs.theme.value === "auto" ? "auto" : prefs.theme.value) as "light" | "dark" | "auto",
  set: (v) => {
    prefs.theme.value = v;
  },
});
</script>

<template>
  <header
    class="sticky top-0 z-30 w-full border-b border-black/[0.06] bg-white/70 backdrop-blur-xl backdrop-saturate-150 dark:border-white/[0.06] dark:bg-neutral-950/60"
  >
    <div class="mx-auto flex h-14 w-full max-w-[2200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <div class="flex min-w-0 items-center gap-2.5">
        <span
          class="grid size-8 shrink-0 place-items-center rounded-xl bg-[color:color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-[color:var(--color-accent)]"
        >
          <IconLayers class="size-[18px]" />
        </span>
        <span class="truncate text-[15px] font-semibold tracking-tight">
          {{ t("app_title") }}
        </span>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <div class="hidden sm:block">
          <Segmented
            v-model="themeModel"
            :options="themeOptions"
            :aria-label="t('theme')"
            size="sm"
          />
        </div>

        <Segmented
          v-model="locale"
          :options="localeOptions"
          :aria-label="t('language')"
          size="sm"
        />
      </div>
    </div>
  </header>
</template>
