#!/usr/bin/env python3
"""Bakes dev.html + src/* into a single self-contained HTML file."""

import re, base64, os

BASE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE, "dev.html"), "r", encoding="utf-8") as f:
    html = f.read()

# 1. Inline font src: url("src/font_*.woff2") → data URIs
def font_to_data_uri(m):
    path = os.path.join(BASE, m.group(1))
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return f'url("data:font/woff2;base64,{b64}")'

html = re.sub(r'url\("(src/font_[^"]+\.woff2)"\)', font_to_data_uri, html)

# 2. Inline regular JS libs: <script src="src/*.js"></script>
def js_to_inline(m):
    path = os.path.join(BASE, m.group(1))
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    return f"<script>{content}</script>"

html = re.sub(
    r'<script src="(src/(?:react|react-dom|babel|lucide)\.js)"></script>',
    js_to_inline,
    html,
)

# 3. Inline app.jsx as <script type="text/babel"> (no src attr → works from file://)
jsx_path = os.path.join(BASE, "src", "app.jsx")
with open(jsx_path, "r", encoding="utf-8") as f:
    jsx_content = f.read()

html = re.sub(
    r'<script type="text/babel" src="src/app\.jsx"[^>]*></script>',
    lambda m: f'<script type="text/babel" data-presets="react">\n{jsx_content}\n</script>',
    html,
)

out_path = os.path.join(BASE, "Leistungsvergleich (standalone).html")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(html)

size_mb = os.path.getsize(out_path) / 1024 / 1024
print(f"✓ Standalone gebaut: {os.path.basename(out_path)} ({size_mb:.1f} MB)")
