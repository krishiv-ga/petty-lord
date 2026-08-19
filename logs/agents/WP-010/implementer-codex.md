# Agent Log — WP-010 — Implementer/Codex

- **Packet:** WP-010 Deterministic Simulation Kernel
- **Role:** Implementer
- **Branch/worktree:** `wp/WP-010-deterministic-simulation-kernel` / `petty-lord-wp010`
- **Starting revision:** `5c154a87e899e924dc6c4f0395dad960b3367578`
- **Ending revision:** `ccadf9a` (critic-reviewed production/tests/wiki)
- **PR:** pending
- **Status:** Ready for integration

## Scope

Owned paths:

- `src/sim/kernel/**`
- `src/sim/state/**`
- `src/sim/random/**`
- `src/sim/serialization/**`
- `src/sim/testing/**`
- `tests/sim/kernel/**`
- `tests/sim/determinism/**`
- `wiki-site/architecture/deterministic-sim.md`
- `wiki-site/architecture/scheduler-and-rng.md`
- kernel-owned sections of `wiki-site/reference/state-schema.md`
- `logs/agents/WP-010/**`

Explicitly out of scope:

- Canonical content, UI, economy, politics, war, AI, events and succession rules
- Root package/tooling/lockfile configuration, shared top-level barrels and cross-packet contracts
- Work-packet index, shared status and compacted logs

## Work performed

- Initialized packet evidence after verifying the Wave 1 gate, dependency integration and clean base.
- Added schema-version-1 canonical state with empty typed domain extension points, serialized PRNG
  state, monotonic scheduler sequence, decisions, chronicle, deterministic metadata and bounded
  diagnostics.
- Added named dawn priorities and a pure next-due scheduler with schedule/cancel/replace/inspect,
  mandatory-decision stopping, exact-timestamp resume, recursively scheduled work and an atomic
  resolution ceiling.
- Wrapped `pure-rand`/`xoroshiro128plus` behind labeled integer, float, chance, select, shuffle and
  snapshot helpers with versioned generator-state serialization.
- Added typed kernel commands, domain module registration, structured effects/errors and debug gating.
- Added stable normalized JSON export, structural import validation, explicit migration/domain-validator
  seams and current/previous checkpoint data without persistence orchestration.
- Added invariant/hash/round-trip helpers plus a fake domain proving later registration without kernel
  edits.
- Added 28 headless tests across scheduler, commands, replay determinism, serialization, PRNG and
  invariant failure paths; updated all three owned wiki pages.
- Resolved the initial critic's two P1 and four P2 findings with canonical micro-hour time,
  terminal/succession stopping and initiative locks, full public-command runtime validation, nested
  kernel import validation, 64-bit seed expansion and pause-safe instant advancement.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| Treat the packet index and current gate as authoritative over WP-010's stale `Blocked by WP-000` header | `work-packets/INDEX.md`, root README and Wave 0 compacted log all mark WP-010 Ready and Wave 1 open | WP-010 may legally proceed; WP-019 can clean the stale packet header if desired |
| Use repo packet gates because no production-checklist CLI is callable | No checklist tool/command is present; WP-000 recorded the same host limitation | Acceptance evidence is captured directly in this log without reading a master checklist |
| Keep domain placeholders JSON-compatible and generic | WP-010 may not invent WP-020–WP-023 system shapes; WP-019 freezes the seam with WP-011 | Real modules extend `DomainExtensions` and register handlers without bypassing scheduler order |
| Requested speed is pacing metadata, not a simulation multiplier | Canonical 1×/2× changes wall-time pacing outside the kernel | A command's simulation-hour delta resolves identically at 1× and 2×; paced pause is a no-op |
| Choosing a mandatory decision does not automatically restore speed | The decision itself auto-pauses; resumption is an explicit UI/application request | Exact pending timestamp is preserved and a separate speed request makes resume observable |
| Replace assigns a fresh sequence ID | Canonical IDs are creation-order monotonic and must not be reused | Replaced work has explicit new ordering rather than inheriting an earlier creation position |
| Quantize time to one micro-hour and reject finer public deltas | Exact integer ticks are required for fractional chunk convergence; one micro-hour is far below UI pacing needs | Equivalent supported chunks reach byte-identical timestamps; adapters must accumulate sub-micro-hour fractions before dispatch |
| Treat `succession` as a frozen-clock ending phase | Death locks new initiatives and there is no post-coronation clock; authored succession can resolve inside the death transition and mandatory decision commands | Scheduler stops on any status other than `playing`; WP-019 must preserve this ending contract |

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| Gate/dependency/worktree inspection | Pass | WP-000 integrated on `main`; Wave 1 open; clean worktree; no competing WP-010 worktree |
| Owned isolated strict TypeScript compilation | Pass | Strict, exact-optional and unchecked-index checks over all WP-010 source/tests |
| `pnpm test:sim` | Pass | 7 files, 28 tests; adds fractional chunks, terminal stop/lock, runtime enums/payloads, hostile nested imports, seed collision, invalid resolver decisions and aliasing regressions |
| `pnpm test` | Pass | Existing 2 files, 3 unit/workflow tests |
| Owned `pnpm exec biome check ...` | Pass | 23 owned TypeScript files; no fixes required |
| `pnpm wiki:check` | Pass | VitePress rendered owned contract documentation and all repository wiki links |
| Forbidden dependency/API search | Pass | No browser/React/storage/timer/wall-clock/asset imports or `Math.random()` in `src/sim`; `pure-rand` imports exist only in `src/sim/random/random.ts` |
| `pnpm typecheck` | Pass | Clean isolated packet worktree, strict TypeScript project references |
| `pnpm check` | Pass | 49 repository files after remediation; no fixes required |
| `pnpm build` | Pass | TypeScript plus Vite production build |
| `pnpm build:storybook` | Pass | Existing development-only Storybook smoke built; expected size warning only |
| `pnpm test:e2e` | Pass | Chromium 1280×720 smoke passed with CI-style isolated server |

## Critic findings and resolution

| Severity | Finding | Resolution/status |
|---|---|---|
| P1 | Fractional chunking delayed due work at `0.9999999999999999` | Fixed with micro-hour canonicalization, boundary precision validation and 1 vs 10×0.1 regression |
| P1 | Terminal transition continued later work and accepted initiatives | Fixed; non-playing status stops the active advance at its exact time and locks start/cancel |
| P2 | Runtime command enums could enter invalid canonical state | Fixed speed/mode plus IDs, numeric ranges and JSON payload validation; failures retain original state |
| P2 | Import accepted malformed decisions and diagnostics | Fixed complete kernel-owned nested validation and hostile import regression |
| P2 | String seed collapsed to 32 bits | Fixed version-1 mapping with stable 64-bit FNV-1a expansion; reported collision pair is a regression |
| P2 | Instant advancement bypassed pause | Fixed; all public advancement modes respect pause, while instant skips pacing only during active play |
| P1 (re-review) | Resolver could open a mandatory decision with no valid choices | Fixed at decision creation; invalid IDs/kinds/choices/payloads fail the entire scheduler advance atomically |

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: None
- Balance values changed: None
- Save/schema impact: Initial kernel schema version `1`, explicit migrations/validator hook, current/previous checkpoint shape
- Wiki pages updated: `architecture/deterministic-sim.md`, `architecture/scheduler-and-rng.md`, `reference/state-schema.md`

## Risks and deferred work

- WP-019 must reconcile/freeze the generic kernel extension seams with WP-011 content schemas.
- Independent re-review at `ccadf9a` is clear with no remaining P0–P3 finding.

## Integration notes

- Shared contracts touched: New packet-owned public indices under `src/sim/{kernel,state,random,serialization,testing}`; no root/shared barrel changed
- Merge order constraints: Integrate with WP-011 and WP-012 only through WP-019
- Follow-up packets: WP-019, then WP-020–WP-023
- Integration-ready: Yes
