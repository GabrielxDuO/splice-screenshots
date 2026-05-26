<script setup lang="ts">
import type { ScreenshotItem } from "@/composables/useScreenshotsStore";
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import IconArrowDown from "~icons/lucide/arrow-down";
import IconArrowUp from "~icons/lucide/arrow-up";

import IconX from "~icons/lucide/x";
import IconButton from "@/components/ui/IconButton.vue";
import { useScreenshotsStore } from "@/composables/useScreenshotsStore";

import { consumeAltChordToggle } from "@/utils/altChordLatch";
import { detectDoubleTap } from "@/utils/pointer";

interface Props {
  item: ScreenshotItem;
  index: number;
  total: number;
}

const props = defineProps<Props>();

const store = useScreenshotsStore();

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const view = useTemplateRef<HTMLDivElement>("view");
const focusedHandle = ref<Edge | null>(null);

const isFirst = computed(() => props.index === 0);
const isLast = computed(() => props.index === props.total - 1);

const effectiveTop = computed(() => {
  if (isFirst.value)
    return 0;
  return props.item.useLocalRatio
    ? props.item.localTopRatio
    : store.topRatio.value;
});

const effectiveBottom = computed(() => {
  if (isLast.value)
    return 1;
  return props.item.useLocalRatio
    ? props.item.localBottomRatio
    : store.bottomRatio.value;
});

function drawImage() {
  const el = canvas.value;
  if (!el)
    return;
  const { image } = props.item;
  el.width = image.width;
  el.height = image.height;
  const ctx = el.getContext("2d");
  if (!ctx)
    return;
  ctx.clearRect(0, 0, el.width, el.height);
  ctx.drawImage(image, 0, 0);
}

onMounted(drawImage);
watch(
  () => props.item.image,
  () => drawImage(),
);

type Edge = "top" | "bottom";
let dragging: {
  edge: Edge;
  offset: number;
  pointerId: number;
  toggledViaAltOnDown: boolean;
} | null = null;

function ratioFromEvent(event: PointerEvent, offset: number): number {
  const el = view.value;
  if (!el)
    return 0;
  const rect = el.getBoundingClientRect();
  const y = event.clientY - rect.top - offset;
  return clamp(y / rect.height, 0, 1);
}

function onHandleDown(event: PointerEvent, edge: Edge) {
  event.preventDefault();
  event.stopPropagation();
  focusedHandle.value = edge;
  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);
  const rect = target.getBoundingClientRect();
  let toggledViaAltOnDown = false;
  if (event.altKey && consumeAltChordToggle() && !props.item.useLocalRatio) {
    store.toggleLocalRatio(props.item.id);
    toggledViaAltOnDown = true;
  }
  dragging = {
    edge,
    offset: event.clientY - rect.top - rect.height / 2,
    pointerId: event.pointerId,
    toggledViaAltOnDown,
  };
}

function onHandleMove(event: PointerEvent) {
  if (!dragging || event.pointerId !== dragging.pointerId)
    return;
  event.preventDefault();
  const ratio = ratioFromEvent(event, dragging.offset);
  applyRatio(dragging.edge, ratio);
}

function onHandleUp(event: PointerEvent) {
  if (!dragging || event.pointerId !== dragging.pointerId)
    return;
  event.preventDefault();
  const toggledViaAltOnDown = dragging.toggledViaAltOnDown;
  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
  dragging = null;
  if (detectDoubleTap(event)) {
    store.toggleLocalRatio(props.item.id);
    return;
  }
  if (!toggledViaAltOnDown && event.altKey && consumeAltChordToggle() && !props.item.useLocalRatio) {
    store.toggleLocalRatio(props.item.id);
  }
}

function onHandleCancel(event: PointerEvent) {
  if (!dragging || event.pointerId !== dragging.pointerId)
    return;
  dragging = null;
}

function applyRatio(edge: Edge, ratio: number) {
  const item = props.item;
  if (item.useLocalRatio) {
    if (edge === "top") {
      const max = isLast.value ? 1 : item.localBottomRatio;
      store.setLocalTop(item.id, Math.min(ratio, max));
    }
    else {
      const min = isFirst.value ? 0 : item.localTopRatio;
      store.setLocalBottom(item.id, Math.max(ratio, min));
    }
  }
  else {
    if (edge === "top") {
      const max = store.bottomRatio.value;
      store.setGlobalTop(Math.min(ratio, max));
    }
    else {
      const min = store.topRatio.value;
      store.setGlobalBottom(Math.max(ratio, min));
    }
  }
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

onBeforeUnmount(() => {
  dragging = null;
});

const aspectStyle = computed(() => ({
  aspectRatio: `${props.item.width} / ${props.item.height}`,
}));

const topPercent = computed(() => `${effectiveTop.value * 100}%`);
const bottomPercent = computed(() => `${effectiveBottom.value * 100}%`);
const bottomShadowHeight = computed(() => `${(1 - effectiveBottom.value) * 100}%`);
const topShadowHeight = computed(() => `${effectiveTop.value * 100}%`);

const handleColorClass = computed(() =>
  props.item.useLocalRatio
    ? "bg-[color:var(--color-accent)]"
    : "bg-neutral-900 dark:bg-white",
);

const handlesOverlap = computed(() => Math.abs(effectiveTop.value - effectiveBottom.value) < 0.0001);

function handleStackClass(edge: Edge): string {
  const fallbackEdge = handlesOverlap.value
    ? effectiveTop.value >= 0.5 ? "top" : "bottom"
    : null;
  const activeEdge = focusedHandle.value ?? fallbackEdge;
  return edge === activeEdge ? "z-20" : "z-10";
}
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/6 dark:bg-neutral-900 dark:ring-white/6"
  >
    <div class="flex items-center justify-between gap-2 px-3 py-2">
      <span
        class="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-black/5 px-2 text-[11px] font-semibold tabular-nums text-neutral-700 dark:bg-white/6 dark:text-neutral-200"
      >
        {{ index + 1 }}
      </span>
      <div class="flex items-center gap-0.5">
        <IconButton
          :label="$t('screenshot.moveUp')"
          :disabled="isFirst"
          size="sm"
          @click="store.moveUp(item.id)"
        >
          <IconArrowUp />
        </IconButton>
        <IconButton
          :label="$t('screenshot.moveDown')"
          :disabled="isLast"
          size="sm"
          @click="store.moveDown(item.id)"
        >
          <IconArrowDown />
        </IconButton>
        <IconButton
          :label="$t('screenshot.remove')"
          size="sm"
          @click="store.remove(item.id)"
        >
          <IconX />
        </IconButton>
      </div>
    </div>

    <div
      ref="view"
      class="relative w-full select-none overflow-hidden bg-black/5 dark:bg-black/40"
      :style="aspectStyle"
    >
      <canvas ref="canvas" class="block h-full w-full" />

      <div
        v-if="!isFirst"
        class="pointer-events-none absolute inset-x-0 top-0 bg-black/45"
        :style="{ height: topShadowHeight }"
      />
      <div
        v-if="!isLast"
        class="pointer-events-none absolute inset-x-0 bottom-0 bg-black/45"
        :style="{ height: bottomShadowHeight }"
      />

      <div
        v-if="!isFirst"
        class="absolute left-0 right-0 -translate-y-1/2 cursor-row-resize touch-none h-2 flex items-center before:block before:h-px before:w-full before:transition-colors before:duration-150 before:ease-out motion-reduce:before:transition-none" :class="[
          handleStackClass('top'),
          item.useLocalRatio ? 'before:bg-accent' : 'before:bg-white/95 dark:before:bg-white/85',
        ]"
        :style="{ top: topPercent }"
        :aria-label="$t('screenshot.moveUp')"
        @pointerdown="event => onHandleDown(event, 'top')"
        @pointermove="onHandleMove"
        @pointerup="onHandleUp"
        @pointercancel="onHandleCancel"
      >
        <span
          class="absolute right-2 size-2.5 rounded-full ring-2 ring-white/95 transition-colors duration-150 ease-out motion-reduce:transition-none dark:ring-neutral-900" :class="[
            handleColorClass,
          ]"
        />
      </div>
      <div
        v-if="!isLast"
        class="absolute left-0 right-0 -translate-y-1/2 cursor-row-resize touch-none h-2 flex items-center before:block before:h-px before:w-full before:transition-colors before:duration-150 before:ease-out motion-reduce:before:transition-none" :class="[
          handleStackClass('bottom'),
          item.useLocalRatio ? 'before:bg-accent' : 'before:bg-white/95 dark:before:bg-white/85',
        ]"
        :style="{ top: bottomPercent }"
        :aria-label="$t('screenshot.moveDown')"
        @pointerdown="event => onHandleDown(event, 'bottom')"
        @pointermove="onHandleMove"
        @pointerup="onHandleUp"
        @pointercancel="onHandleCancel"
      >
        <span
          class="absolute right-2 size-2.5 rounded-full ring-2 ring-white/95 transition-colors duration-150 ease-out motion-reduce:transition-none dark:ring-neutral-900" :class="[
            handleColorClass,
          ]"
        />
      </div>
    </div>
  </article>
</template>
