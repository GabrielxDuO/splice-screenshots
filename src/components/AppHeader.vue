<script setup lang="ts">
import { computed, ref } from "vue";
import IconCircleHelp from "~icons/lucide/circle-help";
import IconLayers from "~icons/lucide/layers";
import IconMonitor from "~icons/lucide/monitor";
import IconMoon from "~icons/lucide/moon";
import IconSun from "~icons/lucide/sun";

import TipsModal from "@/components/TipsModal.vue";
import IconButton from "@/components/ui/IconButton.vue";
import Segmented from "@/components/ui/Segmented.vue";
import { useI18n } from "@/composables/useI18n";
import { usePreferencesStore } from "@/composables/usePreferencesStore";

const { t, locale } = useI18n();
const tipsOpen = ref(false);
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

function resolveDark(value: "light" | "dark" | "auto") {
  if (value === "dark")
    return true;
  if (value === "light")
    return false;

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

async function setTheme(value: "light" | "dark" | "auto") {
  if (value === prefs.theme.store.value) {
    return;
  }

  if (
    typeof document === "undefined"
    || typeof window === "undefined"
    || !document.startViewTransition
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    prefs.theme.store.value = value;
    return;
  }

  const wasDark = document.documentElement.classList.contains("dark");
  const willBeDark = resolveDark(value);

  if (wasDark === willBeDark) {
    prefs.theme.store.value = value;
    return;
  }

  const transitionClass = willBeDark
    ? "rows-stack-transition-down"
    : "rows-stack-transition-up";
  document.documentElement.classList.add("rows-stack-transition", transitionClass);

  const transition = document.startViewTransition(() => {
    prefs.theme.store.value = value;
  });

  try {
    await transition.finished;
  }
  finally {
    document.documentElement.classList.remove("rows-stack-transition", transitionClass);
  }
}

const themeModel = computed({
  get: () => prefs.theme.store.value as "light" | "dark" | "auto",
  set: (v) => {
    void setTheme(v);
  },
});
</script>

<template>
  <header
    class="sticky top-0 z-30 w-full border-b border-black/6 bg-white/70 backdrop-blur-xl backdrop-saturate-150 dark:border-white/6 dark:bg-neutral-950/60"
  >
    <div class="mx-auto flex h-14 w-full max-w-[2200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <div class="flex min-w-0 items-center gap-2.5">
        <span
          class="grid size-8 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] text-accent"
        >
          <IconLayers class="size-[18px]" />
        </span>
        <span class="truncate text-[15px] font-semibold tracking-tight">
          {{ t("app_title") }}
        </span>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <IconButton variant="soft" size="sm" :label="t('tips_button')" @click="tipsOpen = true">
          <IconCircleHelp />
        </IconButton>

        <div class="app-theme-control hidden sm:block">
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

    <TipsModal v-model="tipsOpen" />
  </header>
</template>
