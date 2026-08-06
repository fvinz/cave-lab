# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, both real, neither dominant:

- **Locals and young people from Cave (RM) and dintorni**, most arriving from an Instagram link, deciding whether to follow, write, or show up to an event.
- **People following the Cave League** (the association's summer five-a-side football tournament), checking standings, matches, and teams under `/league/`.

The site also has to work as a **biglietto da visita** (calling card) for the association itself — the version shown to institutions, sponsors, other associations, or press deciding whether Cave Lab is worth taking seriously, not only the version a peer scrolls on a phone. Design and copy must read as credible to that audience too, not only playful to insiders.

## Product Purpose

The public site of Cave Lab, a youth association promoting the territory of Cave (RM, Italy): who they are, what they do, upcoming events, the Cave League tournament, a real photo gallery, and direct contact channels (WhatsApp, Instagram DM, email). Success is a visitor understanding the association in seconds and having an obvious, working way to act (join, follow, message) or, for the calling-card audience, coming away with a credible impression of a real, active organization.

## Positioning

The chemistry-lab identity is not decorative tone — it is the literal information architecture. Sections are numbered "Elemento 01–07", activities are laid out as a periodic table of six tiles (symbol, atomic-style number, name), the timeline is called "il quaderno degli esperimenti", the contact form's success state reads "Reazione riuscita!". The brand mark itself is a periodic-table tile ("Ca / Cave / Lab / 00033"). No neighboring association or comune site in the area structures its content this way; a competitor could copy the palette but not the structural metaphor without becoming a different product.

## Operating Context

- Static-content marketing site (Vite + React, no user accounts, no server-rendered app state) deployed to Vercel, custom domain `cave-lab.it` (apex redirects to `www.cave-lab.it`), continuous deployment from `main` on `github.com/fvinz/cave-lab`.
- A second, originally-standalone app — the **Cave League** tournament site (TanStack Router + Supabase, real teams/matches/standings) — is mounted as a static sub-app under `/league/*`. Old top-level League URLs (`/classifica`, `/calendario`, `/squadre`, `/giocatori/:id`, `/partite/:id`, `/admin/*`) 307-redirect to their `/league/...` equivalent for links shared during the actual June 2026 tournament.
- A scheduled cloud routine (`cave-lab-instagram-sync`, weekly, Monday 08:00 Europe/Rome) attempts to sync the Galleria section with new @cave__lab Instagram posts by committing to the same repo, which auto-deploys. It is explicitly best-effort (Instagram has no public API for this) and is instructed never to fabricate a post; a manual fallback flow (verify via browser, download the real thumbnail, edit `src/content.js`) exists and has been used successfully when the automated run did not produce a commit.
- Primary content-editing surface for non-visual changes is `src/content.js` (hero copy, stats, activities, events, Cave League summary, gallery posts, contact channels) — deliberately centralized so text edits don't require touching components.

## Capabilities and Constraints

- **Instagram gallery**: exactly 9 posts, real photos only (downloaded from the actual post's CDN image, never generated/invented), grid is a fixed 3×3 built for exactly that count — adding or removing posts off that number reopens an orphan-tile layout problem that was deliberately fixed.
- **Cave League data** (podium, stats, standings under `/league/`) is real tournament data from a Supabase-backed app; the summary site (`ELEMENTI`, `CAVE_LEAGUE` in `content.js`) must stay consistent with it, not be re-fabricated.
- **Periodic-table activity grid** (`ELEMENTI`, 6 tiles) is deliberately sized for a 3×2/2×3 grid; changing the count requires updating `.periodic-grid` CSS to avoid a spaiata (orphaned) row.
- Dark "amethyst geode" visual system (mineral background, crystal-dust sparkle layers, brushed-metal header/footer, silver hairlines) is a pinned reference from a user-supplied photo — not a default to second-guess.
- Fonts: Space Grotesk (display) + Inter (body) + Barlow Condensed (Cave League voice only).
- Contact channels are real and must stay accurate: WhatsApp +39 351 588 6516, email cave.lab2024@gmail.com, Instagram @cave__lab.

## Brand Commitments

- Name: **Cave Lab**. Logo: a periodic-table-style tile reading "Ca / Cave / Lab / 00033", user-supplied, recreated as inline SVG (fonts converted to a system grotesque stack so the mark never silently falls back to Arial).
- Visual reference: a photographed brushed-metal "Ca" plaque inside an amethyst geode — dark blue-violet mineral rock, sparkling crystals, silver engraving. The entire dark/mineral/crystal system was built to honor this specific image; it is not a category default and should not be "lightened" or genericized without the user reopening that decision explicitly.
- Voice: playful, warm, laboratory/chemistry-themed Italian ("Mescoliamo idee, inneschiamo reazioni di comunità", "Niente camici bianchi").
- Territory photo (Territorio section) is CC BY-SA 3.0 by rgiannotti1 via Wikimedia Commons; the license legally requires visible attribution and a link to both the author's page and the license — already implemented as a caption under the image and must not be removed even if a future variant restyles that section.

## Evidence on Hand

- Real Instagram post thumbnails and captions in `public/instagram/` (sourced live from @cave__lab, not stock).
- Real Cave League 2026 results: 12 teams, 158 players, 32 matches, 508 goals, champion Real Madrink (beat La Pizzicata 5–2 in the final), top scorer Francesco di Santo (28 goals) — sourced directly from the tournament's Supabase database, not invented.
- Real photo of Cave (RM) — the borgo on its ridge with the Monti Prenestini behind it — properly licensed and credited (see Brand Commitments).
- No membership count, event-attendance numbers, or founding-year statistic exists yet; an earlier placeholder stat block with invented numbers was deliberately removed rather than left in place — do not reintroduce invented figures.

## Product Principles

1. **The chemistry metaphor is structural, not skin-deep.** New sections should extend the periodic-table/lab-notebook/reaction vocabulary in their information architecture, not just their copy.
2. **Real data only.** Every number, photo, and testimonial shown must be independently verifiable; a missing real fact is handled by omission or an honest placeholder note, never a fabricated stand-in.
3. **Two audiences, one page.** Every section should survive being the first thing either a prospective young member or an outside institution sees — playful, but never unintelligible or unserious to the second reader.
4. **The pinned amethyst-geode world is load-bearing identity, not a mood.** Iterate within it; departing from it is a decision the user makes explicitly, not a default outcome of "improving" the design.
5. **Contact must always resolve to a real human channel.** (The original contact form was replaced with direct WhatsApp/Instagram/email links after discovering it silently failed to send — never reintroduce a submission path that can silently lose a message.)

## Accessibility & Inclusion

Primary CTAs and interactive text must clear WCAG AA contrast (≥4.5:1) against their background — this was a confirmed P0 fix (`/impeccable polish`, Aug 2026) after several colors on the dark mineral background originally failed it; no future variant should regress below that bar. Motion (sparkle fields, marquees, GSAP reveals) already respects `prefers-reduced-motion` throughout and that behavior must be preserved.
