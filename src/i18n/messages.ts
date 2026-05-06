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
  save: "保存拼接图",
  clear_all: "清空全部",

  empty_title: "拖拽截图到这里",
  empty_subtitle: "也可以点击下方按钮选择文件，本地完成拼接，不上传服务器。",
  step_add: "添加多张截图",
  step_drag: "拖动手柄选择字幕区域",
  step_save: "保存拼接结果",

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
  workspace_resize_hint: "拖动调整宽度，双击恢复默认布局",
  workspace_loading: "载入本地记录…",

  save_filename: "拼接截图",

  tips_button: "使用提示",
  tips_modal_title: "你可能不知道的功能",
  tips_modal_close: "关闭",
  tips_modal_intro: "几个容易漏掉的小操作：",
  tips_para_handles: "拖动截图上的横条，可调整参与拼接的上下裁切边界。",
  tips_para_double:
    "双击横条，可在「单张独立裁切」和「跟随全局裁切」之间切换；按住 Alt（⌥）拖动也能进入独立裁切。",
  tips_para_splitter: "宽屏时拖动中间分隔条可调整左右宽度，双击分隔条可恢复默认布局。",
  tips_para_persist: "截图会保存在本机浏览器，刷新后仍会保留，直到你清空或清除站点数据。",
  tips_para_drop: "把图片拖到窗口任意位置即可导入。",
} as const;

export type MessageKey = keyof typeof zhCN;

const enUS: Record<MessageKey, string> = {
  app_title: "Splice Screenshots",
  meta_description: "Splice screenshots in the browser. Runs locally — nothing is uploaded.",

  add: "Add screenshots",
  add_more: "Add more",
  save: "Save spliced image",
  clear_all: "Clear all",

  empty_title: "Drop screenshots here",
  empty_subtitle:
    "Or click the button below. Everything runs locally — nothing is uploaded.",
  step_add: "Add multiple screenshots",
  step_drag: "Drag the handles to select subtitle area",
  step_save: "Save the spliced image",

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
  workspace_resize_hint: "Drag to resize, double-click to reset the layout",
  workspace_loading: "Loading saved screenshots…",

  save_filename: "spliced-screenshot",

  tips_button: "Tips",
  tips_modal_title: "Less obvious features",
  tips_modal_close: "Close",
  tips_modal_intro: "A few easy-to-miss controls:",
  tips_para_handles:
    "Drag a horizontal handle on a screenshot to adjust the crop used in the spliced image.",
  tips_para_double:
    "Double-click a horizontal handle to switch between local crop and global crop. Alt (⌥)-drag also enters local crop.",
  tips_para_splitter:
    "On wide layouts, drag the center splitter to resize both panels. Double-click it to reset the layout.",
  tips_para_persist:
    "Screenshots are saved in this browser and survive refresh until you clear them or wipe site data.",
  tips_para_drop: "Drop images anywhere on the window to import.",
};

export const messages: Record<Locale, Record<MessageKey, string>> = {
  "zh-CN": zhCN,
  "en-US": enUS,
};
