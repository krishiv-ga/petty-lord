# Codex Work-Packet Index

This is the delivery control plane for The Petty Lord. Agents must follow [`AGENTS.md`](../AGENTS.md), execute one packet at a time through `$packet`, and write mandatory logs.

## Git execution — `main` only

All work packets execute directly on `main`.

- Do not create, switch to, push, or require packet, feature, integration, or PR branches.
- Before starting work, before committing, and before pushing, synchronize with `origin/main` and re-check owned/shared paths for concurrent changes.
- `Parallel-safe` means agents may work concurrently only when ownership is path-disjoint. It never authorizes separate branches.
- If `main` advances while local commits exist, rebase those local commits onto latest `origin/main`, rerun affected checks, and push `main`; never create a temporary conflict branch.
- Critics review the relevant `main` commit/diff, logs, and evidence. A PR is not required.
- Integration packets validate and reconcile the combined state already on `main`; they do not merge packet branches.

## Current gate

> **WAVE 1 fan-out uses shared `main`: WP-010, WP-011 and WP-012 may run concurrently only on disjoint owned paths. No packet branches/worktrees.**

WP-000 is integrated at reviewed revision `aa11d6b2379f1d3563e4aeb787dc1a73c090e2a9` with a frozen
toolchain, lockfile, CI/release baseline, wiki and path contracts. Do not change shared root seams in
parallel packets; WP-019 owns foundation integration.

Do not begin WP-020 or later until WP-019 integrates Wave 1 and explicitly opens Gate 2.

## Dependency graph

```text
WP-000  Repository bootstrap, tooling, wiki, CI, release/log system
   │
   ├──────────────┬──────────────┐
   ▼              ▼              ▼
WP-010         WP-011         WP-012           WAVE 1 — parallel
Sim kernel     Content/data   Visual/UI lab
   └──────────────┴──────────────┘
                  ▼
               WP-019                           SERIAL integration + foundation release
                  │
   ┌──────────────┼──────────────┬──────────────┐
   ▼              ▼              ▼              ▼
WP-020         WP-021         WP-022         WP-023       WAVE 2 — parallel
Time/orders    Politics       War/capital    AI/knowledge/events
   └──────────────┴──────────────┴──────────────┘
                         ▼
                      WP-029                    SERIAL integration + headless-game release
                         │
   ┌──────────────┬──────────────┬──────────────┬──────────────┐
   ▼              ▼              ▼              ▼              ▼
WP-030         WP-031         WP-032         WP-033         WP-034   WAVE 3 — parallel*
Map/territory  Politics UI    Shell/ops      Forecast/end   Raster assets
   └──────────────┴──────────────┴──────────────┴──────────────┘
                                  ▼
                               WP-039                         SERIAL integration + playable beta
                                  │
   ┌────────────────┬────────────────┬────────────────┬────────────────┐
   ▼                ▼                ▼                ▼
WP-040           WP-041           WP-042           WP-043             WAVE 4 — parallel
Hunt→tune        UI/a11y audit    Tech hardening   Narrative clarity
   └────────────────┴────────────────┴────────────────┘
                                  ▼
                               WP-049                         SERIAL final integration + release
```

`*` WP-034 may start with the Wave 3 fan-out only when the approved ChatGPT-generated raster asset drop and asset manifest are available. The other Wave 3 packets may proceed with approved raster placeholders. WP-039 cannot close without either the production pack or an explicit release-scope decision in its critic log.

## Exact fan-out and serialization rules

### Gate 0 — completed

- **Integrated:** [`WP-000`](./WP-000-repository-bootstrap.md)
- **Parallel work:** none
- **Result:** shared package/toolchain/contracts/CI/wiki foundation is green and critic-cleared.

### Gate 1 — after WP-000 is integrated

Fan out on `main` with disjoint owned paths:

- [`WP-010`](./WP-010-deterministic-simulation-kernel.md)
- [`WP-011`](./WP-011-content-schema-and-canonical-data.md)
- [`WP-012`](./WP-012-visual-language-and-ui-foundation.md)

These packets own disjoint paths and may run simultaneously. Do not begin WP-020+.

Then serialize all Wave 1 integration and seam repair into:

- [`WP-019`](./WP-019-foundation-integration.md)

Do not create branch/merge-fix packets. WP-019 is deliberately broad enough to reconcile the three foundations on `main`, freeze contracts, compact logs, and create the foundation checkpoint release.

### Gate 2 — after WP-019 is integrated

Fan out on `main`:

- [`WP-020`](./WP-020-time-economy-orders-actions.md)
- [`WP-021`](./WP-021-politics-claim-church-succession.md)
- [`WP-022`](./WP-022-war-occupation-threat-capital.md)
- [`WP-023`](./WP-023-ai-knowledge-events.md)

Each system packet implements behind contracts frozen by WP-019. Shared contract changes require an integration note and must not be independently committed by multiple packet agents into incompatible shapes.

Then serialize all game-system integration into:

- [`WP-029`](./WP-029-headless-game-integration.md)

WP-029 must produce a complete deterministic headless run before any full-screen UI work is integrated.

### Gate 3 — after WP-029 is integrated

Fan out on `main`:

- [`WP-030`](./WP-030-raster-map-and-territory-ui.md)
- [`WP-031`](./WP-031-lords-politics-and-action-ui.md)
- [`WP-032`](./WP-032-application-shell-operations-and-save-ui.md)
- [`WP-033`](./WP-033-forecast-onboarding-and-ending-ui.md)
- [`WP-034`](./WP-034-raster-asset-pack-integration.md), when its asset prerequisite is satisfied

No shipped UI may use SVG icons, SVG maps, icon fonts, Heroicons, Lucide, Radix Icons, or generic component-library themes. Raster placeholders are allowed; vector placeholders are not.

Then serialize playable integration into:

- [`WP-039`](./WP-039-playable-game-integration.md)

### Gate 4 — after WP-039 is integrated

Fan out on `main`:

- [`WP-040`](./WP-040-gameplay-hunt-and-tune.md)
- [`WP-041`](./WP-041-ui-accessibility-and-visual-audit.md)
- [`WP-042`](./WP-042-technical-hardening-and-bugfix.md)
- [`WP-043`](./WP-043-narrative-and-comprehension-polish.md)

WP-040 intentionally combines hostile gameplay hunting and value tuning. Hunters may work in parallel, but tuning starts only after findings are reproduced and triaged. This avoids multiple agents adjusting the same balance data simultaneously.

Then serialize final integration, full regression, and release into:

- [`WP-049`](./WP-049-final-integration-and-release.md)

## Packet register

| Packet | Title | Execution | Depends on | Critic | Status |
|---|---|---|---|---|---|
| WP-000 | Repository bootstrap, tooling, wiki, CI and releases | **Serial** | None | Required | **Integrated** |
| WP-010 | Deterministic simulation kernel | Parallel Wave 1 | WP-000 | Required | **Ready** |
| WP-011 | Content schema and canonical data | Parallel Wave 1 | WP-000 | Required | **Ready** |
| WP-012 | Visual language and UI foundation | Parallel Wave 1 | WP-000 | Required + `$ui-audit` | **Ready** |
| WP-019 | Foundation integration and checkpoint | **Serial integration** | WP-010–012 | Required | Blocked |
| WP-020 | Time, economy, Orders and action infrastructure | Parallel Wave 2 | WP-019 | Required | Blocked |
| WP-021 | Politics, support, Claim, Church and succession | Parallel Wave 2 | WP-019 | Required | Blocked |
| WP-022 | War, occupation, threat and Capital | Parallel Wave 2 | WP-019 | Required | Blocked |
| WP-023 | Rival AI, knowledge, openings and events | Parallel Wave 2 | WP-019 | Required | Blocked |
| WP-029 | Complete headless-game integration | **Serial integration** | WP-020–023 | Required | Blocked |
| WP-030 | Raster map and territory UI | Parallel Wave 3 | WP-029 | Required + `$ui-audit` | Blocked |
| WP-031 | Lords, politics and action UI | Parallel Wave 3 | WP-029 | Required + `$ui-audit` | Blocked |
| WP-032 | Application shell, operations, save and debug UI | Parallel Wave 3 | WP-029 | Required | Blocked |
| WP-033 | Forecast, onboarding and ending UI | Parallel Wave 3 | WP-029 | Required + `$ui-audit` | Blocked |
| WP-034 | Raster asset-pack intake and integration | Parallel Wave 3 | WP-012, approved asset drop | Required | Blocked |
| WP-039 | Complete playable-game integration and beta | **Serial integration** | WP-030–034 | Required | Blocked |
| WP-040 | Hostile gameplay hunt followed by tuning | Parallel Wave 4 | WP-039 | Required | Blocked |
| WP-041 | UI, accessibility and visual-identity audit | Parallel Wave 4 | WP-039 | Required | Blocked |
| WP-042 | Technical hardening and direct bugfix pass | Parallel Wave 4 | WP-039 | Required | Blocked |
| WP-043 | Narrative, onboarding and comprehension polish | Parallel Wave 4 | WP-039 | Required | Blocked |
| WP-049 | Final integration, release candidate and 1.0 | **Serial integration** | WP-040–043 | Required | Blocked |

## Shared-file ownership

Parallel packet agents must not edit these unless their packet explicitly owns them:

- `package.json`, `pnpm-lock.yaml`, `tsconfig*`, Vite/Vitest/Playwright/Storybook/Biome config;
- `.github/workflows/**`;
- `src/contracts/**` and shared top-level barrel exports;
- `src/sim/state/**` after a wave contract is frozen;
- `src/assets/manifest*` after WP-034 begins;
- `wiki-site/index.md`, wiki navigation/config, root architecture pages;
- `work-packets/INDEX.md`;
- `logs/STATUS.md` and `logs/compacted/**`;
- `CHANGELOG.md`, version fields, tags and release notes.

Integration packets own these seams. An implementer that discovers a necessary shared change records the exact proposed diff in its log and coordinates with the integrator rather than editing around another packet. On `main`, shared-file edits remain serialized even when other packet work is concurrent.

## Status transitions

A packet moves through:

`Planned → Ready → In progress → Ready for critic → Ready for integration → Integrated`

A significant packet cannot become `Ready for integration` until:

- acceptance tests pass;
- its implementer log is complete;
- an independent critic log exists;
- all P0/P1 findings are resolved;
- P2/P3 findings have explicit disposition;
- required wiki pages are updated;
- its packet commits are current with latest `origin/main` and the checkout has no non-`main` branch dependency.

Only an integration packet changes this index, opens the next gate, updates `logs/STATUS.md`, or creates a compacted wave log.
