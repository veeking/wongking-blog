import { defineComponent, h, VNode } from "vue";
import BlogHero from "vuepress-theme-hope/modules/blog/components/BlogHero.js";

export default defineComponent({
  name: "BlogHero",
  setup() {
    return (): VNode =>
      h("div", null, [
        h(BlogHero, null, {
          heroImage: () =>  h("div", { 
            class: "myHero",
            innerHTML: 'test demo'
          })
        }),
      ]);
  },
});
