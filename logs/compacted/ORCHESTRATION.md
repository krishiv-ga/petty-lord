# Compacted Log — Repository Orchestration

- **Integrated revision:** Documentation/control-plane revision on `main`
- **Release/tag:** None
- **Fan-out gate:** **Closed**
- **Only legal packet:** WP-000

## Repository capability now

The repository contains a locked, hostile-paperplayed game design plus a complete Codex execution control plane. It does not yet contain a bootstrapped application or build tooling. A fresh Codex agent can read one root agent contract, one dependency-aware packet index, packet-specific ownership and tests, ten local skills, mandatory logging/review rules, the technical/visual stack, wiki requirements and checkpoint release policy.

## What was added

- `AGENTS.md`: repository-wide read order, ownership, determinism, parallel worktree, critic/integrator, logging, wiki, release and raster-only UI rules.
- `work-packets/`: WP-000 through WP-049 with four parallel waves and serialized integration gates.
- `.codex/skills/`: `$packet`, `$critic`, `$integrate`, `$hunt`, `$tune`, `$bugfix`, `$ui-audit`, `$design-guard`, `$wiki-sync`, `$release`.
- `TECH_STACK.md`: React/Vite/strict TypeScript, pure deterministic simulation, Zustand/Zod/pure-rand/IndexedDB, Radix Primitives, CSS Modules, Storybook/Vitest/Playwright/Biome/VitePress.
- `wiki.md`: VitePress information architecture and source-authority contract; tooling is deliberately assigned to WP-000.
- `logs/`: file-per-agent logs, compacted wave logs and integrator-only status.
- `RELEASES.md`: manual major checkpoint releases at WP-019/029/039/049.
- Root README: project/navigation/current gate.
- Canonical interface design: updated from SVG to raster PNG/WebP icons and raster map plate with semantic DOM hotspots.

## Parallelization plan

1. **Now serialize:** WP-000 only.
2. After WP-000: fan out WP-010 simulation kernel, WP-011 canonical content/data and WP-012 visual/UI foundation.
3. Serialize WP-019 integration/release.
4. Fan out WP-020 time/economy/orders, WP-021 politics/succession, WP-022 war/capital and WP-023 AI/knowledge/events.
5. Serialize WP-029 complete headless-game integration/release.
6. Fan out WP-030 raster map, WP-031 political UI, WP-032 shell/save/operations, WP-033 forecast/onboarding/endings and WP-034 raster assets when the approved art drop exists.
7. Serialize WP-039 playable beta integration/release.
8. Fan out WP-040 hunt→tune, WP-041 UI/a11y audit, WP-042 technical hardening and WP-043 narrative comprehension.
9. Serialize WP-049 final integration and `v1.0.0`.

## Critical contracts

- Canonical gameplay remains under `/designer`.
- One in-game day is one real minute; deterministic state is pure and serializable.
- Parallel agents use separate branches/worktrees and disjoint owned paths.
- Significant work requires independent criticism; integration packets require a combined critic.
- Individual agents write separate logs; only integrators compact and open gates.
- Shipped UI contains no SVG/icon-font/vector icon package. Heroicons and similar libraries are not production dependencies.
- All icons/illustrations use raster PNG/WebP through a shared manifest/`RasterIcon` contract.
- The map is raster art plus semantic DOM controls and CSS/DOM overlays.
- Radix Primitives may supply unstyled accessible behavior; visible styling is bespoke.
- No custom wiki/release/image-generation platform; Codex installs maintained tooling in WP-000.

## Current risks

- Tool versions/lockfile/CI are not yet created; WP-000 owns them.
- Final art direction must be proven by WP-012.
- ChatGPT-generated production raster art is not yet available; WP-034 is blocked on that drop.
- No code/tests can run before WP-000; this is expected, not a failure.

## Handoff

- Start `work-packets/WP-000-repository-bootstrap.md` from latest `main` using `$packet`.
- Do not start WP-010 or later until WP-000 writes `WAVE-00.md`, updates `logs/STATUS.md`, and explicitly opens the Wave 1 gate.
- WP-000 owns all package/tooling/wiki/CI/release shared files; no other agent should modify them concurrently.
