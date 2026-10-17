#!/usr/bin/env python3
"""Recover this blog from a Hexo output snapshot (beautifulsoup4 + markdownify)."""
import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path
from urllib.parse import quote, unquote, urljoin, urlsplit

from bs4 import BeautifulSoup
from markdownify import markdownify


def quoted(value):
    return json.dumps(value, ensure_ascii=False)


def recover(source, target):
    posts_dir = target / "src/content/posts"
    posts_dir.mkdir(parents=True, exist_ok=True)
    report = {"sourceCommit": "2a1d751547e791197ed9a447de637882b2b74e97", "posts": [], "missingImages": [], "legacyPages": [], "linkRepairs": []}
    files = sorted(p for p in source.glob("20??/*/*/*/index.html"))
    for path in files:
        soup = BeautifulSoup(path.read_text(), "html.parser")
        article = soup.select_one("#article-container")
        if article is None or soup.select_one("#post-info") is None:
            continue
        route = "/" + path.parent.relative_to(source).as_posix() + "/"
        title = soup.select_one("h1.post-title").get_text(strip=True)
        published = soup.select_one("time.post-meta-date-created")["datetime"]
        modified = soup.select_one("time.post-meta-date-updated")
        tags = list(dict.fromkeys(a.get_text(strip=True) for a in soup.select(".tag_share .tag-cloud a, .tag_share .tag_share_tags a")))
        if not tags:
            tags = list(dict.fromkeys(a.get_text(strip=True) for a in soup.select('a.post-meta__tags')))
        categories = list(dict.fromkeys(a.get_text(strip=True) for a in soup.select("a.post-meta-categories")))
        original_body = BeautifulSoup(str(article), "html.parser")
        for node in original_body.select("td.gutter, script, style"):
            node.decompose()
        body_digest = hashlib.sha256(re.sub(r"\s+", "", original_body.get_text()).encode()).hexdigest()
        summary = " ".join(" ".join(p.get_text(" ", strip=True) for p in article.select("p")[:3]).split())[:150]
        # Hexo's highlighting wraps code in a table with a separate line-number column.
        # Extract each actual code line before converting tables to Markdown.
        replacements = {}

        def preserve(node, content):
            token = f"HEXORECOVERYTOKEN{len(replacements):05d}END"
            replacements[token] = content
            p = soup.new_tag("p")
            p.string = token
            node.replace_with(p)

        code_blocks = []
        for figure in list(article.select("figure.highlight, pre")):
            if figure.name == "pre" and figure.find_parent("figure", class_="highlight"):
                continue
            code = figure.select_one("td.code pre") if figure.name == "figure" else figure
            if code is None:
                raise ValueError(f"Cannot recover code in {path}")
            lines = code.select("span.line")
            text = "\n".join(line.get_text() for line in lines) if lines else code.get_text("\n")
            lang = next((c for c in figure.get("class", []) if c != "highlight"), "text")
            lang = {"plain": "text", "cmd": "bat", "sh": "bash", "ps1": "powershell"}.get(lang, lang)
            fence = "`" * max(3, max((len(m.group()) + 1 for m in re.finditer(r"`+", text)), default=3))
            preserve(figure, f"\n{fence}{lang}\n{text}\n{fence}\n")
            code_blocks.append({"language": lang, "sha256": hashlib.sha256(text.rstrip("\n").encode()).hexdigest(), "lines": len(text.splitlines())})

        headings = []
        for heading in article.find_all(re.compile(r"^h[1-6]$")):
            for anchor in heading.select(".headerlink"):
                anchor.decompose()
            headings.append({"depth": min(6, int(heading.name[1]) + 1), "slug": heading.get("id", ""), "text": heading.get_text()})
            heading.name = f"h{min(6, int(heading.name[1]) + 1)}"

        image_count = 0
        for image in article.select("img"):
            original = image.get("data-lazy-src") or image.get("src", "")
            resolved = urljoin("https://thanyi.github.io" + route, original)
            parts = urlsplit(resolved)
            if parts.hostname == "thanyi.github.io":
                local = source / unquote(parts.path).lstrip("/")
                if local.is_file():
                    destination = target / "public" / local.relative_to(source)
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(local, destination)
                    resolved = quote(unquote(parts.path), safe="/,:@-._~")
                else:
                    report["missingImages"].append({"post": route, "source": original})
                    resolved = "/img/missing-image.svg"
            alt = image.get("alt") or image.get("title") or "文章配图"
            image.attrs = {"src": resolved, "alt": alt}
            image_count += 1
        for link in article.select("a[href]"):
            href = link["href"]
            label = link.get_text(strip=True)
            # A recovered note has two malformed reference links; the visible URL
            # contains the intended destination in both cases.
            if unquote(href) == "csdn博客" or (href == "https://www.csdn.net/" and label.startswith("https://www.bilibili.com/")):
                if label.startswith("https://"):
                    report["linkRepairs"].append({"post": route, "old": href, "new": label})
                    link["href"] = href = label
            if not href.startswith(("#", "mailto:", "tel:", "javascript:")):
                resolved = urljoin("https://thanyi.github.io" + route, href)
                parsed = urlsplit(resolved)
                link["href"] = parsed.path + ("?" + parsed.query if parsed.query else "") + ("#" + parsed.fragment if parsed.fragment else "") if parsed.hostname == "thanyi.github.io" else resolved
        for node in article.select("script, style, .headerlink"):
            node.decompose()
        # Literal pipes in a table cell must not become Markdown column separators.
        for cell in article.select("table th, table td"):
            for text in cell.find_all(string=True):
                if "|" in text:
                    text.replace_with(str(text).replace("|", "HEXORECOVERYPIPE"))
        body = markdownify(str(article), heading_style="ATX", bullets="-", escape_underscores=True, keep_inline_images_in=["p", "a", "td"]).strip()
        body = body.replace("HEXORECOVERYPIPE", "\\|")
        for token, content in replacements.items():
            body = body.replace(token, content)
        cache = target / "src/data/image-cache.json"
        if cache.exists():
            for remote, local in json.loads(cache.read_text())["cached"].items():
                body = body.replace(remote, local)
        frontmatter = [f"title: {quoted(title)}", f"pubDatetime: {published}"]
        if modified:
            frontmatter.append(f"modDatetime: {modified['datetime']}")
        frontmatter.extend([f"description: {quoted(summary)}", f"tags: {quoted(tags)}", f"categories: {quoted(categories)}", f"legacyHeadings: {quoted(headings)}"])
        output = posts_dir / path.parent.relative_to(source).with_suffix(".md")
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text("---\n" + "\n".join(frontmatter) + "\n---\n\n" + body + "\n")
        report["posts"].append({"title": title, "url": route, "file": str(output.relative_to(target)), "sourceSha256": hashlib.sha256(output.read_bytes()).hexdigest(), "bodySha256": body_digest, "codeBlocks": code_blocks, "imageCount": image_count, "headings": headings})

    # Preserve taxonomy and archive routes so existing inbound links still resolve.
    for directory in ["tags", "categories", "archives", "page"]:
        for path in sorted((source / directory).rglob("index.html")):
            soup = BeautifulSoup(path.read_text(), "html.parser")
            route = "/" + path.parent.relative_to(source).as_posix() + "/"
            heading = soup.select_one("h1")
            category_parts = path.parent.relative_to(source / directory).parts if directory == "categories" else []
            report["legacyPages"].append({"path": route, "kind": directory, "title": heading.get_text(strip=True) if heading else "", "category": category_parts[-1] if category_parts else None})

    friends = BeautifulSoup((source / "link/index.html").read_text(), "html.parser")
    friend_lines = []
    for item in friends.select(".flink-list-item"):
        link = item.select_one("a")
        name = item.select_one(".flink-item-name").get_text(strip=True)
        desc = item.select_one(".flink-item-desc").get_text(strip=True)
        friend_lines.append(f"- [{name}]({link['href']})" + (f"：{desc}" if desc else ""))
    friend_info = "\n\n## 我的友链信息\n\n```yaml\nname: Ethanyi's Blog\nlink: https://thanyi.github.io/\navatar: https://thanyi.github.io/img/avatar.jpeg\ndescr: 记录网络安全、编程实践与学习过程中的思考。\n```\n"
    (target / "src/content/pages/friends.md").write_text('---\ntitle: "友链"\ndescription: "朋友们与常读的博客。"\n---\n\n' + "\n\n".join(friend_lines) + friend_info)
    destination = target / "src/data/migration.json"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Recovered {len(report['posts'])} posts; {len(report['missingImages'])} missing original images")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Extracted original Hexo output")
    parser.add_argument("--target", type=Path, default=Path.cwd())
    args = parser.parse_args()
    recover(args.source.resolve(), args.target.resolve())
