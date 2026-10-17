#!/usr/bin/env python3
"""Copy available images from the author's old GitHub image host into public/."""
import concurrent.futures
import hashlib
import json
import re
from pathlib import Path
from urllib.parse import quote, unquote
from urllib.request import Request, urlopen

root = Path(__file__).resolve().parents[1]
posts = list((root / "src/content/posts").rglob("*.md"))
pattern = re.compile(r"https://(?:cdn|gcore)\.jsdelivr\.net/gh/thanyi/image/[^\s)\"<>]+")
urls = sorted({url for post in posts for url in pattern.findall(post.read_text())})
destination = root / "public/media/legacy"
destination.mkdir(parents=True, exist_ok=True)


def download(url):
    relative = url.split("/gh/thanyi/image/", 1)[1]
    name = hashlib.sha256(url.encode()).hexdigest()[:12] + "-" + unquote(relative.rsplit("/", 1)[-1])
    output = destination / name
    if output.exists():
        return url, "/media/legacy/" + quote(name), None
    candidates = [
        "https://raw.githubusercontent.com/thanyi/image/master/" + relative,
        "https://raw.githubusercontent.com/thanyi/image/main/" + relative,
        url,
    ]
    error = None
    for candidate in candidates:
        try:
            with urlopen(Request(candidate, headers={"User-Agent": "Ethanyi-blog-migration"}), timeout=12) as response:
                content_type = response.headers.get("Content-Type", "")
                data = response.read()
                if not content_type.startswith("image/"):
                    raise ValueError(f"Unexpected response type: {content_type}")
            output.write_bytes(data)
            return url, "/media/legacy/" + quote(name), None
        except Exception as exc:
            error = str(exc)
    return url, None, error


with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(download, urls))
mapping = {url: local for url, local, _ in results if local}
for post in posts:
    text = post.read_text()
    for url, local in mapping.items():
        text = text.replace(url, local)
    post.write_text(text)
report_path = root / "src/data/image-cache.json"
previous = json.loads(report_path.read_text()) if report_path.exists() else {"cached": {}, "unavailable": []}
report = {"cached": {**previous["cached"], **mapping}, "unavailable": [item for item in previous["unavailable"] if item["url"] not in mapping] + [{"url": url, "reason": reason} for url, local, reason in results if local is None]}
(root / "src/data/image-cache.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(f"Cached {len(mapping)}/{len(urls)} original images")
print(f"Unretrievable image URLs: {len(report['unavailable'])}")
