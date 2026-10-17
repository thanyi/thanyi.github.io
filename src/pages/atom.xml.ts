import { getCollection } from "astro:content";
import config from "@/config";
import { getSortedPosts } from "@/utils/getSortedPosts";
import { getPostUrl } from "@/utils/getPostPaths";
import { escapeXml as xml } from "@/utils/xml";

// Keep the old Atom subscription endpoint as XML; feed readers cannot use HTML redirects.
export async function GET() {
  const posts = getSortedPosts(await getCollection("posts"));
  const updated = new Date(
    Math.max(
      ...posts.map(post =>
        (post.data.modDatetime ?? post.data.pubDatetime).getTime()
      )
    )
  ).toISOString();
  const entries = posts
    .map(post => {
      const url = new URL(getPostUrl(post.id, post.filePath), config.site.url)
        .href;
      return `<entry><id>${xml(url)}</id><title>${xml(post.data.title)}</title><link href="${xml(url)}"/><published>${post.data.pubDatetime.toISOString()}</published><updated>${(post.data.modDatetime ?? post.data.pubDatetime).toISOString()}</updated><summary>${xml(post.data.description)}</summary></entry>`;
    })
    .join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xml:lang="zh-CN"><id>${xml(config.site.url)}</id><title>${xml(config.site.title)}</title><subtitle>${xml(config.site.description)}</subtitle><link href="${xml(config.site.url)}"/><link href="${xml(new URL("atom.xml", config.site.url).href)}" rel="self"/><updated>${updated}</updated><author><name>${xml(config.site.author)}</name></author>${entries}</feed>`;
  return new Response(body, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
