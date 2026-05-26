import type { Locale } from "@/i18n/locales";
import { createGlobalState, useColorMode, useLocalStorage } from "@vueuse/core";

import { locales } from "@/i18n/locales";

function detectLocale(): Locale {
  if (import.meta.env.SSR || typeof navigator === "undefined")
    return "zh-CN";
  const lang = navigator.language ?? "";
  return lang.toLowerCase().startsWith("en") ? "en-US" : "zh-CN";
}

export const usePreferencesStore = createGlobalState(() => {
  const theme = useColorMode({
    storageKey: "splice-theme",
    selector: "html",
    attribute: "class",
    modes: { light: "light", dark: "dark", auto: "" },
    initialValue: "auto",
    disableTransition: false,
  });

  const locale = useLocalStorage<Locale>("splice-locale", detectLocale(), {
    listenToStorageChanges: true,
  });

  function setLocale(next: Locale) {
    if (locales.includes(next))
      locale.value = next;
  }

  function toggleLocale() {
    locale.value = locale.value === "zh-CN" ? "en-US" : "zh-CN";
  }

  return { theme, locale, setLocale, toggleLocale };
});
