import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
// import { getDirname, path } from "@vuepress/utils";

// const __dirname = getDirname(import.meta.url);

export default defineUserConfig({
  base: "/",
  dest: "./dist",
  lang: "zh-CN",
  title: "小岛",
  description: "己欲立而立人，己欲达而达人",
  shouldPrefetch: false,
  theme,
  // alias: {
  //   // 你可以在这里将别名定向到自己的组件
  //   "@theme-hope/modules/blog/components/BlogHero.js": path.resolve(
  //     __dirname,
  //     "./components/BlogBanner.ts"
  //   ),
  // }
});
