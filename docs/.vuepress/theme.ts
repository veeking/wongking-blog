import { hopeTheme } from "vuepress-theme-hope";
import { zhNavbar } from "./navbar/index.js";
// import { zhSidebar } from "./sidebar/index.js";

export default hopeTheme({
  // hostname: "https://mister-hope.github.io",
  darkmode: "enable",
  iconAssets: "iconfont",

  logo: "/logo.svg",
  repo: "vuepress-theme-hope/vuepress-theme-hope",
  docsDir: "docs",
  pageInfo: ["Author", "Original", "Date", "Category", "Tag"],
  blog: {
    sidebarDisplay: 'none',
  },
  repoDisplay: false,
  author: 'J.Wong',
  navbar: zhNavbar,
  sidebar: false,
  // copyright: 'veekingsen • © 2022 - 2023',
  displayFooter: true,
  editLink: false,
  contributors: false,
  lastUpdated: false,
  footer: `
   <div class="footer-bar">
    <div>
      <img  style="width: 15px;padding-bottom: 2px" src="/assets/beian.png">
      <a target="_blank" href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=33010602012652" style="display:inline-block;text-decoration:none;height:20px;line-height:20px;"><img src="" style="float:left;"/>
        <p style="float:left;height:20px;line-height:20px;margin: 0px 0px 0px 5px;">浙公网安备 33010602012652号</p>
      </a>
    </div>
    <div>
      <a target="_blank" rel="noopener noreferrer" class="beian" href="https://beian.miit.gov.cn">浙ICP备2022026851号-1</a>
    </div>
   <div>

  `,

  // encrypt: {
  //   config: {
  //     "/demo/encrypt.html": ["1234"],
  //   },
  // },

  plugins: {
    blog: {
      autoExcerpt: true,
    },
    // If you don't need comment feature, you can remove following option
    // The following config is for demo ONLY, if you need comment feature, please generate and use your own config, see comment plugin documentation for details.
    // To avoid disturbing the theme developer and consuming his resources, please DO NOT use the following config directly in your production environment!!!!!
    comment: false,
    // Disable features you don't want here
    mdEnhance: {
      align: true,
      attrs: true,
      chart: true,
      codetabs: true,
      container: true,
      demo: true,
      echarts: true,
      flowchart: true,
      gfm: true,
      imageSize: true,
      include: true,
      katex: true,
      lazyLoad: true,
      mark: true,
      mermaid: true,
      playground: {
        presets: ["ts", "vue"],
      },
      presentation: {
        plugins: ["highlight", "math", "search", "notes", "zoom"],
      },
      stylize: [
        {
          matcher: "Recommanded",
          replacer: ({ tag }) => {
            if (tag === "em")
              return {
                tag: "Badge",
                attrs: { type: "tip" },
                content: "Recommanded",
              };
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      vpre: true,
      vuePlayground: true,
    },
  },
});
