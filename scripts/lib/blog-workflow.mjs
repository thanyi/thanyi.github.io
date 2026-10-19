import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { parseDocument, stringify } from "yaml";

export const POSTS = "src/content/posts";

export function readPost(file) {
  const original = readFileSync(file, "utf8");
  const match = original.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`文章缺少顶部配置：${file}`);
  const document = parseDocument(match[1]);
  if (document.errors.length)
    throw new Error(`文章配置有误：${file}\n${document.errors[0].message}`);
  const data = document.toJS();
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error(`文章配置必须是键值对：${file}`);
  return { original, document, data, body: original.slice(match[0].length) };
}

export function writePost(file, post) {
  writeFileSync(
    file,
    `---\n${post.document.toString({ lineWidth: 0 })}---\n${post.body}`
  );
}

function postFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = join(directory, entry.name);
    return entry.isDirectory()
      ? postFiles(file)
      : /\.mdx?$/.test(entry.name)
        ? [file]
        : [];
  });
}

function nameFor(title) {
  const name = title
    .normalize("NFC")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/^[.\s]+|[.\s]+$/g, "");
  if (!name || name.startsWith("_") || Buffer.byteLength(name) > 220) {
    throw new Error("文章标题为空、过长或以 _ 开头，请换一个标题。");
  }
  return name;
}

export function createPost({ root, title, slug, now = new Date() }) {
  const name = nameFor(title);
  const urlName = (slug ?? title)
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  if (!urlName || /^\d+$/.test(urlName))
    throw new Error("网址名称不能为空或只有数字；可用 --slug my-note 指定。");
  const file = join(root, POSTS, `${name}.md`);
  const permalink = `/posts/${urlName}/`;
  if (existsSync(file))
    throw new Error(`文章已经存在，不会覆盖：${relative(root, file)}`);
  for (const existing of postFiles(join(root, POSTS))) {
    const data = readPost(existing).data;
    const fallback = `/posts/${relative(join(root, POSTS), existing)
      .replace(/\.mdx?$/, "")
      .toLowerCase()}/`;
    if ((data.permalink ?? fallback) === permalink)
      throw new Error(`网址已经被使用：${permalink}，请换一个 --slug。`);
  }
  const content = stringify({
    title: title.trim(),
    permalink,
    pubDatetime: now.toISOString(),
    description: "",
    tags: [],
    categories: [],
    draft: true,
  });
  mkdirSync(join(root, POSTS), { recursive: true });
  writeFileSync(file, `---\n${content}---\n\n`, { flag: "wx" });
  const imageDirectory = join(root, "public/images", urlName);
  mkdirSync(imageDirectory, { recursive: true });
  return { file, permalink, imageDirectory };
}

function git(root, args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trimEnd();
  } catch (error) {
    throw new Error(
      `Git 操作失败：${args[0]}\n${error.stderr?.toString().trim() || error.message}`
    );
  }
}

function authoringPath(path) {
  return (
    /^src\/content\/(posts|pages)\/.*\.mdx?$/.test(path) ||
    path.startsWith("public/")
  );
}

function changes(root) {
  const records = git(root, [
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
  ]).split("\0");
  const files = new Set();
  for (let index = 0; index < records.length; index++) {
    const record = records[index];
    if (!record) continue;
    const status = record.slice(0, 2);
    const path = record.slice(3);
    if (authoringPath(path)) files.add(path);
    if (/[RC]/.test(status)) {
      const previous = records[++index];
      if (previous && authoringPath(previous)) files.add(previous);
    }
  }
  return [...files].sort();
}

function resolvePost(root, target) {
  const directory = resolve(root, POSTS);
  const candidates = [
    resolve(root, target),
    resolve(directory, target),
    resolve(directory, `${target}.md`),
    resolve(directory, `${target}.mdx`),
  ];
  let file = candidates.find(candidate => {
    const path = relative(directory, candidate);
    return (
      path !== "" &&
      !path.startsWith(`..${sep}`) &&
      path !== ".." &&
      !isAbsolute(path) &&
      /\.mdx?$/.test(path) &&
      existsSync(candidate)
    );
  });
  if (!file) {
    const matches = postFiles(directory).filter(
      candidate => readPost(candidate).data.title === target
    );
    if (matches.length > 1)
      throw new Error(`有多篇同名文章，请输入具体文件路径：${target}`);
    file = matches[0];
  }
  if (!file)
    throw new Error(
      `找不到文章：${target}。请输入 posts 下的文件名或文章路径。`
    );
  return relative(root, file).split(sep).join("/");
}

export function summaryFrom(body) {
  const text = body
    .replace(/<!--[^]*?-->/g, " ")
    .replace(/^\s*(```|~~~)[^]*?^\s*\1[^\n]*$/gm, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/^\s*[#>\-*]+\s*/gm, "")
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 140 ? text.slice(0, 140).trimEnd() + "…" : text;
}

function relatedAsset(path, post) {
  const url = `/${path.replace(/^public\//, "")}`;
  const slug = post.data.permalink?.replace(/\/$/, "").split("/").at(-1);
  if (slug && url.startsWith(`/images/${decodeURIComponent(slug)}/`))
    return true;
  const references = [
    ...post.original.matchAll(/(?:\]\(\s*<?|(?:src|href)=["'])(\/[^\s)"'>]+)/g),
  ].map(match => match[1]);
  if (typeof post.data.ogImage === "string") references.push(post.data.ogImage);
  return references.some(reference => {
    try {
      return decodeURIComponent(reference.split(/[?#]/)[0]) === url;
    } catch {
      return false;
    }
  });
}

function defaultBuild(root) {
  const npm = process.env.npm_execpath;
  const command = npm ? process.execPath : "npm";
  for (const script of ["build", "verify:migration"]) {
    const result = spawnSync(command, [...(npm ? [npm] : []), "run", script], {
      cwd: root,
      stdio: "inherit",
    });
    if (result.error || result.status !== 0)
      throw new Error(`检查未通过（${script}），没有提交或推送。`);
  }
}

export function publishContent({
  root,
  target,
  message,
  dryRun = false,
  now = new Date(),
  runBuild = defaultBuild,
  log = console.log,
}) {
  if (git(root, ["branch", "--show-current"]) !== "main")
    throw new Error("请在 main 分支发布文章。");
  if (git(root, ["diff", "--cached", "--name-only"]))
    throw new Error("已有暂存的修改，请先处理它们；发布命令不会混入其他提交。");

  // Sync before modifying files. Git refuses a fast-forward that would overwrite local edits.
  if (!dryRun) {
    git(root, ["fetch", "origin", "main"]);
    const [ahead, behind] = git(root, [
      "rev-list",
      "--left-right",
      "--count",
      "HEAD...origin/main",
    ])
      .split(/\s+/)
      .map(Number);
    if (ahead && behind)
      throw new Error("本地与远程 main 已分叉，请先同步分支后再发布。");
    if (behind) git(root, ["merge", "--ff-only", "origin/main"]);
  }

  let files = changes(root);
  if (target) {
    const post = resolvePost(root, target);
    const content = readPost(join(root, post));
    files = [
      ...new Set([
        post,
        ...files.filter(
          path => path.startsWith("public/") && relatedAsset(path, content)
        ),
      ]),
    ];
  }
  if (!files.length) {
    const ahead = Number(
      git(root, ["rev-list", "--count", "origin/main..HEAD"])
    );
    if (ahead && !dryRun) {
      log(`正在推送 ${ahead} 个已保存的本地提交…`);
      git(root, ["push", "origin", "main"]);
      return { pushed: true, files: [] };
    }
    log("没有待发布的文章、页面或图片改动。");
    return { pushed: false, files: [] };
  }

  log(
    `本次发布 ${files.length} 个文件：\n${files.map(file => `  ${file}`).join("\n")}`
  );
  if (dryRun) return { pushed: false, files };

  const originals = new Map();
  const titles = [];
  let committed = false;
  let staged = false;
  try {
    for (const path of files) {
      if (!path.startsWith(`${POSTS}/`) || !existsSync(join(root, path)))
        continue;
      const file = join(root, path);
      const post = readPost(file);
      if (!post.body.trim()) throw new Error(`请先填写文章正文：${path}`);
      originals.set(file, post.original);
      titles.push(post.data.title || path);
      if (post.data.draft) {
        post.document.set("draft", false);
        post.document.set("pubDatetime", now.toISOString());
      } else {
        post.document.set("modDatetime", now.toISOString());
      }
      if (!String(post.data.description ?? "").trim())
        post.document.set("description", summaryFrom(post.body));
      writePost(file, post);
    }
    runBuild(root);
    git(root, ["add", "-A", "--", ...files]);
    staged = true;
    if (!git(root, ["diff", "--cached", "--name-only"])) {
      log("没有需要提交的内容。");
      return { pushed: false, files: [] };
    }
    git(root, [
      "commit",
      "-m",
      message ||
        (titles.length === 1 ? `发布文章：${titles[0]}` : "更新博客文章与图片"),
    ]);
    committed = true;
    try {
      git(root, ["push", "origin", "main"]);
    } catch (error) {
      throw new Error(
        `文章已提交保存在本地，但推送失败；修复网络或远程问题后，再运行 npm run publish 即可重试。\n${error.message}`
      );
    }
    log("已推送到 main，GitHub Actions 会自动更新网站。");
    return { pushed: true, files };
  } catch (error) {
    if (!committed) {
      if (staged) git(root, ["reset", "--quiet", "--", ...files]);
      for (const [file, original] of originals) writeFileSync(file, original);
    }
    throw error;
  }
}
