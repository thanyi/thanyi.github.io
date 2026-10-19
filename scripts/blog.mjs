#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { relative } from "node:path";
import { createInterface } from "node:readline/promises";
import { createPost, publishContent } from "./lib/blog-workflow.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const [command, ...args] = process.argv.slice(2);
const positional = [];
const options = {};
for (let index = 0; index < args.length; index++) {
  const arg = args[index];
  if (arg === "--dry-run" || arg === "--help") options[arg.slice(2)] = true;
  else if (
    ["--slug", "--message"].includes(arg) &&
    args[index + 1] &&
    !args[index + 1].startsWith("--")
  )
    options[arg.slice(2)] = args[++index];
  else if (arg.startsWith("--")) {
    console.error(`未知选项或缺少参数：${arg}`);
    process.exit(1);
  } else positional.push(arg);
}

try {
  if (options.help || !["new", "publish"].includes(command)) {
    console.log(
      '新建：npm run new -- "文章标题" [--slug my-note]\n预览：npm run dev\n发布所有内容改动：npm run publish\n只发布一篇：npm run publish -- "文章标题"\n查看发布清单：npm run publish -- --dry-run'
    );
  } else if (command === "new") {
    let title = positional.join(" ");
    if (!title) {
      const prompt = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      try {
        title = await prompt.question("文章标题：");
      } finally {
        prompt.close();
      }
    }
    const post = createPost({ root, title, slug: options.slug });
    console.log(
      `已创建草稿：${relative(root, post.file)}\n图片目录：${relative(root, post.imageDirectory)}\n文章网址：${post.permalink}\n\n写好正文后运行 npm run publish；需要预览时运行 npm run dev。`
    );
  } else {
    publishContent({
      root,
      target: positional.length ? positional.join(" ") : undefined,
      message: options.message,
      dryRun: Boolean(options["dry-run"]),
    });
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
