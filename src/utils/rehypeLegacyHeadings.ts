import type { RehypePlugin } from "@astrojs/markdown-remark";
import type { Root, RootContent } from "hast";

type Heading = { slug: string };

/** Retain original Hexo fragment URLs while allowing ordinary Markdown headings. */
const rehypeLegacyHeadings: RehypePlugin = () => {
  return (tree, file) => {
    const headings = (file.data.astro?.frontmatter?.legacyHeadings ??
      []) as Heading[];
    if (!headings.length) return;
    let index = 0;
    function walk(node: Root | RootContent) {
      if (node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
        const heading = headings[index++];
        if (heading?.slug)
          node.properties = { ...node.properties, id: heading.slug };
      }
      if ("children" in node) node.children.forEach(walk);
    }
    walk(tree);
  };
};

export default rehypeLegacyHeadings;
