# Ethanyi's Blog

个人技术博客，使用 **Astro + AstroPaper**，部署到 GitHub Pages。

## 本地运行

需要 Node.js **24.16.0 或更新版本**（版本记录在 `.nvmrc`）。

```sh
nvm use
npm ci
npm run dev
```

打开终端显示的本地地址，默认是 `http://localhost:4321`。

```sh
npm run build              # 类型检查、生成静态站点和中文全文搜索索引
npm run verify:migration   # 检查正文一致性、旧链接、代码块、图片与订阅源
npm run preview            # 预览 dist 中的构建结果，包含全文搜索
```

首次使用搜索前需要运行一次 `npm run build`。开发服务器的搜索使用最近一次构建的索引。

## 写文章与修改外观

- 站点信息、社交链接和每页文章数：`astro-paper.config.ts`
- 首页介绍：`src/pages/index.astro`
- 文章：`src/content/posts/`
- 关于与友链：`src/content/pages/`
- 配色和字体：`src/styles/theme.css`
- 中文排版：`src/styles/typography.css`
- 中文界面：`src/i18n/lang/zh-CN.ts`
- 图片等静态资源：`public/`，引用时省略 `public` 前缀。

新文章可以放在 `src/content/posts/my-note.md`，网址为 `/posts/my-note/`：

```markdown
---
title: "文章标题"
pubDatetime: 2026-10-17T09:00:00+08:00
description: "一句话摘要。"
tags: ["技术"]
categories: ["学习"]
draft: false
---

正文从这里开始。
```

恢复文章沿用 `src/content/posts/年/月/日/原名称.md`，网址继续使用原来的 `/年/月/日/原名称/`。保留日期目录和文件名即可保留网址。其 `legacyHeadings` 字段记录旧标题锚点；如果重写了旧文章的标题结构，可以同步修改该字段，或删除它以使用自动生成的目录。新文章无需这个字段。

已有分类与旧的层级分类网址均已保留。分类页面按文章 `categories` 字段筛选；向 `src/data/migration.json` 中的 `legacyPages` 添加分类可以创建对应页面。

## GitHub Pages

仓库包含 `.github/workflows/deploy.yml`，推送到 `main` 后会构建、验证迁移结果并部署 `dist/`。

首次启用时，在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。不要再从仓库根目录发布源码文件。

站点地址配置为 `https://thanyi.github.io/`，推送到 `main` 后由上述工作流发布。

## 历史内容恢复

原仓库只保存了 Hexo 生成的网页。2026-10-17 从提交 `2a1d751547e791197ed9a447de637882b2b74e97` 恢复：

- 27 篇文章，保留标题、发布及更新时间、标签、分类与原始网址。
- 156 个代码块，移除旧主题生成的行号；构建检查逐个比对代码正文。
- 原有本地图片，以及从作者 GitHub 图床下载的 48 张图片。
- 旧标题锚点、友链、分类、归档及分页入口。
- `/atom.xml` 继续提供 Atom，另提供 `/rss.xml`；`/sitemap.xml` 仍为有效 XML。

验收会对仍保持恢复版本的文章比对正文与代码；后续有意修改 Markdown 不会被旧内容校验阻止，新文章也可以正常加入订阅源。详细清单见 `src/data/migration.json` 和 `src/data/image-cache.json`。只有一张图片原本指向作者电脑的 Typora 路径，无法从仓库恢复，现显示“图片暂缺”。一篇笔记中两个目标错误的参考链接根据可见网址修复。

说说继续使用原来的 Artitalk 公共应用配置（`src/data/artitalk.json`）；记录保存在原 LeanCloud 服务中，不在这个 Git 仓库里。2026-10-17 验证时，该应用返回 “The app is archived”。需要原账号在 LeanCloud 控制台恢复应用后，才能重新读取说说；页面已保留兼容入口，并在服务不可用时显示提示。Artitalk 使用固定版本的本地脚本。

恢复工具仅用于重新提取历史快照，**会覆盖恢复的文章和友链文件**，日常写文章无需运行：

```sh
python3 -m venv /tmp/ethanyi-recovery-env
/tmp/ethanyi-recovery-env/bin/pip install -r scripts/requirements-recovery.txt
mkdir -p /tmp/ethanyi-hexo-snapshot
git archive 2a1d751547e791197ed9a447de637882b2b74e97 | tar -x -C /tmp/ethanyi-hexo-snapshot
/tmp/ethanyi-recovery-env/bin/python scripts/recover-hexo.py /tmp/ethanyi-hexo-snapshot
python3 scripts/cache-legacy-images.py
```

## 主题来源

基于 [AstroPaper](https://github.com/satnaing/astro-paper) 6.1.0，使用 Astro 7；导入时的上游提交为 `35cfa7fbe0b897306d27670d3819e55d5205f3dd`。保留主题的 MIT 许可证，见 `LICENSE`。历史文章和图片属于原作者，不因主题许可证而重新授权。
