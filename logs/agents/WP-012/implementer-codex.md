# Agent Log — WP-012 — Implementer/Codex

- **Packet:** WP-012 Visual Language, Raster Asset Contract and UI Foundation
- **Role:** Implementer
- **Branch/worktree:** `wp/WP-012-visual-language-and-ui-foundation`
- **Starting revision:** `5c154a87e899e924dc6c4f0395dad960b3367578`
- **Rebased revision:** `8a213c56abf33c066fa0545d32c3ef486cd5b944`
- **Ending revision:** `e789dc5a1b27b9b267be5b30554ff4bbdd9ac642`
- **PR:** blocked — GitHub CLI is not installed on this host
- **Status:** Complete locally; independent critic clear for integration

## Scope

Owned paths:

- `src/ui/foundation/**`
- `src/ui/primitives/**`
- `src/ui/fixtures/**`
- Foundation and primitive stories under `src/ui/**`
- `src/assets/raster/**`
- `public/assets/placeholders/ui/**`
- `.storybook/**`
- `tests/ui/foundation/**`
- `wiki-site/development/visual-language.md`
- `wiki-site/architecture/ui-and-assets.md`
- `logs/agents/WP-012/**`

Read-only canonical inputs include the approved rival masters in `assets/characters/**`. No file in
that directory was changed.

Explicitly out of scope:

- Final map, lord inspector, action workflow, forecast, onboarding, or ending screens
- Simulation, content, root app shell, package/lock files, shared work-packet/status/compacted logs
- Dedicated production bust/tight art, canonical gameplay rules, balance or save/schema changes

## Work performed

- Confirmed Gate 1 is open, WP-000 is integrated, and WP-012 has no overlapping active owner.
- Loaded the packet, canonical interface/actor/art inputs, frozen stack, wiki authority, Wave 0
  handoff, and the required `$packet`, `$ui-audit`, and `$critic` workflows.
- Rebased the packet branch onto updated GitHub `main` at `8a213c5` at the user’s request. The
  updated packet added the active character-master amendment; five character files restored from
  the pre-rebase stash were byte-identical to upstream and were not overwritten.
- Added scoped visual tokens and base rules for vellum, ink, smoke, brass/iron, burgundy,
  blue-green, warning/blood, Church gold, ash, typography, edges, shadows, focus, density and
  reduced-motion behavior.
- Vendored the final Cormorant Garamond Variable/Source Serif 4 Variable pairing from Fontsource
  5.3.0 with unmodified SIL OFL 1.1 license/provenance, local WOFF2 loading and non-blocking system
  fallbacks.
- Added project-owned political/material components and Button/RasterIcon/Radix behavior wrappers.
  No universal card, SVG, icon font or pre-themed component library was introduced.
- Added four realistic Storybook composition spikes: six-seat lord strip, long-form action preview
  letter, compact crisis frame and raster map with seven semantic DOM hotspots.
- Added a runnable visual-language decision record and Storybook a11y configuration.
- Added the raster descriptor/density/fallback validation contract and tests for forbidden vector
  paths, missing image fallback and icon-only accessible naming.
- Froze `full`, `bust` and `tight` rival portrait semantics in `characterPortraits`. The `full` slot
  points to the five production masters. The strip consumes visibly marked temporary 80px bust
  crops derived from those masters; 64px tight crops prove the later compact slot. Both temporary
  slots are flagged `placeholder: true` and `temporary-master-crop` for WP-034 replacement.
- Added deterministic browser screenshots, axe scans, keyboard/focus behavior, reduced-motion and
  realistic-copy regression tests. Updated the maintained wiki pages and placeholder inventory.

## Raster provenance

The three neutral fixture studies were generated with the built-in OpenAI image-generation tool,
then resized once with Pillow 12.3.0 into their documented 1×/2× PNG densities:

| Fixture | Prompt intent | Restrictions |
|---|---|---|
| Map plate | Aged vellum medieval kingdom map fragment, muted inked rivers/roads/territory washes, brass-and-burgundy chancery mood | Label-free, no text, no icons, no UI, no SVG/vector source |
| Anonymous portrait | Neutral anonymous lord silhouette in a small circular stained-glass/parchment medallion | No named character, heraldry, text or production identity |
| Blank seal | Dark burgundy blank wax seal with restrained stamped relief and transparent surround | No lettering, emblem, icon-font or vector source |

The five rival bust/tight fixture families were not generated variants. They are deterministic
square crops of the canonical full masters, downsampled with Pillow LANCZOS to the maintained
logical sizes. Their filenames, inventory, code status and visible lord-strip footer all call them
temporary. WP-034 must use `designer/art/stained_glass_character_variant_prompt.md` for dedicated
front/near-front variants.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| Treat the packet index as current status authority despite the packet header retaining “Blocked by WP-000” | `work-packets/INDEX.md` marks WP-012 Ready and Gate 1 open | WP-012 is legal to execute; shared status remains integrator-owned |
| Production checklist CLI unavailable on this host | No repository script/tool or callable host tool exists; WP-000 records the same limitation | Used packet acceptance tests and specialist skills; did not search/read a master checklist |
| Keep all changes inside packet-owned paths | Wave 1 shared seams are frozen by WP-000 | WP-019 can integrate without an early shared-barrel change |
| Use CSS-only restrained material texture | Preserves scanability and avoids loading ornament as state | Later art can replace surfaces without changing semantic components |
| Keep public/private/support/intelligence as separate visible evidence | Canonical interface rules prohibit implying that private Leaning is a vote | State components do not collapse hidden knowledge into one color/status |
| Consume canonical identity through temporary derived bust crops | Updated packet requires actual cast in the spike but explicitly reserves generated production variants for WP-034 | Foundation can be evaluated now; replacement remains mechanically clear and testable |

## Files changed

- Storybook: `.storybook/preview.ts`
- Raster contract/assets: `src/assets/raster/**`, `public/assets/placeholders/ui/**`
- UI foundation/primitives/fixtures/stories: `src/ui/foundation/**`, `src/ui/primitives/**`,
  `src/ui/fixtures/**`
- Evidence: `tests/ui/foundation/**`
- Documentation: `wiki-site/architecture/ui-and-assets.md`,
  `wiki-site/development/visual-language.md`
- Logs: `logs/agents/WP-012/**`

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| Gate/dependency/worktree check | Pass | Gate 1 open; WP-000 integrated; focused packet branch |
| `pnpm check` | Pass | 52 files checked; no fixes required |
| `pnpm typecheck` | Pass | TypeScript build clean |
| `pnpm test` | Pass | 12 unit tests across 4 files, including raster/portrait contracts |
| `pnpm test:sim` | Pass | 1 simulation-boundary test; UI does not cross simulation boundary |
| `pnpm build` | Pass | Vite production build clean; 192.73 kB app JS (60.96 kB gzip) |
| `pnpm build:storybook` | Pass | 147 modules; local fonts, all raster masters and fixture stories resolve |
| `pnpm wiki:check` | Pass | VitePress client/server build and page render clean |
| `pnpm test:e2e` | Pass | Existing minimum-viewport bootstrap smoke: 1 passed |
| packet Playwright suite | Pass | 11 passed; exact screenshots, local font loading, 16px facts, keyboard, axe, mandatory dialog, loading state, reduced motion and 200%-equivalent reflow |
| actual-size UI audit | Pass | See `auditor-codex.md`; 1280×720, 1440×900, 1280×640 and grayscale identity inspection |
| `git diff --check` | Pass | No whitespace errors |

## Critic findings and resolution

| Severity | Finding | Resolution/status |
|---|---|---|
| P2 | Final maintained/licensed font pairing was not implemented | Resolved with local Fontsource 5.3.0 Cormorant Garamond/Source Serif 4 variable WOFF2 assets, OFL/provenance and browser load assertions |
| P2 | Meaningful lord/map political facts fell below the 16px body floor | Resolved by raising statuses, relationships, map facts and related semantic details to 16px; browser assertions and refreshed baselines pass |
| P2 | Approved rival crops lacked a shared portrait-medallion treatment | Resolved with one project-owned circular double-brass frame around all six seats; actual-size/grayscale identity review refreshed |
| P3 | Loading-state evidence was incomplete | Resolved with a stable loading story, polite status/reduced-motion checks and RasterIcon loaded-state assertion |

UI audit findings and resolutions are recorded separately in `auditor-codex.md`.

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none; implemented the packet’s 2026-08-19 active character-master amendment
- Balance values changed: none
- Save/schema impact: none
- Wiki pages updated: UI/raster architecture and visual language

## Risks and deferred work

- WP-034 owns dedicated production bust/tight variants, final map art and final seal/icon inventory.
- Canonical full masters add about 11.5 MB to a Storybook build that imports the complete portrait
  contract. The shipped bootstrap production build does not import the foundation story module and
  remains 192.73 kB JS; later asset-manifest/loading work should preserve lazy context loading.
- Cross-browser screenshot evidence is deferred; the packet evidence uses maintained Playwright
  Chromium.
- GitHub CLI is unavailable on this host. Local commit can complete, but the required push/draft PR
  publish step is blocked until `gh` is installed and authenticated.

## Integration notes

- Shared contracts touched: none outside packet ownership
- Merge order constraints: integrate through WP-019 after WP-010 and WP-011 are complete
- Follow-up packets: WP-019 and WP-034
- Integration-ready: Yes locally — implementation commit `e789dc5`; independent critic is clear.
  Remote handoff/draft PR publishing remains blocked by the missing GitHub CLI prerequisite.
