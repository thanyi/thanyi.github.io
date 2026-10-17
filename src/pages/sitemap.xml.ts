import { getCollection } from "astro:content";
import config from "@/config";
import { getSortedPosts } from "@/utils/getSortedPosts";
import { getPostUrl } from "@/utils/getPostPaths";
import { escapeXml as xml } from "@/utils/xml";

// Retain the sitemap endpoint previously submitted to search engines.
export async function GET() {
  const posts = getSortedPosts(await getCollection("posts"));
  const paths = [
    "/",
    "/posts/",
    "/tags/",
    "/categories/",
    "/archives/",
    "/about/",
    "/link/",
    ...posts.map(post => getPostUrl(post.id, post.filePath)),
  ];
  const urls = paths
    .map(
      path =>
        `<url><loc>${xml(new URL(path, config.site.url).href)}</loc></url>`
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
}
