#!/usr/bin/env python3
"""Generates index.html from dev.html for GitHub Pages (CDN-based, no local libs)."""

import re, os

BASE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(BASE, "dev.html"), "r", encoding="utf-8") as f:
    html = f.read()

# 1. Remove all @font-face blocks (they reference gitignored local woff2 files)
html = re.sub(r'/\*[^*]*\*/\s*@font-face\s*\{[^}]+\}\s*', '', html)

# 2. Add Google Fonts link after <head>
google_fonts = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700'
    '&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">\n'
)
html = html.replace(
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com">\n',
    google_fonts,
)

# 3. Replace local script tags with CDN equivalents
cdn = {
    '<script src="src/react.js"></script>':
        '<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>',
    '<script src="src/react-dom.js"></script>':
        '<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>',
    '<script src="src/babel.js"></script>':
        '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>',
    '<script src="src/lucide.js"></script>':
        '<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>',
}
for local, remote in cdn.items():
    html = html.replace(local, remote)

out_path = os.path.join(BASE, "index.html")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(html)

print(f"✓ index.html erstellt ({os.path.getsize(out_path) // 1024} KB)")
