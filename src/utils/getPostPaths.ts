import { getRelativeLocaleUrl } from "astro:i18n";
import config from "@/config";

export type PostReference = {
  id: string;
  filePath?: string;
  data: { permalink?: string };
};

// A permalink keeps published URLs stable when files are renamed or reorganized.
export function getPostSlug(post: PostReference): string {
  return post.data.permalink?.replace(/^\/+|\/+$/g, "") ?? `posts/${post.id}`;
}

export function getPostUrl(
  post: PostReference,
  locale = config.site.lang
): string {
  return getRelativeLocaleUrl(locale, `${getPostSlug(post)}/`);
}
