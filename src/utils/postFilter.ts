import type { CollectionEntry } from "astro:content";
import config from "@/config";

/**
 * Determines whether a post is eligible to be listed/rendered.
 *
 * Drafts and scheduled posts can be previewed locally. Production only includes
 * published posts whose scheduled publication time has passed.
 */
export function postFilter({ data }: CollectionEntry<"posts">) {
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - config.posts.scheduledPostMargin;
  return import.meta.env.DEV || (!data.draft && isPublishTimePassed);
}
