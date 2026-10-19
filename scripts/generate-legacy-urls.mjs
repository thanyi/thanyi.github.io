#!/usr/bin/env node
/**
 * Hugo cannot reproduce Hexo's nested category URLs or monthly archive URLs.
 * This script writes small redirect pages for any historical path that the
 * Hugo build did not produce itself. It runs after Hugo and Pagefind so the
 * redirect pages are not added to the search index.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const publishDir = process.env.HUGO_PUBLISH_DIR || join(root, "dist");
const siteUrl = "https://thanyi.github.io";

const redirects = JSON.parse(
  readFileSync(join(root, "data/legacy-redirects.json"), "utf8")
);
const migrationFile = existsSync(join(root, "data/migration.json"))
  ? join(root, "data/migration.json")
  : join(root, "src/data/migration.json");
const migration = JSON.parse(readFileSync(migrationFile, "utf8"));

const paths = new Map(Object.entries(redirects));

for (const legacy of migration.legacyPages ?? []) {
  const path = legacy.path;
  if (!path || paths.has(path)) continue;
  const segments = path.replace(/^\/+|\/+$/g, "").split("/");

  if (segments[0] === "categories") {
    // /categories/教程/burp-suite/ -> /categories/burp-suite/
    // /categories/学习/page/2/ -> /categories/学习/
    const pageIndex = segments.indexOf("page");
    if (pageIndex !== -1)
      paths.set(path, `/${segments.slice(0, pageIndex).join("/")}/`);
    else if (segments.length > 2)
      paths.set(path, `/categories/${segments.at(-1)}/`);
    else paths.set(path, "/categories/");
  } else if (segments[0] === "tags") {
    // Hugo normally generates the same term URL; if it did not, point at the
    // tag index instead of creating a redirect loop.
    paths.set(path, "/tags/");
  } else if (segments[0] === "archives") {
    paths.set(path, "/archives/");
  } else if (segments[0] === "page") {
    paths.set(path, "/posts/");
  } else {
    paths.set(path, "/");
  }
}

function outputFile(path) {
  return join(publishDir, path.replace(/^\/+|\/+$/g, ""), "index.html");
}

function redirectPage(target) {
  const href = encodeURI(target);
  const canonical = `${siteUrl}${href}`;
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${href}">
<link rel="canonical" href="${canonical}">
<title>正在跳转…</title>
</head>
<body><p>正在跳转到 <a href="${href}">${href}</a>…</p></body>
</html>
`;
}

let created = 0;
let skipped = 0;
for (const [path, target] of paths) {
  const file = outputFile(path);
  if (existsSync(file)) {
    skipped++;
    continue;
  }
  if (path === target) {
    // Do not create a redirect that points at itself; a missing page should
    // fail verification instead of looping in the browser.
    skipped++;
    continue;
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, redirectPage(target));
  created++;
}

// Keep /rss.xml available even if a Hugo version ignores the RSS baseName
// override. The built-in template still produces a valid feed at index.xml.
const generatedRss = join(publishDir, "rss.xml");
const builtinRss = join(publishDir, "index.xml");
if (!existsSync(generatedRss) && existsSync(builtinRss)) {
  copyFileSync(builtinRss, generatedRss);
}

const sitemapIndex = join(publishDir, "sitemap-index.xml");
if (!existsSync(sitemapIndex)) {
  writeFileSync(
    sitemapIndex,
    `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>${siteUrl}/sitemap.xml</loc></sitemap>
</sitemapindex>
`
  );
}

console.log(
  `旧网址兼容：新增 ${created} 个重定向，跳过 ${skipped} 个已生成路径。`
);
