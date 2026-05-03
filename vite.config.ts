/// <reference types="vite-ssg" />
import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    Icons({ compiler: "vue3", scale: 1, defaultClass: "shrink-0" }),
  ],
  ssgOptions: {
    formatting: "minify",
    script: "async",
  },
});
