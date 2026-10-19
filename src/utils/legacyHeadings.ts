import migration from "@/data/migration.json";

export type LegacyHeading = { depth: number; slug: string; text: string };

/** Keep migration-only annotations out of the Markdown authors edit every day. */
export function getLegacyHeadings(permalink?: string): LegacyHeading[] {
  return migration.posts.find(post => post.url === permalink)?.headings ?? [];
}
