import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  dest: "./dist",
  lang: "zh-CN",
  title: "漂流小岛",
  description: "欢迎来到漂流小岛",
  shouldPrefetch: false,
  theme,
});
