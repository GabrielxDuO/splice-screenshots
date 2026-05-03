export const locales = ["zh-CN", "en-US"] as const;
export type Locale = typeof locales[number];

export const localeLabels: Record<Locale, string> = {
  "zh-CN": "中文",
  "en-US": "English",
};

const zhCN = {
  app_title: "截图拼接",
  meta_description: "在线拼接字幕截图，本地处理、无需上传。",

  add: "添加截图",
  add_more: "继续添加",
  download: "下载拼接图",
  clear_all: "清空全部",

  empty_title: "拖拽截图到这里",
  empty_subtitle: "也可以点击下方按钮选择文件，本地完成拼接，不上传服务器。",
  step_add: "添加多张截图",
  step_drag: "拖动手柄选择字幕区域",
  step_download: "下载拼接结果",

  drop_overlay_title: "松开鼠标导入截图",
  drop_overlay_hint: "支持一次拖入多张图片",

  preview_empty_title: "实时预览",
  preview_empty_hint: "添加截图后会立即在此显示拼接结果。",

  move_up: "上移",
  move_down: "下移",
  remove: "删除",
  toggle_local_ratio: "切换独立 / 全局比例",
  use_local_ratio_hint: "已切换为独立比例，仅作用于此截图",
  use_global_ratio_hint: "已切换回全局比例",

  theme: "主题",
  theme_light: "浅色",
  theme_dark: "深色",
  theme_auto: "跟随系统",

  language: "语言",

  tab_sources: "源截图",
  tab_preview: "预览",

  workspace_resize_handle: "拖动调整左右区域宽度",

  download_filename: "拼接截图",
} as const;

export type MessageKey = keyof typeof zhCN;

const enUS: Record<MessageKey, string> = {
  app_title: "Splice Screenshots",
  meta_description: "Splice screenshots in the browser. Runs locally — nothing is uploaded.",

  add: "Add screenshots",
  add_more: "Add more",
  download: "Download",
  clear_all: "Clear all",

  empty_title: "Drop screenshots here",
  empty_subtitle:
    "Or click the button below. Everything runs locally — nothing is uploaded.",
  step_add: "Add multiple screenshots",
  step_drag: "Drag the handles to select subtitle area",
  step_download: "Download the joined image",

  drop_overlay_title: "Release to import",
  drop_overlay_hint: "Drop one or more images at once",

  preview_empty_title: "Live preview",
  preview_empty_hint: "Add screenshots and the result appears here instantly.",

  move_up: "Move up",
  move_down: "Move down",
  remove: "Remove",
  toggle_local_ratio: "Toggle local / global ratio",
  use_local_ratio_hint: "Switched to local ratio for this screenshot only",
  use_global_ratio_hint: "Switched back to global ratio",

  theme: "Theme",
  theme_light: "Light",
  theme_dark: "Dark",
  theme_auto: "Auto",

  language: "Language",

  tab_sources: "Sources",
  tab_preview: "Preview",

  workspace_resize_handle: "Drag to resize panels",

  download_filename: "joined-screenshot",
};

export const messages: Record<Locale, Record<MessageKey, string>> = {
  "zh-CN": zhCN,
  "en-US": enUS,
};
