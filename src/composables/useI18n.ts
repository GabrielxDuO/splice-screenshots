import type { MessageKey } from "@/i18n/messages";
import { computed } from "vue";

import { usePreferencesStore } from "@/composables/usePreferencesStore";
import { messages } from "@/i18n/messages";

export function useI18n() {
  const { locale } = usePreferencesStore();

  const dict = computed(() => messages[locale.value]);
  const t = (key: MessageKey) => dict.value[key];

  return { t, locale, dict };
}
