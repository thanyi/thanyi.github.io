# Ethanyi's Blog

个人技术博客，使用 **Hugo + PaperMod**，部署到 GitHub Pages。

## 日常写文章：两条命令

在仓库目录打开终端，新建文章：

```sh
npm run new -- "我的新文章"
```

会自动生成 `content/posts/我的新文章.md`，并创建配图目录。用你喜欢的编辑器写好正文，然后发布：

```sh
npm run publish
```

发布命令会自动完成：补充摘要、处理日期、将改动的草稿转为正式文章、构建与校验、Git 提交、推送到 `main`。之后 GitHub Actions 会更新网站。

**不带参数会发布所有改动的文章（包括草稿）、关于/友链和图片。** 如果同时写着多篇草稿，只发布其中一篇：

```sh
npm run publish -- "我的新文章"
```

只查看本次会提交哪些文件：

```sh
npm run publish -- --dry-run
```

检查失败时保留你写的正文，并恢复原来的草稿状态；已提交但推送失败时，重新运行 `npm run publish` 即可重试。发布命令会先同步可快进的远程更新，并保留其他类型的本地修改。

## 目录和图片

文章全部平铺，不再按年/月/日建立目录：

```text
content/posts/
  正则表达式的基本使用.md
  关于hexo的博客搭建.md
  我的新文章.md

public/images/
  我的新文章/
    配图.png
```

正文插入图片：

```markdown
![图片说明](/images/我的新文章/配图.png)
```

新建命令会输出实际图片目录和文章网址。希望网址使用英文时可以指定：

```sh
npm run new -- "我的 Python 笔记" --slug python-notes
```

此时文章文件仍以中文标题命名，配图放在 `public/images/python-notes/`，网址为 `/posts/python-notes/`。

## 修改旧文章

在 `content/posts/` 直接打开对应文章修改，完成后同样运行 `npm run publish`。更新日期会自动填写，原来的发布日期会保留。

每篇文章的 `url` 固定网址，**重命名或移动文件时保留它即可**。旧文章仍使用原来的日期网址，外链和阅读量统计地址继续有效。旧标题锚点已写入正文标题的 `{#anchor}` 属性，日常修改标题时请保留它。

还可以直接在 [GitHub 文章目录](https://github.com/thanyi/thanyi.github.io/tree/main/content/posts) 编辑现有文件，提交到 `main` 即可触发自动发布。

## 本地预览与首次准备

需要 Node.js **24.16.0 或更新版本**（记录在 `.nvmrc`），以及 Hugo **0.168.0**（extended，与 CI 一致）：

```sh
brew install hugo
git submodule update --init --recursive
npm ci
```

需要边写边看时运行：

```sh
npm run dev
```

打开 `http://localhost:1313`。**本地开发可以预览草稿**，正式构建会排除草稿。搜索索引需要先构建：

```sh
npm run build
npm run preview
```

使用 nvm 的话，可以通过 `nvm install` 安装 `.nvmrc` 指定的版本，再执行 `nvm use`。

## 文章配置

新建命令会自动填写下面的配置，你只需要写正文。标签、分类和摘要都可以按需修改：

```yaml
title: 我的新文章
url: /posts/我的新文章/
date: 2026-10-19T00:00:00+08:00
description: ""
tags: []
categories: []
draft: true
```

- 首次发布草稿时自动填写实际发布日期；修改正式文章时自动填写更新日期（`lastmod`）。
- 摘要留空时，发布命令自动从正文生成；填写了摘要就使用你写的内容。
- 标签和分类填写后会自动生成相应页面，无需再维护分类清单。
- `url` 用于保持网址稳定，`draft` 用于区分草稿和正式文章。

## 站点设置与维护命令

- 站点信息、导航、每页文章数、PaperMod 参数：`hugo.yaml`
- 右侧 sticky 目录样式：`assets/css/extended/toc.css`（其余使用 PaperMod 默认样式）
- 页面模板与统计/搜索脚本：`layouts/`、`assets/js/`
- 关于与友链：`content/about.md`、`content/link.md`

```sh
npm test                   # 写作与发布命令的回归检查
npm run build              # Hugo 构建、旧网址兼容和 Pagefind 索引
npm run verify:migration   # 检查历史正文、网址、图片、锚点及订阅源
```

构建输出在 `dist/`。`public/` 是源资源目录（历史沿用的命名），Hugo 会把它和 `static/` 一起复制到 `dist/`。

## GitHub Pages

仓库包含 `.github/workflows/deploy.yml`，推送到 `main` 后会安装 Hugo、构建、验证并部署 `dist/`。

首次启用时，在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。不要再从仓库根目录发布源码文件。

站点地址配置为 `https://thanyi.github.io/`，推送到 `main` 后由上述工作流发布。

## 阅读量统计

文章日期旁显示文章阅读次数（PV），页脚显示全站访问次数（PV）与访客数（UV）。继续使用原来 Butterfly 接入的不蒜子服务，统计按域名和页面网址区分。

统计仅在正式站点域名 `thanyi.github.io` 下请求，本地预览显示 `—`。服务超时或被拦截时也显示 `—`，不影响文章阅读。阅读次数会累计重复打开，并不等于实际读完文章的人数。

加载逻辑在 `assets/js/visit-counts.js`，展示组件分布在 `layouts/_default/single.html` 和 `layouts/partials/footer.html`。

## 搜索

搜索使用 [Pagefind](https://pagefind.app/)，索引在 `npm run build` 时生成到 `dist/pagefind/`。搜索结果按文章正文建立，中文分词比浏览器端模糊搜索更准确。

`hugo server` 不提供 Pagefind 索引；要预览完整搜索，请先构建，再用 `npm run preview` 打开 `dist/`。

## 说说

说说页面继续使用原来的 Artitalk 公共应用配置（`data/artitalk.json`）；记录保存在原 LeanCloud 服务中，不在这个 Git 仓库里。2026-10-17 验证时，该应用返回 “The app is archived”。需要原账号在 LeanCloud 控制台恢复应用后，才能重新读取说说；页面已保留兼容入口，并在服务不可用时显示提示。Artitalk 使用固定版本的本地脚本（`public/vendor/artitalk-3.3.4.js`）。

## 历史内容恢复

原仓库只保存了 Hexo 生成的网页。2026-10-17 从提交 `2a1d751547e791197ed9a447de637882b2b74e97` 恢复：

- 27 篇文章，保留标题、发布及更新时间、标签、分类与原始网址。
- 156 个代码块，移除旧主题生成的行号；构建检查逐个比对代码正文。
- 原有本地图片，以及从作者 GitHub 图床下载的 48 张图片。
- 旧标题锚点、友链、分类、归档及分页入口。
- `/atom.xml`、`/rss.xml`、`/sitemap.xml` 继续有效。

迁移到 Hugo 时，`scripts/migrate-to-hugo.mjs` 把 Astro frontmatter 转换为 Hugo 字段，并把旧标题锚点写成 `{#anchor}`；`scripts/generate-legacy-urls.mjs` 为 Hugo 无法原生生成的嵌套分类和年月归档补上重定向。验收脚本会比对 27 篇文章的正文、代码、锚点、图片和订阅源。

恢复工具仅用于重新提取历史快照，**会覆盖恢复的文章和友链文件**，日常写文章无需运行。注意：该工具仍按旧 Astro 目录输出，只在需要重新核对历史快照时使用；迁移后的日常内容在 `content/` 下：

```sh
python3 -m venv /tmp/ethanyi-recovery-env
/tmp/ethanyi-recovery-env/bin/pip install -r scripts/requirements-recovery.txt
mkdir -p /tmp/ethanyi-hexo-snapshot
git archive 2a1d751547e791197ed9a447de637882b2b74e97 | tar -x -C /tmp/ethanyi-hexo-snapshot
/tmp/ethanyi-recovery-env/bin/python scripts/recover-hexo.py /tmp/ethanyi-hexo-snapshot
python3 scripts/cache-legacy-images.py
```

## 主题来源

基于 [PaperMod](https://github.com/adityatelange/hugo-PaperMod) v8.0，以 git submodule 放在 `themes/PaperMod`。GitHub Actions 固定使用 Hugo 0.168.0（extended）。导入前的 AstroPaper 版本和上游提交保留在 git 历史中。保留主题的 MIT 许可证，见 `LICENSE`。历史文章和图片属于原作者，不因主题许可证而重新授权。
