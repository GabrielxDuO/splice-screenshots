<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { computed, onUnmounted, watch } from "vue";
import IconX from "~icons/lucide/x";

import AppButton from "@/components/ui/AppButton.vue";
import IconButton from "@/components/ui/IconButton.vue";
import { useI18n } from "@/composables/useI18n";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const { t } = useI18n();

const tipParagraphs = computed(() =>
  ([
    "tips_para_handles",
    "tips_para_double",
    "tips_para_splitter",
    "tips_para_persist",
    "tips_para_drop",
  ] as const).map(key => t(key)),
);

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === "undefined")
      return;
    document.documentElement.classList.toggle("overflow-hidden", open);
  },
);

onUnmounted(() => {
  if (typeof document === "undefined")
    return;
  document.documentElement.classList.remove("overflow-hidden");
});

function close() {
  emit("update:modelValue", false);
}

useEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.modelValue)
    close();
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out motion-reduce:transition-none"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150 ease-in motion-reduce:transition-none"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-60 flex items-end justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6"
        role="presentation"
      >
        <div
          class="absolute inset-0 bg-black/35 backdrop-blur-[2px] dark:bg-black/50"
          aria-hidden="true"
          @click="close"
        />
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="t('tips_modal_title')"
          tabindex="-1"
          class="app-animate-pop-in relative z-1 flex max-h-[min(85dvh,560px)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.22)] ring-1 ring-black/8 dark:bg-neutral-900 dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] dark:ring-white/10"
          @click.stop
        >
          <div class="flex shrink-0 items-start justify-between gap-3 border-b border-black/6 px-5 py-4 dark:border-white/8">
            <h2 class="text-[17px] font-semibold tracking-tight">
              {{ t("tips_modal_title") }}
            </h2>
            <IconButton variant="ghost" size="sm" :label="t('tips_modal_close')" @click="close">
              <IconX />
            </IconButton>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <p class="mb-4 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {{ t("tips_modal_intro") }}
            </p>
            <ul class="space-y-3 text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-100">
              <li v-for="(text, i) in tipParagraphs" :key="i" class="flex gap-2.5">
                <span
                  class="flex h-lh w-3 shrink-0 items-center justify-center"
                  aria-hidden="true"
                >
                  <span class="size-1 rounded-full bg-accent opacity-70" />
                </span>
                <span class="min-w-0 flex-1">{{ text }}</span>
              </li>
            </ul>
          </div>

          <div class="shrink-0 border-t border-black/6 px-5 py-3 dark:border-white/8">
            <AppButton variant="secondary" size="md" block @click="close">
              {{ t("tips_modal_close") }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
