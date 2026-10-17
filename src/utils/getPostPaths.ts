import { getRelativeLocaleUrl } from "astro:i18n";
import { BLOG_PATH } from "@/content.config";
import config from "@/config";

// Recovered posts keep their dated Hexo paths. New posts use /posts/<filename>/.
function pathForPost(id: string, filePath: string | undefined): string {
  const path =
    filePath
      ?.replaceAll("\\", "/")
      .replace(`${BLOG_PATH}/`, "")
      .replace(/\.mdx?$/, "") ?? id;
  return /^20\d{2}\/\d{2}\/\d{2}\//.test(path) ? path : `posts/${id}`;
}

export function getPostSlug(id: string, filePath: string | undefined): string {
  return pathForPost(id, filePath);
}

export function getPostUrl(
  id: string,
  filePath: string | undefined,
  locale = config.site.lang
): string {
  return getRelativeLocaleUrl(locale, `${pathForPost(id, filePath)}/`);
}
