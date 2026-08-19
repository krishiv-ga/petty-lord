# WP-034 — ChatGPT Raster Asset-Pack Intake, Validation and Integration

- **Status:** Blocked by WP-012 and approved raster asset drop
- **Wave:** 3
- **Execution:** Parallel-safe within Wave 3 once prerequisite is satisfied
- **Depends on:** WP-012/WP-019 asset contract and an approved ChatGPT-generated raster master pack
- **May run with:** WP-030, WP-031, WP-032, WP-033
- **Must not run with:** WP-039 or any Wave 4 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$ui-audit`, `$critic`
- **Critic:** Required
- **Integrator:** WP-039
- **Release impact:** Playable beta candidate

## Objective

Take an approved set of ChatGPT-generated raster masters and turn it into a complete, validated, optimized, versioned production asset pack matching the frozen UI/content slot contract—without inventing art, using SVG, or building a bespoke art pipeline.

Codex is the intake/integration agent, not the art director or image generator.

## Start prerequisite

Do not start until all of the following exist:

- WP-012 visual direction and asset-slot contract are integrated;
- a versioned approved master drop is present under the intake path established by WP-000/WP-019, recommended `art-source/approved/<pack-version>/`;
- the drop contains a manifest or inventory mapping each file to a canonical slot;
- usage/licensing/provenance states that the images were generated/approved for this project;
- the map plate dimensions and territory-hotspot coordinate space are agreed.

An incomplete drop may be audited, but the packet cannot become integration-ready until every release-critical slot has either a production asset or an explicitly accepted fallback.

## Canonical inputs

- [`TECH_STACK.md`](../TECH_STACK.md), raster/image contract
- WP-012 visual-language decision and asset-slot schema
- canonical asset slots from WP-011/WP-019
- screen requirements from WP-030–033 packet contracts
- approved raster master drop

## Owned paths

Expected ownership:

- `art-source/approved/**` metadata/inventory only; do not destructively edit original masters;
- `public/assets/game/**` production derivatives;
- `src/assets/manifest.*` and production asset loader/resolver;
- `tests/assets/**`;
- generated contact sheets/review images under `artifacts/asset-review/**` or a clearly non-runtime equivalent;
- `wiki-site/development/visual-language.md` asset inventory subsection or a disjoint asset page;
- `logs/agents/WP-034/**`.

Do not edit feature UI, simulation, content rules, root package/lock/config, packet index or compact logs. If required raster tooling is absent from the frozen toolchain, propose the exact maintained dependency/change to WP-039; do not independently modify the lockfile.

## Deliverables

### 1. Non-destructive intake audit

Inventory every master:

- canonical slot ID;
- source filename and pack version;
- pixel dimensions/aspect ratio;
- color mode and alpha presence;
- intended logical size/viewport role;
- crop/safe area;
- density target;
- source prompt/provenance reference where available;
- approval status;
- issues: text baked into image, cut-off subject, illegible small detail, inconsistent palette, wrong orientation, compression artifact, accidental transparency, background mismatch.

Do not overwrite masters. Record required regeneration requests for ChatGPT rather than crudely repainting or fabricating missing art in code.

### 2. Maintained raster processing

Use the maintained raster tooling pinned by the repository (for example Sharp or an equivalent approved package) for deterministic intake tasks:

- validate readable PNG/WebP;
- trim only when the slot contract allows;
- resize from masters into documented 1×/2× derivatives;
- preserve alpha and color profile where appropriate;
- encode optimized PNG/WebP through fixed settings;
- strip unnecessary metadata while retaining provenance in the manifest;
- refuse upscaling beyond the approved master resolution;
- calculate hashes and file-size report.

A small project script/config for repeatable validation/derivation is acceptable. Do not create a custom image generator, vectorizer, diffusion pipeline, editor, or web dashboard.

### 3. Production pack

Populate the release-critical slots, expected to include:

- title/key art;
- King portrait and deterioration states;
- player identity/crest or approved silhouette;
- five rival portraits;
- seven territory emblems/crests;
- one full raster map plate at required densities;
- Crown and Church symbols;
- resource icons;
- action-family icons;
- support/state icons: Leaning-known, Pledged, Committed, public Under Duress, private intelligence, stale, unknown, dispossessed;
- conditions: Tax Strain, Unrest, Occupied, garrison, Capital Royal/Occupied/Uncontrolled;
- seals, ribbons, letter/panel textures and limited decorative elements;
- ending/coronation accents where approved.

All production icons are raster. No SVG original or derivative may enter `public/assets/game`.

### 4. Typed production manifest

Implement a manifest that maps canonical slot IDs to:

- 1×/2× sources and intrinsic dimensions;
- mime/format;
- semantic role and default alt/label key behavior;
- crop/focal point where relevant;
- preload priority;
- transparent/opaque expectation;
- pack version and content hash;
- fallback slot;
- placeholder flag, which must be false for release-critical production slots.

Validate the manifest against WP-011’s schema. The runtime resolver returns clear missing/invalid errors in development and safe raster fallback in production.

### 5. Map asset alignment

Coordinate with WP-030 through the frozen map contract, not shared component edits.

- Validate the map plate against the canonical coordinate space.
- Provide exact intrinsic dimensions and hotspot transform fixture.
- Produce a review image with all seven hotspot bounds and labels overlaid. The review artifact may use raster drawing/tooling but is not shipped as the interactive map.
- Check borders/labels/roads do not conflict with dynamic ownership/occupation overlays.
- Check every hotspot remains large enough and visually associated with the intended territory.

No SVG map or generated vector path is allowed.

### 6. Contact sheets and consistency review

Generate deterministic raster contact sheets for human/critic review:

- portraits at actual UI sizes;
- icons at 16/20/24/32 logical pixels as applicable;
- territory emblems and support/condition states;
- map at target frame sizes;
- textures/panels with representative text overlay screenshots supplied by stories where possible.

Audit:

- consistent light source, palette and rendering style;
- silhouette/readability at actual size;
- no accidental modern/generic SaaS icon vocabulary;
- no confusing state pairs;
- no embedded gibberish text;
- sufficient contrast on vellum/dark/occupied contexts;
- visual distinction without relying solely on color.

Regeneration requests are first-class findings. Do not hide a bad asset with excessive CSS filters.

### 7. Performance and loading

Measure:

- total production pack size;
- critical initial payload;
- per-category size;
- decode/display behavior in target browsers;
- obvious layout shift caused by missing intrinsic dimensions.

Preload only genuinely critical assets. Lazy-load noncritical ending/secondary imagery. Do not add a complex asset streaming system for a seven-territory browser game.

### 8. Asset tests

Add tests that fail on:

- `.svg`, inline SVG/data URI, icon font or unsupported format in production manifest/asset paths;
- missing release-critical slot;
- wrong dimensions/aspect/density;
- 2× source smaller than required;
- unintended alpha/background;
- duplicate slot/file collision;
- manifest file missing on disk;
- placeholder marked as production;
- file above agreed size ceiling without waiver;
- map plate/hotspot coordinate mismatch.

## Implementation contract

- Original approved masters remain immutable.
- Processing is deterministic and reproducible.
- Runtime assets are raster PNG/WebP only.
- Codex does not invent or materially repaint production art.
- Feature UI consumes manifest slots; it never hardcodes arbitrary filenames.
- No runtime rasterization or SVG conversion.
- Do not use CSS filters to create all semantic states from one generic icon when authored distinct states are required.
- Asset provenance/version/hash is recorded for release debugging.

## Acceptance tests

- [ ] Every release-critical canonical slot has an approved production raster asset and valid manifest entry.
- [ ] Production paths and manifest contain no SVG/icon-font/vector reference.
- [ ] Map plate aligns with all seven semantic hotspot bounds.
- [ ] Icons remain recognizable at actual logical sizes and states are not color-only.
- [ ] Portrait, icon, map and texture contact sheets are reviewed.
- [ ] No low-resolution asset is upscaled beyond contract.
- [ ] Pack-size/loading targets are measured and documented.
- [ ] Missing/invalid asset development and production fallback behavior is tested.
- [ ] All asset, build, Storybook consumption-smoke and standard gates pass.
- [ ] `$ui-audit` and independent critic findings are resolved or result in explicit regeneration requests blocking integration.
- [ ] Wiki asset inventory is synchronized.

## Required evidence

- intake inventory and pack version;
- processing settings/tool version;
- manifest validation and hashes;
- contact sheets and hotspot review image;
- size/performance report;
- regeneration-request list or explicit statement none remain;
- vector-prohibition search;
- implementer/auditor/critic logs.

## Agent topology

One integration lead owns manifest and final derivatives. Disjoint sub-agents may audit portraits, icons and map, but none may modify the same masters/derivatives concurrently.

Use a UI/art-direction auditor and an independent technical critic. Any asset needing regeneration returns to ChatGPT with a precise slot, size, defect and retained visual requirements; do not substitute a generic library icon.

WP-039 wires the pack into feature screens and may make only integration-level manifest adjustments.

## Logging

Create:

- `logs/agents/WP-034/implementer-<name>.md`
- `logs/agents/WP-034/auditor-<name>.md`
- `logs/agents/WP-034/critic-<name>.md`

## Completion handoff

Document pack version/hash, manifest API, production/placeholder status, map dimensions, size report, regeneration status and feature-screen integration notes. State integration readiness.
