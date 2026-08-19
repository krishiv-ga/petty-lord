# The Petty Lord

> The King is dying. You are a minor lord with eight weeks to manufacture a reason the kingdom should accept you as its next ruler.

A real-time-with-pause political strategy game for desktop browsers. One in-game day is approximately one real minute. The player must construct and hold a viable succession through noble support, Claim, Church legitimacy, coercion, intrigue, the Capital or force while five autonomous rivals pursue their own objectives.

## Current repository state

The complete game design is locked. WP-000 is establishing the reproducible application, test, wiki,
CI and release baseline; use [`logs/STATUS.md`](./logs/STATUS.md) for the integrated fan-out gate.

See [`work-packets/INDEX.md`](./work-packets/INDEX.md) for the full dependency graph and exact fan-out/serialization gates.

## Start here

- [Canonical game design](./designer/README.md)
- [Work-packet index and dependency graph](./work-packets/INDEX.md)
- [Repository agent rules](./AGENTS.md)
- [Local Codex skills](./SKILLS.md)
- [Technical and visual stack](./TECH_STACK.md)
- [Repository wiki contract](./wiki.md)
- [Agent logging contract](./logs/README.md)
- [Current execution status](./logs/STATUS.md)
- [Checkpoint release policy](./RELEASES.md)

## Local setup

Requirements: Node 24 LTS and pnpm 11.19.0. The verified Node revision is pinned in `.node-version`,
and the package manager is pinned through Corepack metadata.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The maintained wiki lives under `wiki-site/`; its command and architecture documentation begins at
[`wiki-site/index.md`](./wiki-site/index.md).

## Stable commands

| Command | Gate |
|---|---|
| `pnpm dev` | Vite development server |
| `pnpm build` | TypeScript plus production game build |
| `pnpm check` | Biome formatting/import/lint check |
| `pnpm typecheck` | Strict TypeScript projects |
| `pnpm test` | Unit and configuration tests |
| `pnpm test:sim` | Headless simulation suite |
| `pnpm test:e2e` | Chromium browser and accessibility smoke |
| `pnpm storybook` | Storybook development server |
| `pnpm build:storybook` | Static Storybook build |
| `pnpm wiki:dev` | VitePress wiki server |
| `pnpm wiki:build` | Static wiki build |
| `pnpm wiki:check` | Wiki build with internal-link validation |

## Execution shape

```text
WP-000 serialized bootstrap
  → Wave 1: simulation kernel | canonical data | visual/UI foundation
  → serialized foundation integration/release
  → Wave 2: time/economy | politics/succession | war/capital | AI/knowledge/events
  → serialized complete headless-game integration/release
  → Wave 3: raster map | political UI | operational shell/save | forecast/endings | raster assets
  → serialized playable beta integration/release
  → Wave 4: hunt→tune | visual/a11y audit | technical hardening | narrative clarity
  → serialized final integration and v1.0.0
```

Parallel work uses separate branches/worktrees and disjoint path ownership. Significant changes require an independent critic. Every agent writes a packet log; only integrators update compacted logs, status and fan-out gates.

## Visual/technical direction

The interface is designed as **the royal chancery at the end of a dynasty**: parchment map, heraldic portraits, seals, ribbons, letters and ledger-like political information rather than a generic web dashboard.

Production UI uses:

- React, TypeScript and Vite;
- a pure deterministic simulation core;
- Zustand as a thin UI adapter;
- Zod-validated content and saves;
- unstyled Radix Primitives for difficult accessible behavior;
- bespoke CSS Modules;
- Storybook, Vitest, Playwright, Biome and VitePress;
- transparent PNG/WebP raster assets for every icon and illustration.

**No shipped SVG icons, SVG map, icon fonts, Heroicons/Lucide/Radix Icons, generic dashboard template or themed component kit.** The map is a raster art plate with semantic DOM hotspots and CSS/DOM overlays.

## Design authority

The files under [`designer/`](./designer/) are the gameplay implementation contract. When conversation history, prototype code or comments conflict with that package, the canonical design wins unless changed through `$design-guard` with evidence and hostile paperplay.

## Scope

The complete release is one replayable 49–56 minute succession crisis with:

- six great lords including the player;
- seven territories;
- four royal-health phases;
- two simultaneous player Orders and one Intent per rival;
- political bargains, Claim, Church, secrets and abstract war;
- a deterministic Council/Acclamation constitution;
- autosave/resume, forecast, onboarding, chronicle and full ending reconstruction.

Explicitly excluded: tactical combat, free army movement, buildings/technology, family trees, assassination, procedural maps, post-coronation play, multiplayer, accounts, cloud saves, mobile-first UI and meta-progression.
