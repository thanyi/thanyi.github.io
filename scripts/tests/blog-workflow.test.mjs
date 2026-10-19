import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { createPost, publishContent, readPost } from "../lib/blog-workflow.mjs";

const now = new Date("2026-10-19T05:00:00.000Z");
const git = (root, ...args) =>
  execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "blog-workflow-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const root = join(directory, "working tree");
  const remote = join(directory, "remote.git");
  mkdirSync(root);
  git(directory, "init", "--bare", "--initial-branch=main", remote);
  git(root, "init", "--initial-branch=main");
  git(root, "config", "user.name", "Workflow test");
  git(root, "config", "user.email", "workflow@example.invalid");
  git(root, "config", "commit.gpgsign", "false");
  git(root, "config", "core.hooksPath", ".git/hooks");
  writeFileSync(join(root, "README.md"), "Initial readme\n");
  git(root, "add", ".");
  git(root, "commit", "-m", "Initial content");
  git(root, "remote", "add", "origin", remote);
  git(root, "push", "-u", "origin", "main");
  return { root, remote };
}

function draft(root, title = "中文笔记") {
  const result = createPost({ root, title, now });
  writeFileSync(
    result.file,
    readFileSync(result.file, "utf8") +
      "## 学到的内容\n\n这是一篇实际写好的笔记，正文中的 [链接](https://example.com) 会生成摘要。\n"
  );
  return result;
}

const options = root => ({ root, now, runBuild: () => {}, log: () => {} });

test("new creates a shallow draft and stable URL, preserving titles literally", t => {
  const { root } = fixture(t);
  const title = '学习 "Python" $(touch marker)';
  const created = createPost({ root, title, slug: "python-note", now });
  assert.equal(dirname(created.file), join(root, "content/posts"));
  const post = readPost(created.file);
  assert.equal(post.data.title, title);
  assert.equal(post.data.draft, true);
  assert.equal(post.data.url, "/posts/python-note/");
  assert.equal(existsSync(created.imageDirectory), true);
  assert.equal(existsSync(join(root, "marker")), false);
  assert.throws(() => createPost({ root, title, now }), /已经存在/);
  assert.throws(
    () => createPost({ root, title: "另一个标题", slug: "python-note", now }),
    /网址已经被使用/
  );
  assert.throws(() => createPost({ root, title: "123", now }), /只有数字/);
});

test("publish fills metadata and pushes real Git content without unrelated changes", t => {
  const { root, remote } = fixture(t);
  const article = draft(root);
  const image = join(article.imageDirectory, "diagram.png");
  writeFileSync(image, "test image");
  writeFileSync(join(root, "README.md"), "Unrelated local edit\n");
  let builds = 0;
  const result = publishContent({
    ...options(root),
    runBuild: () => {
      builds++;
      assert.equal(readPost(article.file).data.draft, false);
    },
  });
  assert.equal(builds, 1);
  assert.equal(result.pushed, true);
  const post = readPost(article.file);
  assert.equal(post.data.date, now.toISOString());
  assert.ok(post.data.description.includes("学到的内容"));
  assert.ok(!post.data.description.includes("]("));
  assert.equal(git(remote, "show", "main:README.md"), "Initial readme");
  assert.match(git(root, "status", "--short"), /README.md/);
  assert.equal(
    git(root, "rev-parse", "HEAD"),
    git(remote, "rev-parse", "main")
  );
  assert.ok(
    git(remote, "ls-tree", "-r", "--name-only", "main").includes(
      "public/images/"
    )
  );
});

test("publishing one post leaves other drafts unpublished", t => {
  const { root, remote } = fixture(t);
  const first = draft(root, "第一篇: Python");
  const second = draft(root, "第二篇");
  writeFileSync(join(first.imageDirectory, "first.png"), "first image");
  writeFileSync(join(second.imageDirectory, "second.png"), "other draft image");
  publishContent({ ...options(root), target: "第一篇: Python" });
  assert.equal(readPost(first.file).data.draft, false);
  assert.equal(readPost(second.file).data.draft, true);
  assert.throws(() =>
    git(remote, "show", `main:${relative(root, second.file)}`)
  );
  assert.throws(() =>
    git(
      remote,
      "show",
      `main:${relative(root, join(second.imageDirectory, "second.png"))}`
    )
  );
  assert.equal(
    git(
      remote,
      "show",
      `main:${relative(root, join(first.imageDirectory, "first.png"))}`
    ),
    "first image"
  );
  assert.throws(
    () => publishContent({ ...options(root), target: "../../../README.md" }),
    /找不到文章/
  );
});

test("the default publisher runs actual npm checks before committing and rejects failed checks", t => {
  const { root, remote } = fixture(t);
  const article = draft(root);
  const packagePath = join(root, "package.json");
  writeFileSync(
    packagePath,
    JSON.stringify({
      private: true,
      scripts: {
        build: "node -e \"require('fs').writeFileSync('build-passed', 'yes')\"",
        "verify:migration":
          "node -e \"require('fs').writeFileSync('verify-passed', 'yes')\"",
      },
    })
  );
  publishContent({ root, now, log: () => {} });
  assert.equal(readFileSync(join(root, "build-passed"), "utf8"), "yes");
  assert.equal(readFileSync(join(root, "verify-passed"), "utf8"), "yes");
  const before = git(remote, "rev-parse", "main");
  writeFileSync(
    article.file,
    readFileSync(article.file, "utf8") + "\n作者继续写的新正文。\n"
  );
  const original = readFileSync(article.file, "utf8");
  writeFileSync(
    packagePath,
    JSON.stringify({ scripts: { build: 'node -e "process.exit(1)"' } })
  );
  assert.throws(
    () => publishContent({ root, now, log: () => {} }),
    /检查未通过/
  );
  assert.equal(readFileSync(article.file, "utf8"), original);
  assert.equal(git(remote, "rev-parse", "main"), before);
});

test("updating a published article keeps its publication date and custom summary", t => {
  const { root } = fixture(t);
  const article = draft(root);
  publishContent(options(root));
  const first = readPost(article.file);
  const publishedAt = first.data.date;
  first.document.set("description", "我手工写的摘要");
  first.body += "\n这次补充的新内容。\n";
  writeFileSync(
    article.file,
    `---\n${first.document.toString()}---\n${first.body}`
  );
  const later = new Date("2026-10-20T05:00:00.000Z");
  publishContent({ ...options(root), now: later });
  const updated = readPost(article.file);
  assert.equal(updated.data.date, publishedAt);
  assert.equal(updated.data.lastmod, later.toISOString());
  assert.equal(updated.data.description, "我手工写的摘要");
});

test("build failure restores draft metadata and preserves the authored body", t => {
  const { root, remote } = fixture(t);
  const article = draft(root);
  const original = readFileSync(article.file, "utf8");
  const before = git(remote, "rev-parse", "main");
  assert.throws(
    () =>
      publishContent({
        ...options(root),
        runBuild: () => {
          throw new Error("Build failed");
        },
      }),
    /Build failed/
  );
  assert.equal(readFileSync(article.file, "utf8"), original);
  assert.equal(git(root, "diff", "--cached", "--name-only"), "");
  assert.equal(git(remote, "rev-parse", "main"), before);
});

test("commit failure unstages only the planned files and restores draft metadata", t => {
  const { root } = fixture(t);
  const article = draft(root);
  const original = readFileSync(article.file, "utf8");
  writeFileSync(join(root, ".git/hooks/pre-commit"), "#!/bin/sh\nexit 1\n", {
    mode: 0o755,
  });
  assert.throws(() => publishContent(options(root)), /Git 操作失败/);
  assert.equal(readFileSync(article.file, "utf8"), original);
  assert.equal(git(root, "diff", "--cached", "--name-only"), "");
});

test("existing staged changes are preserved and cannot be mixed into publication", t => {
  const { root } = fixture(t);
  draft(root);
  writeFileSync(join(root, "README.md"), "Staged edit\n");
  git(root, "add", "README.md");
  assert.throws(() => publishContent(options(root)), /已有暂存/);
  assert.equal(git(root, "diff", "--cached", "--name-only"), "README.md");
});

test("failed push preserves the commit, and rerunning publish retries without a duplicate commit", t => {
  const { root, remote } = fixture(t);
  const article = draft(root);
  const hook = join(remote, "hooks/pre-receive");
  writeFileSync(hook, "#!/bin/sh\nexit 1\n", { mode: 0o755 });
  assert.throws(() => publishContent(options(root)), /已提交保存在本地/);
  assert.equal(readPost(article.file).data.draft, false);
  const commit = git(root, "rev-parse", "HEAD");
  assert.equal(git(root, "status", "--short"), "");
  rmSync(hook);
  assert.equal(publishContent(options(root)).pushed, true);
  assert.equal(git(root, "rev-parse", "HEAD"), commit);
  assert.equal(git(remote, "rev-parse", "main"), commit);
});

test("dry run lists files without changing metadata, index or remote", t => {
  const { root, remote } = fixture(t);
  const article = draft(root);
  const original = readFileSync(article.file, "utf8");
  const before = git(remote, "rev-parse", "main");
  const result = publishContent({
    ...options(root),
    dryRun: true,
    runBuild: () => assert.fail("dry run must not build"),
  });
  assert.ok(result.files.includes(relative(root, article.file)));
  assert.equal(readFileSync(article.file, "utf8"), original);
  assert.equal(git(root, "diff", "--cached", "--name-only"), "");
  assert.equal(git(remote, "rev-parse", "main"), before);
});
