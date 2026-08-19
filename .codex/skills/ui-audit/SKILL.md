---
name: ui-audit
description: Audit a Petty Lord UI change or production build for authored political identity, hierarchy, raster-only assets, keyboard access, accessibility, target-view layout, hidden-information safety, and non-generic visual quality.
---

# UI Audit

## Prepare

- Read `TECH_STACK.md`, the UI packet and canonical interface design.
- Audit the production build or representative integrated Storybook fixtures, not code alone.
- Record build SHA, viewport, seed/fixture and motion/zoom settings.
- Create `logs/agents/<packet-id>/auditor-<name>.md`.

## Required viewports/states

At minimum inspect 1280×720 and 1440×900, plus a constrained-height stress case. Include dense Deathbed, long copy, missing raster asset, reduced motion, keyboard focus and public/private/stale/unknown political information.

## Visual attack

Look for:

- generic SaaS/dashboard composition;
- repeated identical cards, excessive pills, glass/neon/gradient defaults;
- map or people losing hierarchy to panels;
- weak scan path, clipped critical information or hidden consequences;
- ornament/texture obscuring text;
- inconsistent chancery materials, typography, borders, seals and ribbons;
- raster icons unreadable at actual size or distinguishable only by color;
- stock fantasy decoration around a modern admin layout.

Every material finding includes a screenshot, location, impact and concrete correction.

## Raster/vector audit

Search owned/production source and assets for:

- `.svg`, inline `<svg>`, SVG data URI or CSS mask;
- Heroicons, Lucide, Radix Icons, Tabler, Font Awesome, Iconify or icon-font imports;
- vector placeholders or runtime rasterization;
- low-resolution upscaling, missing intrinsic dimensions, alpha halos, baked gibberish text and production placeholder flags.

Dependencies may contain internal SVG files; the release rule targets project-authored/shipped assets and imports.

## Interaction/accessibility

Test keyboard-only critical paths, visible focus, focus trap/return, target size, shortcuts while typing, hover-only facts, semantic names, heading/region order, live announcements, contrast, zoom, reduced motion and no color-only states.

Use automated axe results as evidence, not as the entire audit.

## Information safety

Verify UI receives projections and does not reveal:

- undiscovered Leanings/secrets/Intent;
- exact hidden armies;
- future death/event/PRNG outcomes;
- private bargains/blackmail to uninformed views;
- hidden scores or percentages forbidden by design.

## Output

Rank findings P0–P3, attach before/after evidence when fixes are made, list regeneration requests for bad raster art, and give a verdict:

- **Blocked**
- **Needs fixes**
- **Clear for integration**

Do not fix gameplay values or rewrite canonical copy during an audit; hand findings to the owning packet.
