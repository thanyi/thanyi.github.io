import { copyFile, mkdir } from "node:fs/promises";

// Artitalk is a classic browser script exposing window.Artitalk, not an ES module.
// Copy the pinned npm package locally instead of loading an unversioned CDN script.
await mkdir(new URL("../public/vendor/", import.meta.url), { recursive: true });
await copyFile(
  new URL("../node_modules/artitalk/artitalk.js", import.meta.url),
  new URL("../public/vendor/artitalk-3.3.4.js", import.meta.url)
);
