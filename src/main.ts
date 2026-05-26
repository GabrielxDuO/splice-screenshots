import { ViteSSG } from "vite-ssg/single-page";
import App from "@/App.vue";
import { createI18n } from "@/i18n";
import "@/style.css";

export const createApp = ViteSSG(App, async ({ app }) => {
  const i18n = createI18n();
  app.use(i18n);
  await i18n.loadLocale();
});
