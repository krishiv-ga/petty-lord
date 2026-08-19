# The Petty Lord — Technical Stack and Visual Implementation Contract

**Status:** authoritative for implementation  
**Reviewed:** 2026-08-19  
**Product:** static desktop-browser strategy game; no backend required for launch

The stack is optimized for four things: deterministic systemic gameplay, aggressive multi-agent parallelism, fast verification, and an interface that looks authored rather than assembled from a generic web-app template.

## 1. Runtime and package management

- **Node.js 24 LTS** for local development and CI.
- **pnpm**, pinned through the repository `packageManager` field and lockfile.
- **ES modules only**.
- Exact dependency versions are pinned by WP-000; agents do not casually upgrade them mid-wave.

Do not use Node Current for release CI. Do not mix npm/yarn lockfiles into the repository.

## 2. Application foundation

- **React 19.2.x or the latest patched compatible 19.x release**.
- **Vite 8** with the React plugin.
- **TypeScript 6.0.x in strict mode** for the initial build.

TypeScript 7 is intentionally deferred even though it is stable and substantially faster. Its 7.0 release does not expose the normal programmatic compiler API, and several documentation/testing/editor integrations may still expect that API. Reconsider TypeScript 7 after the first release or when 7.1-era tooling support is verified. Do not adopt preview/nightly tooling during the four-day build.

The application is client-only. Do not add React Server Components, SSR, Next.js, Remix, a server runtime, an API layer, accounts, or cloud state.

## 3. State and simulation architecture

### Authoritative simulation

`src/sim/` is a pure TypeScript package with no React or browser dependencies.

It owns:

- `GameState` and all authoritative substate;
- deterministic commands and transitions;
- scheduler and `sequenceId` ordering;
- economy, time, Orders, politics, war, AI, knowledge, events, succession, and endings;
- invariant and scenario helpers;
- save-compatible schema versioning boundaries.

Use pure functions and explicit returned state. Immer may be used inside the simulation only if the team proves it does not obscure deterministic transitions or create serialization surprises; plain immutable transitions are preferred for core scheduler code.

### UI store adapter

- **Zustand vanilla store** plus selectors for React subscriptions.
- The store is an adapter around the pure simulation, not the home of game rules.
- Components dispatch typed commands and read projections.
- No component may directly mutate authoritative state.

### Validation and content

- **Zod 4** validates authored content, saves, migrations, debug imports, and externalized definitions.
- Content lives under `src/content/` and is loaded through typed validated manifests.
- Invalid content fails loudly in development and tests.

### Seeded randomness

- **pure-rand** is the approved PRNG dependency.
- The chosen generator and its serialized state must be wrapped behind one small project adapter.
- Never call `Math.random()` for gameplay.
- Store/snapshot draws when the canonical design requires an outcome to survive rescheduling or save/load.

## 4. Persistence

- **IndexedDB through `idb-keyval`** for current and previous autosave checkpoints.
- `localStorage` only for tiny preferences and a pointer/metadata record, not the authoritative save body.
- Zod validates saves before use.
- Every save records schema version, build version, seed, PRNG state, scheduler state, decision queue, and canonical game state.
- Migrations are explicit, tested, and one-way.

No backend, remote analytics, login, cloud save, or telemetry is required for launch.

## 5. UI primitives and styling

### Approved behavioral library

- **Radix Primitives** for difficult accessible behavior such as Dialog, AlertDialog, Tooltip, Popover, Tabs, Select, ScrollArea, and VisuallyHidden.
- Use the unstyled primitives package only.
- Do **not** use Radix Themes or Radix Icons.
- Wrap primitives in project-owned components so styling and behavior remain consistent.

Radix is selected because it supplies focus management, keyboard behavior, labels, and ARIA semantics without imposing a visual theme.

### Styling

- **CSS Modules** for component styles.
- One small global stylesheet for reset, typography, design tokens, and application frame.
- **CSS custom properties** for palette, spacing, type scale, texture, elevation, state treatments, and animation timing.
- Modern CSS Grid, Flexbox, container queries where useful, and semantic HTML.

Do not use Tailwind CSS. Do not install shadcn/ui, MUI, Mantine, Chakra, Bootstrap, Ant Design, or a dashboard template. Even when technically customizable, they create the wrong default vocabulary and encourage agent-generated card grids, pills, rounded SaaS panels, and generic spacing.

### Motion

- **Motion for React** may be used sparingly for letters, modal transitions, support-ribbon changes, map emphasis, and ending sequences.
- Prefer CSS transitions for simple hover/focus/opacity changes.
- No animated SVG.
- Every motion effect must honor `prefers-reduced-motion`.
- Motion is polish, never an authoritative clock or completion trigger.

## 6. Raster-only icon and image contract

**The shipped game contains no SVG icon assets and no SVG icon components.**

Heroicons, Lucide, Radix Icons, Tabler Icons, Phosphor, Font Awesome, Iconify, and similar icon sets are rejected as production dependencies because their normal delivery is SVG or icon-font based and their visual language is generic.

### Icon formats

- Small UI/status icons: transparent **PNG**, authored at 2× the logical display size; provide 1× only when file-size pressure justifies it.
- Larger crests, portraits, territory emblems, seals, decorative plates, and parchment textures: PNG or high-quality alpha-capable WebP after visual comparison.
- Never upscale a low-resolution source in CSS.
- Never use emoji as a production icon.
- Never rasterize an icon at runtime.

### Shared component

All icons render through a project-owned `RasterIcon` component that provides:

- fixed intrinsic width and height;
- `srcSet` when multiple densities exist;
- decorative versus meaningful semantics;
- accessible label/visually-hidden text where meaningful;
- loading strategy;
- predictable alignment and state overlays;
- a missing-asset development warning.

Buttons with icon-only visuals still require an accessible name and tooltip where appropriate.

### Placeholder rule

Temporary placeholders are also raster PNG/WebP. Do not use an SVG package during development with a promise to replace it later; that almost always leaks into release code and shapes the layout around generic icons.

## 7. Map rendering

The map is **not SVG and not canvas**.

Use:

1. a high-resolution raster map plate/background containing geography, borders, roads, labels where appropriate, and painterly texture;
2. positioned semantic DOM territory hotspots over the plate;
3. CSS/DOM overlays for selection, occupation, campaign lines, adjacency emphasis, and Capital state;
4. raster territory emblems, banners, and condition icons.

Hotspots are real buttons or accessible interactive elements with visible focus. Their coordinates and bounds are data. Campaign/adjacency lines use positioned rotated DOM elements or prepared raster overlays, not generated SVG paths.

This preserves accessibility and agent reliability while letting the art carry the visual identity.

## 8. Visual direction

Working direction: **the royal chancery at the end of a dynasty**.

The UI should feel assembled from instruments of political rule:

- illuminated parchment map;
- inked marginal notes;
- wax seals and stamped declarations;
- heraldic portrait medallions;
- cloth/ribbon allegiance markers;
- ledger-like resource strips;
- folded letters for decisions;
- coronation and Church motifs;
- restrained brass, iron, vellum, burgundy, smoke, and faded blue-green.

The visible frame should be irregular enough to feel authored but disciplined enough to scan quickly. Avoid a screen made from repeated identical cards. Use typography, borders, texture, silhouette, spacing, and composition to establish hierarchy before adding decoration.

### Explicit anti-patterns

Reject:

- rounded white or charcoal cards on a gradient background;
- glassmorphism;
- neon glows;
- oversized dashboard KPI tiles;
- generic sidebar + card-grid layouts;
- uniform 8px-radius controls everywhere;
- icon-only controls without text during onboarding;
- excessive pills and badges;
- stock fantasy ornament pasted around a modern SaaS layout;
- default component-library demos with palette swaps.

WP-012 must create a visual language spike and reusable fixtures before full UI fan-out.

## 9. Typography

WP-012 chooses and validates the final font pairing from maintained open-source font packages or hosted assets with clear licensing.

Target roles:

- display/phase headings: historically inflected serif or inscriptional face;
- body and inspector text: highly readable book serif;
- compact numeric/diagnostic data: restrained tabular lining numerals, using the body family or a compatible secondary face.

Do not use tiny decorative blackletter for body copy. Do not commit unlicensed font files. Font loading must not block game usability.

## 10. Component laboratory and visual verification

- **Storybook for React + Vite** is the approved component laboratory.
- Use stories for all reusable primitives and major political states, not only happy paths.
- Include 1280×720 and 1440×900 viewport fixtures.
- Add the maintained Storybook Vitest integration if compatible with the pinned versions.
- Visual states must use raster placeholder/production assets and real copy lengths.

Required story groups include:

- buttons, tabs, tooltips, dialogs, letters, seals, ribbons, resource strip;
- RasterIcon states and missing-asset behavior;
- lord portrait/support states;
- territory states and map hotspots;
- action previews and collateral;
- Orders, chronicle, forecast, mandatory decisions, ending panels;
- keyboard focus, reduced motion, long text, stale/unknown intelligence, and disabled states.

Storybook is development tooling only and must not ship in the game bundle.

## 11. Testing

- **Vitest** for pure unit, contract, scenario, simulation, and migration tests.
- **Playwright** for browser flows, deterministic reload, visual screenshots, traces, keyboard navigation, and release smoke tests.
- **`@axe-core/playwright`** for automated accessibility checks, supplemented by manual keyboard review.
- Storybook stories may participate in browser component tests when the maintained integration is stable with the pinned toolchain.

Simulation tests should run headlessly without rendering React.

## 12. Formatting, linting, and quality

- **Biome 2** for formatting, imports, and linting.
- TypeScript compiler for type correctness.
- Do not add ESLint and Prettier unless a specific unsupported rule is proven essential; duplicate toolchains waste agent time and create conflicts.
- CI uses the same commands agents run locally.

Expected scripts after WP-000:

- `pnpm dev`
- `pnpm build`
- `pnpm check`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:sim`
- `pnpm test:e2e`
- `pnpm storybook`
- `pnpm build:storybook`
- `pnpm wiki:dev`
- `pnpm wiki:build`

WP-000 may refine names but must document one stable command surface.

## 13. Wiki, CI, deployment, and releases

- **VitePress** is the approved maintained wiki tool.
- GitHub Actions run check, typecheck, unit/scenario tests, build, and selected browser smoke tests.
- A manual checkpoint workflow creates GitHub Releases; no release on every merge.
- The game remains a static build suitable for GitHub Pages, Cloudflare Pages, Netlify, or equivalent. The first tooling packet may choose GitHub Pages for zero-account static hosting, but deployment must remain replaceable.
- Release artifacts include the production build archive, compacted log, test summary, and known issues.

Do not build a custom wiki generator, release framework, test dashboard, image generator, or deployment platform.

## 14. Directory target

```text
/
├── src/
│   ├── app/
│   ├── sim/
│   ├── content/
│   ├── ui/
│   └── assets/
├── public/assets/
│   ├── icons/
│   ├── portraits/
│   ├── territories/
│   ├── maps/
│   ├── seals/
│   └── textures/
├── tests/
├── wiki-site/
├── work-packets/
├── logs/
├── designer/
└── .codex/skills/
```

## 15. Dependency rule

Every new dependency must answer:

1. What difficult behavior does it replace?
2. Is it maintained and compatible with the pinned runtime?
3. Does it compromise determinism, bundle size, visual identity, or accessibility?
4. Can an existing approved dependency already do the job?
5. Will parallel agents understand and test it reliably?

Do not add a dependency solely to save a few lines of code.
