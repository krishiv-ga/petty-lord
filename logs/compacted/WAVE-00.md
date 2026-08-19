# Compacted Log — Wave 00 Repository Bootstrap

- **Reviewed integration revision:** `aa11d6b2379f1d3563e4aeb787dc1a73c090e2a9`
- **Gate-opening revision:** The commit containing this log, `logs/STATUS.md` and the packet-index transition
- **Release/tag:** None; WP-000 installs release tooling but does not publish a checkpoint
- **Critic verdict:** **Clear for integration**, no P0–P3 findings
- **Fan-out gate:** **Open for WP-010, WP-011 and WP-012**

## Repository capability now

The design-only repository is now a reproducible client application workspace. A fresh Windows clone
installs from the frozen pnpm lockfile, passes the finite command surface and preserves LF source
regardless of global `core.autocrlf` settings. Shared package, TypeScript alias, build, test, wiki, CI
and release seams are frozen for Wave 1.

## Implemented foundation

- Node 24 LTS and pnpm 11.19.0 pins with exact approved React/Vite/TypeScript dependencies.
- Strict TypeScript/Vite application boundary with `app`, `sim`, `content`, `ui`, `assets` and test
  aliases plus ownership READMEs.
- Provisional non-gameplay React smoke proclamation with a thin Zustand bootstrap adapter, CSS Module,
  fallback typography and reduced-motion baseline.
- Vitest unit/config and headless simulation suites, Playwright Chromium/axe smoke and screenshot,
  Storybook React+Vite with a11y/Vitest addons, and Biome checks.
- Complete VitePress information architecture with maintained production dead-link validation.
- GitHub Actions CI for quality/build/wiki/browser artifacts and a manual-only, dry-run-default
  checkpoint release workflow with version/ref/tag safeguards, archives and checksums.
- Root setup/command documentation, direct packet PR template, known-issues file and agent evidence.

## Verification

| Gate | Result |
|---|---|
| Frozen install and peer check | Pass; lockfile unchanged and no peer issues |
| `pnpm check` | Pass; 25 supported source/config files |
| `pnpm typecheck` | Pass; TypeScript 6.0 project references |
| `pnpm test` | Pass; 3 unit/workflow tests |
| `pnpm test:sim` | Pass; headless boundary test |
| `pnpm build` | Pass; production Vite artifact |
| `pnpm build:storybook` | Pass; static smoke story and addons |
| `pnpm wiki:check` | Pass; all required pages and internal links |
| `pnpm test:e2e` | Pass; Chromium 1280×720 plus axe, zero violations |
| Independent Windows clean clone | Pass after LF contract; install/check/typecheck/test/sim/build/wiki, clean status |
| Workflow validation | Pass; actionlint 1.7.12, official action tags and command parity |
| Raster/vector contract scan | Pass; no shipped/source SVG, icon font, forbidden icon/UI kit or canvas leakage |

## Shared contracts frozen for Wave 1

- Root dependencies, lockfile, package scripts and Node/pnpm versions.
- TypeScript project/alias layout and Vite/Vitest/Playwright/Storybook/Biome configuration.
- `.github/workflows/**`, VitePress shared navigation, root status/index files and compacted logs.
- `src/sim`, `src/content`, `src/ui`, `src/app` and asset ownership boundaries.

Wave 1 implementers must not change these shared seams independently. Record a proposed integration
change when a packet discovers a genuine need.

## Known risks and deferred work

- Hosted GitHub CI and a live workflow-dispatch dry run await the first push; local actionlint,
  official tag lookup and exact command parity are green.
- Storybook's development-only manager/axe chunks are large and include framework-owned SVGs. The
  production game bundle and all project-authored source remain raster-contract clean.
- WP-000 contains no gameplay state, canonical data or reusable final UI. Those begin in Wave 1.
- The approved production raster asset pack is still unavailable and remains a WP-034 prerequisite.

## Wave 1 handoff

- **WP-010:** pure deterministic simulation kernel under `src/sim/**` and owned tests/docs.
- **WP-011:** Zod content schemas and canonical authored data under `src/content/**` and owned tests/docs.
- **WP-012:** bespoke visual language and reusable UI laboratory under `src/ui/**` and owned assets/tests/docs.

These three packets may now run concurrently in separate branches/worktrees. WP-019 remains the next
serialized integration checkpoint. Do not begin WP-020 or later.
