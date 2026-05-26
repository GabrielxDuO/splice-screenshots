import type { App, InjectionKey, Plugin, ShallowRef, WritableComputedRef } from "vue";
import type { Locale } from "@/i18n/locales";
import { computed, inject, readonly, shallowRef, watch } from "vue";

import { usePreferencesStore } from "@/composables/usePreferencesStore";

interface MessageTree {
  [key: string]: string | MessageTree;
}

interface LocaleModule {
  default: MessageTree;
}

export interface I18nInstance {
  locale: WritableComputedRef<Locale>;
  messages: Readonly<ShallowRef<MessageTree>>;
  loadLocale: (locale?: Locale) => Promise<void>;
  t: (key: string) => string;
}

export const i18nKey: InjectionKey<I18nInstance> = Symbol("i18n");

const localeLoaders = {
  "zh-CN": () => import("@/i18n/locales/zh-CN.json"),
  "en-US": () => import("@/i18n/locales/en-US.json"),
} satisfies Record<Locale, () => Promise<LocaleModule>>;

function resolveMessage(messages: MessageTree, key: string): string {
  const value = key
    .split(".")
    .reduce<string | MessageTree | undefined>((current, segment) => {
      if (!current || typeof current === "string")
        return undefined;
      return current[segment];
    }, messages);

  return typeof value === "string" ? value : key;
}

export function createI18n(): Plugin & I18nInstance {
  const preferences = usePreferencesStore();
  const messages = shallowRef<MessageTree>({});
  let latestRequest = 0;

  const locale = computed({
    get: () => preferences.locale.value,
    set: value => preferences.setLocale(value),
  });

  async function loadLocale(next = locale.value) {
    const request = ++latestRequest;
    const module = await localeLoaders[next]();

    if (request === latestRequest && next === locale.value)
      messages.value = module.default;
  }

  function t(key: string) {
    return resolveMessage(messages.value, key);
  }

  return {
    locale,
    messages: readonly(messages),
    loadLocale,
    t,
    install(app: App) {
      app.provide(i18nKey, this);
      app.config.globalProperties.$t = t;
      watch(locale, next => void loadLocale(next));
    },
  };
}

export function useI18n(): I18nInstance {
  const i18n = inject(i18nKey);

  if (!i18n)
    throw new Error("i18n plugin is not installed");

  return i18n;
}

declare module "vue" {
  interface ComponentCustomProperties {
    $t: (key: string) => string;
  }
}
