# Simurgh-Linux

A sci-fi Linux desktop concept: a HUD-style desktop shell that runs from a single
HTML file — no build step, no dependencies, no network.

## Try it

- **[`Simurgh_HUD_Debian_v30.html`](Simurgh_HUD_Debian_v30.html)** — current build. Download it and open it in a modern browser.
- [`Simurgh_HUD_Debian_v28.html`](Simurgh_HUD_Debian_v28.html) — the base HUD that v30 is built on, kept untouched.
- [`index.html`](index.html) — the smaller “Simurgh OS — Command Deck” desktop prototype.

## v30 — refinement layer

v30 does not fork the HUD. `hud/v30.css` and `hud/v30.js` are injected as the last
`<style>` / `<script>` before `</body>`, so they win the cascade without touching a
single line of the base file.

**Polish**

- typographic pass: tabular numerals for clock and date, tighter small-caps tracking, antialiased rendering
- consistent `:focus-visible` rings, accent-coloured selection, thin skin-coloured scrollbars
- UI chrome no longer gets selected while dragging windows or the layout editor
- unified interaction feedback: hover, press, and running/stopped dock states
- calmer elevation: hairline borders, deeper shadows, inset top highlight on every surface
- motion discipline: one easing curve across the shell, full `prefers-reduced-motion` support
- responsive fixes at 1100 / 920 / 680 px — side rails, dock, launcher and windows stop crowding

**New — Atmosphere panel** (palette button, top right)

- five accent palettes (amber, cyan, mint, violet, ice) that repaint the whole skin through `--v25-*`
- scanlines, glow, calm scenery, reduce motion, high contrast
- preferences persist in `localStorage`
- `Ctrl` / `Cmd` + `K` opens the launcher with the caret in the search field

## Building

```bash
python3 tools/build_v30.py     # composes Simurgh_HUD_Debian_v30.html
```

`.github/workflows/build-v30.yml` runs the same command on every push that touches
`hud/**` or the base file and commits the composed HUD, so the downloadable single
file always matches the layer.
