# WP-012 — Visual Language, Raster Asset Contract and UI Foundation

- **Status:** Blocked by WP-000
- **Wave:** 1
- **Execution:** Parallel-safe within Wave 1
- **Depends on:** WP-000
- **May run with:** WP-010, WP-011
- **Must not run with:** WP-019 or any Wave 2 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$ui-audit`, `$critic`
- **Critic:** Required
- **Integrator:** WP-019
- **Release impact:** Foundation checkpoint candidate

## Objective

Establish an unmistakably authored visual language and accessible reusable UI foundation before feature screens fan out, using unstyled Radix behavior, bespoke CSS, and raster-only visual assets.

The result must make it difficult for later agents to produce a generic “vibe-coded dashboard.” It is a component and composition contract, not the final full game screen.

## Canonical inputs

- [`TECH_STACK.md`](../TECH_STACK.md)
- [`AGENTS.md`](../AGENTS.md), especially visual rules
- [`designer/interface-content-and-production.md`](../designer/interface-content-and-production.md)
- [`designer/world-and-actors.md`](../designer/world-and-actors.md)
- [`designer/README.md`](../designer/README.md)
- [`designer/art/stained_glass_character_prompt.md`](../designer/art/stained_glass_character_prompt.md)
- [`designer/art/stained_glass_character_variant_prompt.md`](../designer/art/stained_glass_character_variant_prompt.md)
- approved rival-lord identity masters under `assets/characters/`
- Storybook/tooling baseline from WP-000

## Owned paths

Expected ownership:

- `src/ui/foundation/**`
- `src/ui/primitives/**`
- `src/ui/fixtures/**`
- `src/ui/**/*.stories.*` only for foundation/primitives
- `src/assets/raster/**` asset-loading contracts, not final manifest owned later by WP-034
- `public/assets/placeholders/ui/**`
- `.storybook/**` after WP-000 baseline
- `tests/ui/foundation/**`
- `wiki-site/development/visual-language.md`
- `wiki-site/architecture/ui-and-assets.md`
- `logs/agents/WP-012/**`

Do not implement the final map, lord inspector, action workflow, forecast, onboarding or ending screens. Do not modify package/lock files, simulation, content, root app shell, work-packet index or compact logs.

## Deliverables

### 1. Visual-language decision record

Create a concise implemented decision record for the working direction:

> **The royal chancery at the end of a dynasty.**

Define and demonstrate:

- palette roles: vellum, ink, smoke, brass/iron, royal burgundy, faded blue-green, warning/blood, Church/gold and disabled/ash;
- typography roles and safe fallback strategy;
- border, seal, ribbon, ledger, letter, portrait-medallion, tooltip and focus treatments;
- spacing and density appropriate to a 1280×720 minimum layout;
- visual hierarchy for public, private, stale, unknown, coerced, occupied, invalid and urgent states;
- texture/noise use with performance and legibility constraints;
- motion principles and reduced-motion equivalents;
- explicit examples of rejected generic patterns.

The decision record must show the system in Storybook, not merely describe adjectives.

### 2. UI-library decision and wrapper layer

Use **Radix Primitives only for behavioral/accessibility problems**. Wrap every used primitive in project-owned components with bespoke styles.

Approved initial wrappers may include:

- Dialog and AlertDialog;
- Tooltip;
- Popover;
- Tabs;
- ScrollArea;
- VisuallyHidden;
- Select only when a native control cannot meet the interaction need.

Do not use Radix Themes or Radix Icons.

Document and enforce the production decision:

- Heroicons, Lucide, Tabler, Phosphor, Font Awesome, Iconify and similar sets are not installed because their normal production form is SVG/icon-font and their visual vocabulary is generic;
- no inline `<svg>`, `.svg` asset, vector sprite, icon font, CSS mask sourced from SVG, or runtime SVG rasterization;
- raster icons are supplied as PNG/WebP assets and rendered through one shared component.

Add a test/repository check that fails on prohibited imports and shipped SVG assets in application/public asset paths. Development dependencies may contain SVG internally; the check targets project-authored/shipped assets and imports, not `node_modules` internals.

### 3. RasterIcon and raster asset primitives

Implement `RasterIcon` and any minimal related primitives.

It must support:

- required logical width/height;
- 1×/2× `srcSet` or equivalent density manifest;
- decorative `alt=""` versus meaningful accessible label;
- icon-only control labeling;
- tooltip integration where useful;
- loading/error/missing-asset states;
- disabled, selected, warning and public/private overlays without altering the source image;
- crisp rendering at intended sizes without blanket `image-rendering: pixelated`;
- unit/story tests for dimensions, semantics and fallback.

Create a tiny neutral raster placeholder pack sufficient for stories. Use supplied ChatGPT assets or a maintained one-off image tool available in the environment; do not commit a custom image generator. Placeholder files must be visibly marked and listed for replacement.

### 4. Design tokens and CSS architecture

Create:

- normalized base styles;
- CSS custom-property tokens;
- typography/number styles;
- surfaces and edge treatments;
- focus ring and keyboard-visible states;
- responsive density tokens for 1280×720 and 1440×900;
- reduced-motion rules;
- high-contrast/forced-colors considerations where possible;
- CSS Modules conventions that prevent global leakage.

Do not create a generic token system with dozens of arbitrary colors and radii. Tokens should map to this game’s political/material vocabulary.

### 5. Foundation components

Implement and story-test a focused set of reusable primitives:

- primary/secondary/danger/text buttons;
- icon-and-label action button using raster assets;
- compact resource datum/strip item;
- seal/status marker;
- allegiance ribbon;
- parchment/letter panel;
- inspector section and reason row;
- tab/segmented navigation;
- tooltip/popover/dialog wrappers;
- chronicle line;
- empty, loading, disabled and error states;
- visible intelligence-age and unknown-state treatment;
- live-region/delta announcement primitive.

Avoid one universal `Card` component that later turns the interface into repeated boxes. Components should reflect semantic political objects.

### 6. Composition spikes

Create Storybook-only compositions using realistic copy lengths and raster placeholders:

1. a lord portrait strip with public Pledge, private Leaning, Under Duress, dispossessed and unread states;
2. an action preview letter showing duration, costs, collateral, visibility, known consequences and cancellation loss;
3. a compact crisis frame fragment combining resource strip, parchment panel, chronicle and mandatory decision;
4. a raster-map hotspot fixture over a static raster plate fragment, proving keyboard focus and DOM positioning without SVG/canvas.

These are not final screens, but must demonstrate that the visual language can carry dense strategy information without becoming SaaS UI.

### 7. Storybook and visual evidence

Provide stories at 1280×720 and 1440×900 for:

- default, hover, focus, disabled and error;
- long names/copy;
- stale/unknown/private/public states;
- reduced motion;
- keyboard traversal;
- missing raster asset;
- low-height viewport pressure.

Add maintained Storybook interaction/accessibility tests where the WP-000 setup supports them. Add Playwright or Storybook screenshot baselines for the key composition spikes.

### 8. Accessibility contract

Verify:

- keyboard operation and sane focus return for dialogs/popovers;
- visible focus on raster map hotspots and icon controls;
- no color-only status;
- 16px minimum normal body text unless a documented compact exception remains readable;
- WCAG AA contrast for text and interactive state;
- accessible names for every meaningful icon/action;
- reduced-motion behavior;
- live announcements for authoritative deltas without repeated spam.

## Implementation contract

- Visible styling is project-owned CSS; Radix supplies behavior only.
- Production/shipped UI contains no SVG/icon-font dependency.
- The raster map contract is semantic DOM over raster plate, never an SVG path map.
- Foundation components do not import game simulation rules or mutate authoritative state.
- Stories use fixtures/projections rather than constructing hidden game state.
- No final art is fabricated by WP-012; approved character masters are real production identity references and neutral placeholders are clearly replaceable.
- Do not optimize texture or ornament at the expense of scanability.

## Acceptance tests

- [ ] Storybook builds with all required foundation stories.
- [ ] Key composition screenshots look authored and do not use a generic sidebar/card-grid/dashboard template.
- [ ] `RasterIcon` handles density, semantics, errors and icon-only controls correctly.
- [ ] Project application/public paths contain no authored SVG files, inline SVG, icon fonts or prohibited icon-library imports.
- [ ] Raster hotspot fixture is keyboard operable and has visible focus.
- [ ] All public/private/stale/unknown/coerced states have non-color indicators.
- [ ] Radix wrapper focus behavior and accessibility tests pass.
- [ ] Reduced-motion and 1280×720 fixtures remain usable.
- [ ] CSS/token docs and component contracts are in the wiki.
- [ ] `$ui-audit` produces screenshot-backed findings.
- [ ] Independent critic findings are resolved or explicitly handed to WP-019.
- [ ] Standard gates pass.

## Required evidence

- Storybook build;
- visual screenshots at both target viewports;
- keyboard and axe results;
- prohibited-vector dependency/asset search;
- raster placeholder inventory;
- visual decision record and rejected-pattern examples;
- implementer, UI-audit and critic logs.

## Agent topology

A lead implementer owns the design tokens/component API. It may delegate:

- raster asset semantics and `RasterIcon` tests;
- Radix behavior wrappers;
- Storybook composition fixtures;
- accessibility checks;

only when paths remain disjoint.

Run `$ui-audit` as a specialist pass. Then use an independent critic focused on genericness, density, accessibility, vector leakage, over-abstraction and whether components fit the actual political game rather than a component showcase.

WP-019 freezes the shared UI foundation after integrating content asset slots and app tooling.

## Logging

Create:

- `logs/agents/WP-012/implementer-<name>.md`
- `logs/agents/WP-012/auditor-<name>.md`
- `logs/agents/WP-012/critic-<name>.md`

Do not edit shared status or packet index.

## Completion handoff

Document component exports, token names, raster asset contract, placeholder inventory, Storybook URLs/stories, visual risks and any integration changes WP-019 must make. State whether integration-ready.

## Active character-master amendment — 2026-08-19

Five approved full-body rival-lord masters now exist on `main`:

- `assets/characters/edric.png`
- `assets/characters/ysabel.png`
- `assets/characters/renard.png`
- `assets/characters/oswin.png`
- `assets/characters/mara.png`

These files are **canonical production identity masters**, not placeholders. WP-012 must use them in the lord-strip/portrait visual-language spike so the foundation is evaluated against the actual cast rather than generic silhouette art.

WP-012 must also freeze portrait slot semantics for later packets:

- `full`: existing approved full-body master; large showcase/event/ending contexts only;
- `bust`: dedicated generated chest-up / upper-torso portrait, front-facing or near-front three-quarter;
- `tight`: dedicated generated neck-up / head-and-shoulders portrait, front-facing or near-front three-quarter.

Production `bust` and `tight` assets are **not mechanical crops of the side-facing full figure**. They will be generated in WP-034 from the canonical identity masters using [`designer/art/stained_glass_character_variant_prompt.md`](../designer/art/stained_glass_character_variant_prompt.md). WP-012 may temporarily crop or placeholder those slots only to prove layout dimensions, and must clearly mark the fixture as temporary.

The close portrait contract intentionally increases stained-glass segmentation across faces/hair while preserving identity and readable anatomy. In small-size fixtures, preserve costume cues: Oswin must retain ecclesiastical language and Edric martial armor/mantle so the two older grey-haired men remain immediately distinguishable.
