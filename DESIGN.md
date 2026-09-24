---
name: Cave Lab
description: Il sito dell'associazione giovani di Cave (RM) — laboratorio chimico giocoso dentro una grotta di ametista
colors:
  amethyst-deep: "#6B45D9"
  amethyst-light: "#9D7BFF"
  amethyst-text: "#B69BFF"
  malachite: "#3ECF9A"
  lilac-quartz: "#C9B4FF"
  rhodochrosite: "#FF7DAE"
  turquoise: "#5AD7E0"
  amber: "#FFB020"
  silver-lilac: "#ECE8F6"
  deep-rock: "#0A0812"
  glass-surface: "rgba(28, 22, 46, 0.72)"
  tile-cultura: "#7C3AED"
  tile-ambiente: "#22A55E"
  tile-eventi: "#FFC53D"
  tile-sociale: "#FF5C8A"
  tile-territorio: "#2CC7C7"
  tile-creativita: "#8C6BFF"
typography:
  display:
    fontFamily: "Space Grotesk, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
  league-display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontWeight: 700
rounded:
  sm: "10px"
  md: "18px"
  lg: "28px"
  pill: "999px"
spacing:
  3xs: "0.25rem"
  2xs: "0.5rem"
  xs: "0.75rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "4rem"
  2xl: "6rem"
  3xl: "8rem"
components:
  button-primary:
    backgroundColor: "{colors.amethyst-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "0.9rem 1.6rem"
  button-primary-hover:
    backgroundColor: "{colors.amethyst-deep}"
  button-ghost:
    backgroundColor: "{colors.glass-surface}"
    textColor: "{colors.silver-lilac}"
    rounded: "{rounded.pill}"
    padding: "0.9rem 1.6rem"
  element-card:
    textColor: "{colors.silver-lilac}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
---

# Design System: Cave Lab

## Overview

**Creative North Star: "The Amethyst Geode Laboratory"**

Cave Lab reads as a scientific specimen tag mounted inside a real amethyst geode — the pinned reference is a photograph of a brushed-metal "Ca / Cave / Lab / 00033" plaque bolted to dark, crystal-studded rock, and the entire system was built to honor that object literally, not as a mood board. The site lives in two registers at once: the deep mineral world (dark blue-violet rock, crystal-dust sparkle, silver hairlines, brushed-metal plates) is the *material*, and the chemistry-lab vocabulary (periodic-table tiles, "reazioni", "esperimenti", "il quaderno") is the *language spoken inside that material*. Neither is decoration on top of the other; they are the same idea told twice.

The system rejects two easy defaults: it is not a flat "dark mode" palette (every surface has depth — glass, metal, or crystal, never a solid flat fill pretending to be neutral), and it is not brutalist despite the periodic-table grid motif (no hard offset shadows, no diagonal snap-hover; the brutalist tile aesthetic from an earlier iteration was deliberately replaced with soft crystal glow and vertical lift).

**Key Characteristics:**
- Dark mineral canvas with layered radial gradients (never a flat single-color background)
- Two animated sparkle layers at non-harmonic periods, so the field never reads as a repeating texture
- Brushed-metal plates (header, footer, logo tile) as a distinct material from the crystal glass cards
- Every interactive surface lifts vertically toward the viewer on hover/focus, never diagonally
- One secondary "broadcast" register (amber-on-black, Barlow Condensed) reserved exclusively for the Cave League block, where content is real tournament data

## Colors

The palette reads as gemstones catching light against black rock: desaturated enough to stay legible as UI, saturated enough to feel mineral rather than corporate.

### Primary
- **Viola Ametista / Amethyst Violet** (`#9D7BFF` light / `#6B45D9` deep): the signature accent — kickers, active nav state, links, primary CTA fill. Two tonal steps exist on purpose: `amethyst-light` (`#9D7BFF`) is for text and small accents on dark backgrounds; `amethyst-deep` (`#6B45D9`) is reserved for filled surfaces (primary buttons) where white text must clear 4.5:1 — the lighter step fails that ratio and must never back white text.
- **Testo Ametista / Amethyst Text** (`#B69BFF`): the dedicated body/kicker-on-dark-background step (7.4:1 against the rock), distinct from the two above because neither of them was legible enough for running text.

### Secondary
- **Verde Malachite / Malachite Green** (`#3ECF9A`): success and confirmation contexts (WhatsApp channel accent, positive states).
- **Rosa Rodocrosite / Rhodochrosite Pink** (`#FF7DAE`): warm secondary accent (Instagram channel, playful highlights).
- **Turchese / Turquoise** (`#5AD7E0`): cool secondary accent, used sparingly for variety in the periodic-table tiles.
- **Quarzo Lilla / Lilac Quartz** (`#C9B4FF`): the system's "bright" tone — what used to be yellow before the mineral retheme; keep it pale-crystal, never saturated yellow, or it breaks the geode illusion.

### Tertiary
- **Ambra / Amber** (`#FFB020` with a `#FFF6E6` cream): the Cave League sub-system's entire palette. It exists to feel like a different, more energetic broadcast — deliberately the only place saturated warm color and Barlow Condensed type appear together. Do not bleed amber into the main site's sections; do not use the main palette's violets inside the League block's hero/podium.
- **Tile Accents** (`tile-cultura` `#7C3AED`, `tile-ambiente` `#22A55E`, `tile-eventi` `#FFC53D`, `tile-sociale` `#FF5C8A`, `tile-territorio` `#2CC7C7`, `tile-creativita` `#8C6BFF`): a distinct, brighter six-color family reserved exclusively for the six periodic-table activity tiles (`ELEMENTI`) and their gallery-fallback echo — one color per activity, driving each tile's `--tile-color` glow and border tint. Deliberately more saturated than the primary/secondary UI accents so each tile reads as its own "element," the way real periodic-table cells are color-coded by category.

### Neutral
- **Argento-Lilla / Silver-Lilac** (`#ECE8F6`): primary text, hairline borders, engraved linework (the territorio illustration, icon strokes).
- **Roccia Profonda / Deep Rock** (`#0A0812`): the base canvas color beneath all the radial gradients and sparkle layers — never used flat on its own as a visible surface.
- **Vetro Scuro / Dark Glass** (`rgba(28, 22, 46, 0.72)`): the translucent surface color for cards and the mobile nav panel — always translucent so the mineral background remains faintly visible through it.

### Named Rules
**The Deep-for-Fill Rule.** Any surface large enough to carry white or light text (button fills, solid CTA backgrounds) uses `amethyst-deep` (`#6B45D9`), never `amethyst-light`. This was a confirmed P0 accessibility fix; regressing to the lighter violet on a filled button drops contrast below AA.

**The One Broadcast Rule.** Amber + Barlow Condensed is reserved for the Cave League block only. It reads as a different, louder channel precisely because it never appears anywhere else on the page.

## Typography

**Display Font:** Space Grotesk (with system-ui fallback)
**Body Font:** Inter (with system-ui, -apple-system fallback)
**League Voice Font:** Barlow Condensed — Cave League block only, never the main site

**Character:** Space Grotesk gives headings a geometric, faintly technical edge — legible as "laboratory signage" rather than a soft display face — while Inter keeps body copy warm and readable against the dark mineral background. Barlow Condensed is a deliberate third voice: tall, compressed, sports-broadcast energy, confined entirely to the Cave League section so its arrival signals "this is live tournament data, not marketing copy."

### Hierarchy
- **Display / Hero title** (600 weight, `clamp` fluid scale, 1.15 line-height): the `h1` and section titles; measure capped at `16ch` for the hero so it shares the page's left edge with body sections instead of centering independently.
- **Body** (400 weight, 1.6 line-height): running copy; kept at a comfortable measure, never full-bleed on wide viewports.
- **Kicker / Label** (600 weight, uppercase, `amethyst-text` color): the "Elemento 0N · ..." eyebrow above every section — a numbered system precisely because the sequence itself is part of the periodic-table conceit, not decoration.

### Named Rules
**The Rhythm-of-Three Rule.** Vertical spacing between sections uses three deliberate weights — `space-3xl` opens a new "atto" (act), `space-2xl` separates ordinary sections, `space-xl` links sections that continue the same act — never one repeated interval for the whole page.

## Layout

Single-column content max-width `1200px` (`1320px` above 1440px), one shared left edge for hero and section text blocks. The page is organized into four narrative "atti" (Identità → Cosa facciamo → La prova → Il luogo e l'invito), each opening with the largest spacing step so scroll position itself communicates structure. The periodic-table activity grid is fixed at `repeat(3, 1fr)` / 2 / 1 across breakpoints specifically sized for its 6 tiles (3×2 → 2×3 → 1×6); the Instagram gallery is fixed at 3 columns for its 9 tiles for the same reason — changing either item count without updating the grid reopens an orphaned last row. Mobile breakpoint at `1023px` (not the more common `767px`) because the nav was found to wrap earlier than expected during testing.

## Elevation & Depth

Hybrid: flat mineral background at the base, with three distinct depth vocabularies layered on top depending on material. **Glass** (translucent dark cards, `--shadow-tile`: soft black drop shadow + a 1px hairline + a soft violet glow) reads as crystal catching ambient light. **Metal** (`--metal-plate` gradient + `--metal-edge` inset highlights) reads as the brushed plaque material — header, footer, and the logo tile use this exclusively, never the glass treatment. **Sparkle** (two independently-timed radial-gradient dust layers, `body::before`/`::after`, non-harmonic 5s/7s cycles) is the ambient environmental depth — it exists behind every section, distinguishing this system from a flat dark-mode default.

### Shadow Vocabulary
- **`--shadow-tile`** (`0 10px 26px rgba(0,0,0,.55), 0 0 0 1px rgba(233,229,244,.08), 0 0 24px rgba(157,123,255,.10)`): resting state for glass cards, buttons, canale contact tiles.
- **`--shadow-tile-hover`** (`0 16px 36px rgba(0,0,0,.6), 0 0 0 1px rgba(233,229,244,.14), 0 0 38px rgba(157,123,255,.22)`): hover/focus state — brighter glow, deeper shadow, never a color or position change.
- **`--metal-edge`** (`inset 0 1px 0 rgba(255,255,255,.28), inset 0 -1px 0 rgba(0,0,0,.6), 0 6px 18px rgba(0,0,0,.5)`): the brushed-metal plate edge highlight, used only on header/footer/logo tile.

### Named Rules
**The Crystals-Lift Rule.** Every interactive glass or metal surface moves vertically (`translateY`) toward the viewer on hover/focus and brightens its glow. Nothing shifts diagonally or scales aggressively — that was the previous brutalist iteration's language and was deliberately retired.

## Shapes

Rounded throughout, no sharp corners: `10px` (small controls) / `18px` (cards, tiles) / `28px` (large containers like the contact form panel) / full pill (`999px`, all buttons and the nav CTA). Borders are consistently `1–1.5px` hairlines in silver-lilac tones or a color-mixed tint of the element's accent color — never a heavy multi-pixel border. The one deliberately-flat exception is the Cave League podium and stat cards, which use straight-edged rectangular panels to read as a scoreboard rather than a crystal.

## Components

### Buttons
- **Shape:** full pill (`border-radius: 999px`), `1.5px` hairline border, `44px` minimum height.
- **Primary:** `amethyst-deep` fill, white text (AA-safe pairing — see Named Rules under Colors), `--shadow-tile` at rest.
- **Ghost:** translucent glass-surface fill, silver-lilac text, same border/shadow treatment as primary.
- **League:** amber gradient fill, dark ink text — exclusive to the Cave League block, never mixed with the main amethyst buttons on the same screen.
- **Hover/Focus:** `translateY(-2px)` lift + `--shadow-tile-hover` glow; icon inside the button (if any) slides `translateX(3px)`.

### Cards / Containers (Element tiles, canale contact tiles)
- **Corner Style:** `18–28px` radius depending on size.
- **Background:** a `165deg` linear-gradient from a `color-mix()` tint of the tile's own accent color into near-black — every tile is tinted glass, not a flat fill.
- **Shadow Strategy:** `--shadow-tile` at rest with a glow color-mixed from the tile's accent; `--shadow-tile-hover` plus `translateY(-4px)` (and a subtle `-0.5deg` rotation on the periodic-table tiles specifically) on hover.
- **Border:** `1px`, color-mixed from the tile's accent at ~50% into the base hairline color.

### Navigation
- **Header:** sticky, full-width brushed-metal plate (not glass), `88px` tall, switches to a hamburger below `1023px`.
- **Mobile panel:** opaque dark glass (raised opacity vs. resting cards specifically so page content never shows through the open menu), slides from `top: 100%` of the header, closes on Escape, outside click, or link selection; scrollable with a capped max-height so it never overflows a short viewport.
- **Active state:** the current section's nav link gets an underline in `amethyst-deep`.

### Signature Component: Periodic-Table Activity Tile
Six tiles, each a chemistry-style element card: a small muted atomic-number label top-left, a large two-letter "symbol" in the tile's accent color with a soft text-glow, a title, and a description — the direct visual echo of the brand's own logo plaque. This is the component most worth preserving verbatim in any future extension of the "cosa facciamo" pattern to new content.

## Do's and Don'ts

### Do:
- **Do** keep every interactive surface's hover state a vertical lift + glow brighten, per the Crystals-Lift Rule.
- **Do** use `amethyst-deep` (`#6B45D9`), never `amethyst-light` (`#9D7BFF`), as a filled button background — the lighter step fails AA contrast with white text.
- **Do** keep the Cave League block's amber/Barlow-Condensed voice exclusive to that section.
- **Do** treat the periodic-table grid (6 tiles) and Instagram gallery (9 tiles) counts as structural — update the CSS grid columns if the count ever changes, to avoid an orphaned row.
- **Do** keep every card and panel translucent or gradient-tinted; a flat opaque fill anywhere breaks the "everything is glass, metal, or crystal" material logic.

### Don't:
- **Don't** introduce a diagonal or scale-snap hover — that was the discarded brutalist-tile iteration's language, not this system's.
- **Don't** flatten the sparkle/vignette background layers to a solid color "for performance" without discussing it; they are load-bearing identity, confirmed against a user-supplied reference photo.
- **Don't** use raw saturated yellow for the "quarzo" accent — it must read as pale lilac-tinted crystal (`#C9B4FF`), not a warning color.
- **Don't** reintroduce a contact form; the current direct WhatsApp/Instagram/email channels replaced one that silently failed to send, per PRODUCT.md.
