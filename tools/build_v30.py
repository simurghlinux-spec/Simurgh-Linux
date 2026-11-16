#!/usr/bin/env python3
"""Compose Simurgh_HUD_Debian_v30.html from the v28 base plus the v30 layer.

The base HUD is ~800 KB, so the improved build is generated instead of being
hand-edited: hud/v30.css and hud/v30.js are injected as the last <style> and
<script> blocks before </body>, which is what makes them win the cascade.

    python3 tools/build_v30.py
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "Simurgh_HUD_Debian_v28.html"
OUT = ROOT / "Simurgh_HUD_Debian_v30.html"
CSS = ROOT / "hud" / "v30.css"
JS = ROOT / "hud" / "v30.js"

MARK = 'data-v30-layer="1"'


def main() -> int:
    for f in (BASE, CSS, JS):
        if not f.is_file():
            raise SystemExit(f"missing required file: {f.relative_to(ROOT)}")

    html = BASE.read_text(encoding="utf-8")
    if MARK in html:
        raise SystemExit(f"{OUT.name} already contains the v30 layer")

    html = html.replace(
        "<title>Simurgh HUD · Debian v27 Ultra</title>",
        "<title>Simurgh HUD · Debian v30 Ultra</title>",
        1,
    )

    layer = (
        f'<style id="v30-layer" {MARK}>\n'
        + CSS.read_text(encoding="utf-8").rstrip()
        + "\n</style>\n"
        + '<script id="v30-layer-js">\n'
        + JS.read_text(encoding="utf-8").rstrip()
        + "\n</script>\n"
    )

    if "</body>" not in html:
        raise SystemExit("base file has no </body> to inject into")

    html = html.replace("</body>", layer + "</body>", 1)
    OUT.write_text(html, encoding="utf-8")

    print(f"wrote {OUT.name}: {OUT.stat().st_size:,} bytes "
          f"(base {BASE.stat().st_size:,} + layer {len(layer):,})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
