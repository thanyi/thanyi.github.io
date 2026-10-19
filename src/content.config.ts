import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import config from "@/config";
import { getLegacyHeadings } from "@/utils/legacyHeadings";

export const BLOG_PATH = "src/content/posts";

const posts = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z
      .object({
        permalink: z
          .string()
          .refine(
            path =>
              /^\/(?!\/)[^?#]+\/$/.test(path) &&
              path !== "/posts/" &&
              !/^\/posts\/\d+\/$/.test(path) &&
              !path
                .split("/")
                .some(segment => segment === "." || segment === ".."),
            "permalink 必须是 /posts/文章名/ 这样的站内路径"
          )
          .optional(),
        categories: z.array(z.string()).default([]),
        legacyHeadings: z
          .array(
            z.object({ depth: z.number(), slug: z.string(), text: z.string() })
          )
          .optional(),
        author: z.string().default(config.site.author),
        pubDatetime: z.coerce.date(),
        modDatetime: z.coerce.date().optional().nullable(),
        title: z.string(),
        featured: z.boolean().optional(),
        draft: z.boolean().optional(),
        tags: z.array(z.string()).default(["others"]),
        ogImage: image().or(z.string()).optional(),
        description: z.string().default(""),
        canonicalURL: z.string().optional(),
        hideEditPost: z.boolean().optional(),
        timezone: z.string().optional(),
      })
      .transform(data => ({
        ...data,
        legacyHeadings:
          data.legacyHeadings ?? getLegacyHeadings(data.permalink),
      })),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    ogImage: z.string().optional(),
    canonicalURL: z.string().optional(),
  }),
});

export const collections = { posts, pages };
