#!/usr/bin/env node
/**
 * One-time content migration from the AstroPaper repository to Hugo's
 * content layout. It is safe to re-run: generated content files are replaced
 * from the Astro sources, which remain the historical reference until the
 * migration branch removes them.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument, stringify } from "yaml";

const root = fileURLToPath(new URL("../", import.meta.url));
const SRC_POSTS = join(root, "src/content/posts");
const SRC_PAGES = join(root, "src/content/pages");
const OUT_POSTS = join(root, "content/posts");
const OUT_PAGES = join(root, "content");
const MIGRATION = JSON.parse(
  readFileSync(join(root, "src/data/migration.json"), "utf8")
);

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    return entry.isDirectory()
      ? walk(file)
      : /\.mdx?$/.test(entry.name)
        ? [file]
        : [];
  });
}

function readFrontmatter(file) {
  const original = readFileSync(file, "utf8");
  const match = original.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`缺少 frontmatter：${file}`);
  const document = parseDocument(match[1]);
  if (document.errors.length)
    throw new Error(`frontmatter 有误：${file}\n${document.errors[0].message}`);
  return {
    data: document.toJS() ?? {},
    body: original.slice(match[0].length),
  };
}

function iso(value) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function plainText(text) {
  return String(text)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/[*_~=]+/g, "")
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Inject the original Hexo heading ids as Goldmark block attributes. */
function injectHeadingIds(body, headings) {
  const entries = (headings ?? [])
    .filter(heading => heading && String(heading.slug ?? "").trim())
    .map(heading => ({
      depth: Number(heading.depth),
      slug: String(heading.slug).trim(),
      plain: plainText(heading.text),
      used: false,
    }));

  const lines = body.split("\n");
  let inFence = false;
  let fenceChar = "";
  const applied = [];
  const missed = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      if (!inFence) {
        inFence = true;
        fenceChar = fence[1][0];
      } else if (fence[1][0] === fenceChar) {
        inFence = false;
      }
      continue;
    }
    if (inFence || /^\s{4,}/.test(line)) continue;

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!heading) continue;

    const depth = heading[1].length;
    const rawText = heading[2].replace(/\s+#+\s*$/, "").trim();
    const hasAttribute = /\{[^}]*\}\s*$/.test(rawText);
    const text = hasAttribute
      ? rawText.replace(/\s*\{[^}]*\}\s*$/, "").trim()
      : rawText;
    const plain = plainText(text);

    let entry = entries.find(
      item => !item.used && item.depth === depth && item.plain === plain
    );
    if (!entry) entry = entries.find(item => !item.used && item.depth === depth);
    if (!entry) {
      missed.push({ depth, text });
      continue;
    }
    entry.used = true;
    if (hasAttribute) continue;

    const id = entry.slug.replace(/[{}]/g, "").replace(/\s+/g, "-");
    if (!id) continue;
    lines[index] = `${heading[1]} ${text} {#${id}}`;
    applied.push(id);
  }

  return { body: lines.join("\n"), applied, missed };
}

function convertPost(file) {
  const relativePath = relative(SRC_POSTS, file).split("\\").join("/");
  const { data, body } = readFrontmatter(file);
  const fallbackUrl = `/posts/${relativePath.replace(/\.mdx?$/, "")}/`;
  let url = typeof data.permalink === "string" && data.permalink.trim()
    ? data.permalink.trim()
    : fallbackUrl;
  if (!url.startsWith("/")) url = `/${url}`;
  if (!url.endsWith("/")) url = `${url}/`;

  const migration = MIGRATION.posts.find(post => post.url === url);
  const { body: migratedBody, applied, missed } = injectHeadingIds(
    body,
    migration?.headings
  );

  const output = {
    title: data.title,
    url,
    date: iso(data.pubDatetime),
    ...(data.modDatetime ? { lastmod: iso(data.modDatetime) } : {}),
    description: typeof data.description === "string" ? data.description : "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    categories: Array.isArray(data.categories) ? data.categories : [],
    ...(data.draft ? { draft: true } : {}),
    ...(data.featured ? { featured: true } : {}),
    ...(data.canonicalURL ? { canonicalURL: data.canonicalURL } : {}),
  };

  const ogImage =
    typeof data.ogImage === "string" ? data.ogImage : data.ogImage?.src;
  if (ogImage) output.images = [ogImage];
  if (!output.title) throw new Error(`文章缺少标题：${file}`);
  if (!output.date) throw new Error(`文章缺少发布日期：${file}`);

  const outFile = join(OUT_POSTS, relativePath);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(
    outFile,
    `---\n${stringify(output, { lineWidth: 0 })}---\n${migratedBody}`
  );

  return { file: relativePath, url, applied, missed };
}

function convertPage(sourceName, outName, overrides = {}) {
  const source = join(SRC_PAGES, sourceName);
  if (!existsSync(source)) return null;
  const { data, body } = readFrontmatter(source);
  const output = {
    title: overrides.title ?? data.title,
    url: overrides.url,
    description: overrides.description ?? data.description,
    hidemeta: true,
    ShowToc: false,
    ShowBreadCrumbs: false,
    comments: false,
  };
  const outFile = join(OUT_PAGES, outName);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(
    outFile,
    `---\n${stringify(output, { lineWidth: 0 })}---\n${body}`
  );
  return relative(root, outFile);
}

function writePage(name, contents) {
  const outFile = join(OUT_PAGES, name);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, contents);
  return relative(root, outFile);
}

function main() {
  mkdirSync(OUT_POSTS, { recursive: true });
  mkdirSync(join(root, "data"), { recursive: true });

  const results = walk(SRC_POSTS).map(convertPost);
  const pages = [
    convertPage("about.md", "about.md", { url: "/about/" }),
    convertPage("friends.md", "link.md", {
      title: "友链",
      url: "/link/",
      description: "朋友们与常读的博客。",
    }),
  ].filter(Boolean);

  writePage(
    "posts/_index.md",
    `---\ntitle: 文章\ndescription: 全部技术笔记与学习记录。\n---\n`
  );
  writePage(
    "archives.md",
    `---\ntitle: 归档\nlayout: archives\nurl: /archives/\nsummary: 按时间浏览全部文章。\n---\n`
  );
  writePage(
    "search.md",
    `---\ntitle: 搜索\nlayout: pagefind-search\nurl: /search/\nsummary: 搜索全部文章。\nShowToc: false\nhidemeta: true\n---\n`
  );
  writePage(
    "artitalk.md",
    `---\ntitle: 说说\nlayout: artitalk\nurl: /artitalk/\ndescription: 一些随手记下的片段。\nShowToc: false\nhidemeta: true\nShowBreadCrumbs: false\n---\n`
  );

  for (const name of [
    "migration.json",
    "artitalk.json",
    "legacy-redirects.json",
  ]) {
    copyFileSync(join(root, `src/data/${name}`), join(root, `data/${name}`));
  }

  const total = results.reduce((sum, item) => sum + item.applied.length, 0);
  const missed = results.flatMap(item =>
    item.missed.map(heading => `${item.url}#${heading.text}`)
  );
  console.log(`已迁移 ${results.length} 篇文章，注入 ${total} 个旧标题锚点。`);
  if (pages.length) console.log(`已迁移页面：${pages.join("、")}`);
  if (missed.length) {
    console.log(`\n有 ${missed.length} 个标题没有匹配到旧锚点（将使用 Hugo 自动锚点）：`);
    console.log(missed.slice(0, 20).join("\n"));
    if (missed.length > 20) console.log(`… 另有 ${missed.length - 20} 个`);
  }
}

main();
