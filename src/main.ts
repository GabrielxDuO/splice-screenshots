import { ViteSSG } from "vite-ssg/single-page";
import App from "@/App.vue";
import "overlayscrollbars/overlayscrollbars.css";
import "@/style.css";

export const createApp = ViteSSG(App);
