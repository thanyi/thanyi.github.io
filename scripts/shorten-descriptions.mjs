#!/usr/bin/env node
/**
 * Keep homepage excerpts readable: trim descriptions longer than 80 characters
 * at the nearest sentence or clause boundary, targeting 60-80 characters.
 * Descriptions that are already 80 characters or shorter are left untouched.
 */
import { fileURLToPath } from "node:url";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { readPost, writePost } from "./lib/blog-workflow.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const dir = join(root, "content/posts");
const MIN = 60;
const MAX = 80;
const SENTENCE = /[。！？!?；;]/g;
const CLAUSE = /[，,、：:]/g;

function lastBoundary(window, pattern) {
  let best = -1;
  for (const match of window.matchAll(pattern)) {
    if (match.index >= MIN - 1) best = match.index;
  }
  return best;
}

function shorten(text) {
  const normalized = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized || normalized.length <= MAX) return normalized;

  const window = normalized.slice(0, MAX);
  let index = lastBoundary(window, SENTENCE);
  if (index !== -1) return normalized.slice(0, index + 1).trim();

  index = lastBoundary(window, CLAUSE);
  if (index !== -1) return normalized.slice(0, index + 1).trim();

  return (
    normalized
      .slice(0, MAX - 1)
      .replace(/[\s，,、：:；;。！？!?…]+$/, "")
      .trimEnd() + "…"
  );
}

let changed = 0;
for (const name of readdirSync(dir).filter(
  file => file.endsWith(".md") && file !== "_index.md"
)) {
  const file = join(dir, name);
  const post = readPost(file);
  const description = String(post.data.description ?? "");
  if (!description.trim()) continue;

  const shortened = shorten(description);
  if (shortened === description) continue;

  post.document.set("description", shortened);
  writePost(file, post);
  changed++;
  console.log(`${name}\n  ${description.length} -> ${shortened.length}: ${shortened}`);
}

console.log(`\n已更新 ${changed} 篇文章的摘要。`);
