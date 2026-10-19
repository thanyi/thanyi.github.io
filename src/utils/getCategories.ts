import type { CollectionEntry } from "astro:content";
import migration from "@/data/migration.json";
import { slugifyStr } from "./slugify";

export function getCategories(posts: CollectionEntry<"posts">[]) {
  const categories = migration.legacyPages
    .filter(
      page =>
        page.kind === "categories" &&
        page.category &&
        !page.path.includes("/page/")
    )
    .map(page => ({ title: page.title, path: page.path }));
  for (const title of new Set(posts.flatMap(post => post.data.categories))) {
    if (categories.some(category => category.title === title)) continue;
    const slug = slugifyStr(title);
    if (!slug) throw new Error(`分类名称无法生成网址：${title}`);
    const path = `/categories/${slug}/`;
    if (categories.some(category => category.path === path)) {
      throw new Error(`分类网址重复，请调整名称：${title}`);
    }
    categories.push({ title, path });
  }
  return categories;
}
