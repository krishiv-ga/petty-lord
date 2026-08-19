# WP-041 — Integrated UI, Accessibility and Visual-Identity Audit

- **Status:** Blocked by WP-039
- **Wave:** 4
- **Execution:** Parallel-safe within Wave 4
- **Depends on:** WP-039
- **May run with:** WP-040, WP-042, WP-043
- **Must not run with:** WP-049
- **Primary skill:** `$ui-audit`
- **Required specialist skills:** `$critic`, `$packet`
- **Critic:** Required
- **Integrator:** WP-049
- **Release impact:** Final release candidate

## Objective

Adversarially audit and polish the integrated beta’s actual player interface until it is readable, keyboard-complete, accessible, visually coherent and unmistakably authored—without changing gameplay rules or replacing bespoke raster identity with a generic library vocabulary.

## Canonical inputs

- integrated beta and WAVE-03 screenshots/issues;
- [`TECH_STACK.md`](../TECH_STACK.md);
- [`designer/interface-content-and-production.md`](../designer/interface-content-and-production.md);
- UI foundation and production raster manifest;
- all primary screen flows.

## Owned paths

Expected ownership:

- presentation and interaction code under `src/ui/**`;
- CSS Modules/global visual tokens owned by UI;
- UI stories and visual/accessibility tests;
- UI-only raster display metadata/focal adjustments through the approved manifest seam, but not art regeneration;
- `wiki-site/development/visual-language.md` and UI accessibility guidance;
- `logs/agents/WP-041/**`.

Do not edit simulation, balance values, event weights, persistence/schema, production art pixels, package/lock/release config, or canonical narrative copy modules owned by WP-043. Hand those findings to their packet.

## Audit matrix

Audit each of these at 1280×720 and 1440×900, plus one constrained-height stress case:

- title/new/resume/error;
- main frame during Stable, Gravely Ill and dense Deathbed;
- raster map and territory targeting;
- lord rail/inspector;
- action preview/bargain/threat/secret exposure;
- two full Orders and defense reaction;
- chronicle with routine and urgent entries;
- public/private/stale/unknown/coerced information;
- forecast with uncertainty and three candidates;
- onboarding/help;
- mandatory decisions;
- save/error/debug separation;
- each major ending route and loss;
- missing/slow raster asset behavior.

## Deliverables

### 1. Screenshot-backed visual critique

Produce a ranked findings matrix for:

- hierarchy and scan path;
- generic dashboard/card-grid leakage;
- inconsistent materials/edges/tokens;
- excessive panels/pills/badges;
- map losing primacy;
- portraits/ribbons/status clutter;
- resource and Order readability;
- Deathbed density;
- action consequences hidden below fold;
- forecast/ending becoming spreadsheets;
- text over texture;
- raster icon ambiguity at actual size;
- unnecessary motion or visual noise.

Every P0/P1/P2 visual claim needs a screenshot and concrete correction.

### 2. Keyboard and focus audit

Verify complete keyboard paths for:

- new/resume;
- pause/speed;
- lord and territory selection;
- map action targeting/cancel;
- inspector and action selection;
- previews/bargains/confirm/cancel;
- Orders cancellation;
- forecast/help;
- mandatory decisions;
- ending/replay.

Fix:

- missing or invisible focus;
- irrational focus order;
- focus traps/return failures;
- shortcuts firing while typing;
- inaccessible raster hotspots/icon-only controls;
- hover-only facts;
- Escape dismissing mandatory decisions.

### 3. Accessibility audit

Run automated and manual checks for:

- WCAG AA contrast;
- semantic headings/regions/labels;
- accessible names and descriptions;
- no color-only state;
- live-region behavior for authoritative deltas without spam;
- text zoom and browser zoom resilience;
- reduced motion;
- target size;
- screen-reader sequence for forecast, action preview and ending reconstruction;
- forced-colors/high-contrast graceful behavior where practical.

Do not treat an axe-clean report as sufficient.

### 4. Non-generic visual polish

Strengthen the “royal chancery at the end of a dynasty” direction through restrained, reusable changes:

- composition and whitespace;
- typography roles;
- seals/ribbons/ledger/letter hierarchy;
- material-specific edges and surfaces;
- raster texture and ornament placement;
- political-state silhouettes and labels;
- transition timing/reduced-motion alternatives.

Reject redesigns that merely replace one dashboard theme with another. Do not introduce Tailwind, shadcn, MUI, themed Radix, SVG icons, vector sprites or icon fonts.

### 5. Raster-specific audit

At actual display sizes, check:

- 1×/2× selection and intrinsic dimensions;
- crop/focal point;
- alpha edges/halos;
- portrait/emblem consistency;
- icon pair confusion;
- state distinction beyond color;
- text baked into images;
- layout shift and missing fallback;
- map plate association with hotspots.

Image defects requiring regeneration are logged precisely for ChatGPT and block release when critical. Do not paint over them with generic icons or CSS filters.

### 6. Visual regression set

Curate a compact high-value screenshot suite covering the canonical states above. Avoid hundreds of brittle snapshots. Each baseline records viewport, seed/fixture, build SHA and intent.

### 7. Integrated critic

After fixes, use an independent critic unfamiliar with the implementation to navigate the production build at minimum viewport and keyboard-only. The critic should actively look for one remaining “AI dashboard” region or inaccessible path.

## Specific 1.0 regression: sealed confirmation versus danger

Carry forward the Storybook finding recorded before Wave 2: a red wax-seal icon becomes visually ambiguous when placed inside a solid red confirmation button.

Audit every action-preview and political-confirmation control for the following:

- ordinary **confirm/commit/seal** actions must not default to a solid danger-red container;
- a red wax seal must remain visually distinct from its surrounding clickable surface;
- preferred normal treatment is the vellum/page/surface family with an authored outline, inset edge, brass/ink/burgundy border, pressed state and visible focus, or an equally clear bespoke solution;
- red-filled/danger treatment is reserved for genuinely destructive, hostile, irreversible-loss or critical actions according to the semantic intent frozen by WP-029;
- normal commit versus danger must remain distinguishable in grayscale/high-contrast review and without relying on color alone;
- include a before/after regression capture of **“Seal and begin…”** beside a genuine destructive/breach action.

This specific ambiguity must already be fixed by the playable beta through WP-031. WP-041 owns the broader 1.0 visual-improvement pass: hierarchy, materials, density, polish and consistency across the whole game rather than redesigning the rules.

## Implementation contract

- UI fixes do not change authoritative gameplay outcomes.
- Copy changes beyond tiny labels go to WP-043.
- Technical/save/simulation failures go to WP-042.
- No vector asset/dependency can enter during polish.
- Use production projections and representative late-game fixtures.
- Prefer fixing hierarchy/layout over adding decoration.

## Acceptance tests

- [ ] Every critical flow is keyboard-complete with visible focus and correct focus return.
- [ ] Automated axe plus manual semantic/zoom/reduced-motion review clears P0/P1 issues.
- [ ] 1280×720 contains every critical control without clipping or hover-only dependency.
- [ ] Dense Deathbed state remains scannable and map/political priorities are clear.
- [ ] No primary region resembles a generic SaaS dashboard/card template after review.
- [ ] Ordinary sealed confirmation keeps a red seal legible on a non-danger surface and is visibly distinct from genuine destructive action styling.
- [ ] Production UI/assets/imports contain no SVG/icon-font/prohibited icon library.
- [ ] Raster assets are legible at actual sizes or have explicit blocking regeneration requests.
- [ ] Curated visual regression suite passes.
- [ ] Independent critic clears severe visual/accessibility findings.
- [ ] Standard gates and wiki sync pass.

## Required evidence

- before/after screenshot matrix, including sealed-confirmation versus destructive-action regression;
- keyboard path and focus-order evidence;
- axe/manual accessibility report;
- raster audit/contact excerpts and regeneration requests;
- vector-prohibition search;
- curated visual-regression list;
- auditor/implementer/critic logs.

## Agent topology

Parallel read-only audits may cover map/politics, operations and forecast/ending. One UI lead serially applies shared style/component fixes. One independent critic reviews the final production build.

## Logging

Create:

- `logs/agents/WP-041/auditor-map-politics-<name>.md`
- `logs/agents/WP-041/auditor-operations-<name>.md`
- `logs/agents/WP-041/auditor-forecast-ending-<name>.md`
- `logs/agents/WP-041/implementer-<name>.md`
- `logs/agents/WP-041/critic-<name>.md`

## Completion handoff

Provide resolved/deferred finding matrix, before/after captures, remaining asset-regeneration needs, accessibility status and integration readiness for WP-049.
