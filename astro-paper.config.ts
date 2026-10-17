import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://thanyi.github.io/",
    title: "Ethanyi's Blog",
    description: "记录网络安全、编程实践与学习过程中的思考。",
    author: "Ethanyi",
    profile: "https://github.com/thanyi",
    ogImage: "og.jpeg",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: { perPage: 8, perIndex: 5 },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: { enabled: false },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/thanyi", linkTitle: "Ethanyi 的 GitHub" },
  ],
  shareLinks: [],
});
