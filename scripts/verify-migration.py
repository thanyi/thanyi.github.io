#!/usr/bin/env python3
"""Verify historical routes, headings, code, images and feeds in the built site."""
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
report_path = root / "data/migration.json"
if not report_path.exists():
    report_path = root / "src/data/migration.json"
report = json.loads(report_path.read_text())
errors = []


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_article = False
        self.in_code = False
        self.in_anchor = False
        self.ids = set()
        self.codes = []
        self.references = []
        self.body_text = []
        self.code = ""
        self.last_code = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "a" and "anchor" in (attrs.get("class") or "").split():
            self.in_anchor = True
        if attrs.get("id") == "article":
            self.in_article = True
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if self.in_article and tag == "code":
            self.in_code = True
            self.code = ""
        if tag in {"img", "script", "link", "a"}:
            value = attrs.get("src") if tag in {"img", "script"} else attrs.get("href")
            if value:
                self.references.append((tag, value))

    def handle_endtag(self, tag):
        if tag == "a" and self.in_anchor:
            self.in_anchor = False
        if tag == "article":
            self.in_article = False
        if tag == "code" and self.in_code:
            self.in_code = False
            self.last_code = self.code
        if tag == "pre" and self.in_article:
            self.codes.append(self.last_code)

    def handle_data(self, text):
        if self.in_code:
            self.code += text
        if self.in_article and not self.in_anchor:
            self.body_text.append(text)


def output_for(path):
    path = unquote(urlsplit(path).path)
    direct = dist / path.lstrip("/")
    if direct.is_file():
        return direct
    return direct / "index.html"


def strip_heading_attrs(markdown):
    """Undo the {#legacy-anchor} attributes added by the Hugo migration."""
    lines = markdown.splitlines(keepends=True)
    in_fence = False
    fence_char = ""
    output = []
    for line in lines:
        fence = re.match(r"^\s*(`{3,}|~{3,})", line)
        if fence:
            if not in_fence:
                in_fence = True
                fence_char = fence.group(1)[0]
            elif fence.group(1)[0] == fence_char:
                in_fence = False
            output.append(line)
            continue
        if not in_fence:
            line = re.sub(
                r"^(#{1,6}[ \t]+.*?)[ \t]+\{#[^}]+\}[ \t]*(\r?\n)?$",
                lambda match: match.group(1) + (match.group(2) or ""),
                line,
            )
        output.append(line)
    return "".join(output)


assert len(report["posts"]) == 27, "Expected all 27 original posts"
code_count = 0
sources = {}
for source in list((root / "content/posts").rglob("*.md")) + list((root / "content/posts").rglob("*.mdx")):
    match = re.match(r"^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)", source.read_text())
    if not match:
        continue
    url = re.search(r"(?m)^url:\s*(['\"]?)([^\n]+?)\1\s*$", match[1])
    if url:
        sources[url[2]] = (source, source.read_text()[match.end():])
for post in report["posts"]:
    output = output_for(post["url"])
    if not output.is_file():
        errors.append(f"Missing post: {post['url']}")
        continue
    page = Page()
    page.feed(output.read_text())
    if not "".join(page.body_text).strip():
        errors.append(f"Empty article: {post['url']}")
    # Deliberate future edits to a recovered Markdown file are allowed. Compare
    # the original snapshot only while the source is still the recovered version.
    # Match by permalink, so renaming an article never requires editing migration data.
    source_entry = sources.get(post["url"])
    if source_entry is None:
        errors.append(f"Missing source for historical permalink: {post['url']}")
        continue
    source, markdown_body = source_entry
    markdown_body = strip_heading_attrs(markdown_body)
    expected_body = post.get("markdownBodySha256")
    unchanged = hashlib.sha256(markdown_body.encode()).hexdigest() == expected_body if expected_body else hashlib.sha256(source.read_bytes()).hexdigest() == post["sourceSha256"]
    if not unchanged:
        continue
    digest = hashlib.sha256(re.sub(r"\s+", "", "".join(page.body_text)).encode()).hexdigest()
    if digest != post["bodySha256"]:
        errors.append(f"Article text changed during rendering: {post['url']}")
    for heading in post["headings"]:
        if heading["slug"] and heading["slug"] not in page.ids:
            errors.append(f"Missing original heading: {post['url']}#{heading['slug']}")
    if len(page.codes) != len(post["codeBlocks"]):
        errors.append(f"Code count changed: {post['url']}: {len(page.codes)} != {len(post['codeBlocks'])}")
    for index, (code, expected) in enumerate(zip(page.codes, post["codeBlocks"])):
        digest = hashlib.sha256(code.rstrip("\n").encode()).hexdigest()
        if digest != expected["sha256"]:
            errors.append(f"Code content changed: {post['url']} block {index + 1}")
        code_count += 1

for legacy in report["legacyPages"]:
    if not output_for(legacy["path"]).is_file():
        errors.append(f"Missing historical page: {legacy['path']}")

# Follow all local references in the generated HTML, including redirects.
checked = 0
for file in dist.rglob("*.html"):
    page = Page()
    page.feed(file.read_text())
    route = "/" + file.relative_to(dist).as_posix().removesuffix("index.html")
    for tag, reference in page.references:
        if reference.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
            continue
        resolved = urlsplit(urljoin("https://thanyi.github.io" + route, reference))
        if resolved.hostname != "thanyi.github.io":
            continue
        if not output_for(resolved.path).is_file():
            errors.append(f"Broken local {tag}: {route} -> {reference}")
        checked += 1

atom = ET.parse(dist / "atom.xml")
rss = ET.parse(dist / "rss.xml")
assert len(atom.findall("{http://www.w3.org/2005/Atom}entry")) >= 27
assert len(rss.findall("./channel/item")) >= 27
ET.parse(dist / "sitemap.xml")
ET.parse(dist / "sitemap-index.xml")
assert (dist / "pagefind/pagefind.js").is_file(), "Missing search index"

if errors:
    print("\n".join(dict.fromkeys(errors)))
    sys.exit(1)
print(f"Verified: 27 posts, {code_count} unchanged code blocks, {len(report['legacyPages'])} historical pages, {checked} local references, Atom/RSS/sitemaps and search assets.")
