# Agent Log — WP-010 — Critic/Codex

- **Packet:** WP-010 Deterministic Simulation Kernel
- **Role:** Critic
- **Branch/worktree:** `wp/WP-010-deterministic-simulation-kernel`
- **Starting revision:** `5c154a87e899e924dc6c4f0395dad960b3367578`
- **Ending revision:** `bc6383a`
- **PR:** pending
- **Status:** Needs fixes

## Scope

Owned paths:

- `logs/agents/WP-010/critic-codex.md`

Reviewed paths:

- committed diff `5c154a87..bc6383a`
- `src/sim/kernel/**`
- `src/sim/state/**`
- `src/sim/random/**`
- `src/sim/serialization/**`
- `src/sim/testing/**`
- `tests/sim/kernel/**`
- `tests/sim/determinism/**`
- the three WP-010-owned wiki pages

Explicitly out of scope:

- production-code fixes; disposition belongs to the implementer
- content, UI, economy, politics, war, AI, events and succession implementation
- WP-019 integration and shared-contract freeze

## Work performed

- Read the packet, canonical design inputs, technical stack, repository skill index, wiki entry point,
  Wave 00 compacted log and actual committed diff before consulting implementer evidence.
- Confirmed WP-010 was legal to run after the Wave 00 integration gate and stayed within its owned
  paths.
- Inspected scheduler ordering, recursive scheduling, decision/resume, PRNG state and snapshots,
  command handling, import validation, transition cloning, diagnostics and generic extension seams.
- Ran the official simulation and repository gates independently.
- Added and ran disposable adversarial Vitest probes for fractional time chunking, terminal-state
  transitions, invalid runtime commands, malformed imports and seed collisions. All disposable files
  were removed after evidence capture; no production or test source remains modified by the critic.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| The Wave 00 gate, not WP-010's stale header, determines legality | `work-packets/INDEX.md` and `logs/compacted/WAVE-00.md` explicitly open Wave 1 | Review proceeded; no legality finding |
| Fractional command deltas are in scope | The live pacing adapter must convert wall-time into simulation hours, and the packet requires chunk-independent outcomes | Integer-only replay evidence is insufficient |
| `won` and `lost` are terminal; `succession` needs an explicit integration contract | Canonical game end locks initiatives and has no post-coronation simulation | Fix must halt terminal work without accidentally blocking the authored succession resolver |
| Runtime validation is required at the public kernel boundary | TypeScript types disappear at runtime and the packet requires structured, recoverable invalid-command/import errors | Public commands may not write invalid canonical state |

## Critic findings and resolution

| Severity | Finding | Resolution/status |
|---|---|---|
| **P1** | **Fractional time chunking changes authoritative outcomes.** Location: `src/sim/kernel/engine.ts:139-142` and `src/sim/kernel/scheduler.ts:233-237`. Reproduction: schedule `fake.increment` at hour `1`; one instant `ADVANCE_TIME(1)` resolves it, but ten instant `ADVANCE_TIME(0.1)` calls finish at `0.9999999999999999` and leave the item unresolved. Expected: equivalent elapsed simulation time must produce byte-equivalent state independent of pacing chunks. Impact: live frame/batch slicing can delay dawn work, Orders or death relative to a replay/headless run, defeating the central determinism contract. Recommended resolution: represent canonical time in exact integer ticks (or another explicitly quantized exact unit), validate/normalize command deltas at the boundary, and add fractional chunk/save-reload regressions around due-time boundaries. | **Unresolved — blocker** |
| **P1** | **Terminal transitions neither stop the active scheduler advance nor lock new initiatives.** Location: `src/sim/kernel/scheduler.ts:233-301` and `src/sim/kernel/engine.ts:163-170`. Reproduction: a registered resolver sets `status: 'won'` at hour `1`, another item is due at hour `2`, and an instant advance to hour `10`; the result reaches hour `10` and resolves the later item. Separately, `START_INITIATIVE` succeeds from a `lost` state. Expected: `won`/`lost` halt later resolution, and death/succession status locks new initiatives under the canonical game-end contract. Impact: post-ending Orders/events can mutate the result, consume RNG and change ending evidence during large headless or catch-up advances. Recommended resolution: gate initiative start on the legal active status, stop resolution immediately on terminal status, and document/test the distinct `succession` transition semantics so only authored ending work can proceed. | **Unresolved — blocker** |
| **P2** | **The runtime command boundary accepts invalid enum values and writes them into canonical state.** Location: `src/sim/kernel/engine.ts:111-123`; `ADVANCE_TIME.mode` is likewise not checked at `:125-146`. Reproduction: pass `{ type: 'SET_REQUESTED_SPEED', speed: 3 }` through the JavaScript API (cast only to bypass compile-time checking); the result is `ok: true` with `state.speed === 3`. Expected: a structured failure with the original state unchanged. Impact: malformed application/debug input can create a state that the save importer itself rejects. Recommended resolution: exhaustively runtime-validate every command discriminant and payload used by the kernel, including speed/mode and JSON compatibility, before dispatch. | **Unresolved — material** |
| **P2** | **Import validation accepts malformed kernel-owned decision and diagnostic state.** Location: `src/sim/serialization/serialization.ts:159-207`. Reproduction: an otherwise valid save with duplicate empty `choiceIds`, `openedAtTimeHours: -12`, string `openedBySequenceId`, and `diagnostics.limit: -100` imports successfully. Expected: `INVALID_STATE` paths for every malformed kernel-owned field; the optional WP-019 domain validator should only need to validate domain extensions. Impact: corrupt saves can enter impossible decision/resume and diagnostic states, contradicting the acceptance criterion that corrupt import is rejected rather than silently accepted. Recommended resolution: validate the complete `PendingDecision`, `ChronicleEntry`, metadata, flags and diagnostics shapes, including ranges, uniqueness and sequence references; add hostile nested-import tests. | **Unresolved — material** |
| **P2** | **String seeds collapse to 32 bits, contradicting the canonical stored 64-bit seed and permitting distinct replay seeds to share the entire RNG stream.** Location: `src/sim/random/random.ts:17-23,58-59`. Reproduction: distinct seeds `18l1cn2-169a` and `1dsiqji-19fy` produce byte-identical serialized initial PRNG state. Expected: the canonical 64-bit seed contract should retain at least 64 bits of seed entropy and different supported seed values should not trivially alias through a 32-bit adapter hash. Impact: displayed/replay seed identity is not unique to a run stream and the different-seed test only proves one sampled pair. Recommended resolution: define the supported 64-bit seed encoding and deterministically expand all 64 bits into the approved generator state; preserve/version the mapping and add this collision pair as a regression. | **Unresolved — material** |
| **P2** | **Public instant advancement bypasses canonical pause.** Location: `src/sim/kernel/engine.ts:125-142`; only `mode === 'paced'` checks `speed === 0`. Reproduction: set speed to `0`, then issue public `ADVANCE_TIME` with `mode: 'instant'`; time advances. Expected: the packet acceptance contract says pause does not advance state, while debug/headless override must be explicitly separated or gated. Impact: an adapter selecting the wrong public mode defeats user pause/hidden-tab pause and can advance authoritative state unexpectedly. Recommended resolution: keep production `ADVANCE_TIME` pause-safe and move forced headless advancement to a separately named test/debug API or require an explicit debug capability. | **Unresolved — material** |

No P0 finding was identified.

## Acceptance tests independently verified

| Acceptance item | Result | Evidence/notes |
|---|---|---|
| Same seed + same commands gives identical state/trace | Pass for covered integer fixture | Official repeated replay test passes |
| Save midway/reload matches uninterrupted | Pass for covered fixture | Official serialization continuation test passes |
| 72 hours once equals 72 one-hour advances | Pass literally; broader chunk independence fails | Integer replay passes; P1 fractional counterexample fails |
| Mandatory decision stops later scheduled resolution | Pass for covered decision case | Stops at exact timestamp and rejects nonzero speed |
| Same-time priority/sequence including recursion | Pass | Official same-time and recursion tests pass; resolution guard is atomic |
| Pause does not advance; 1x/2x are pacing only | **Fail** | Paced pause passes, but public instant mode advances paused state (P2) |
| PRNG round-trip; no `Math.random()` in simulation | Pass, with seed-contract finding | State/snapshot tests and repository scan pass; P2 32-bit collision remains |
| Invalid/corrupt import is structured and atomic | **Fail** | Shallow corrupt fixture passes; hostile nested kernel state is accepted (P2) |
| Fake domain can register without kernel edits | Pass | Registry/fake-domain command and scheduler tests pass |
| Owned tests and standard gates pass | Pass | See validation table |
| Independent critic exists and severe findings resolved | **Fail** | This log exists; two P1 findings remain unresolved |
| Owned wiki describes contracts truthfully | Needs fixes | Wiki omits fractional-time/terminal limitations and documents intentional instant mode despite the pause acceptance conflict |

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| `pnpm test:sim` | Pass | 7 files, 22 tests |
| `pnpm test` | Pass | 2 files, 3 tests |
| `pnpm check` | Pass | 48 files; no fixes |
| `pnpm typecheck` | Pass | `tsc -b` |
| `pnpm build` | Pass | Vite production build, 22 modules |
| `pnpm wiki:check` | Pass | VitePress production build completed |
| `git diff --check 5c154a87..bc6383a` | Pass | No whitespace errors |
| Forbidden API/dependency scan | Pass | No browser/time/storage/React/content/UI imports or `Math.random()` in `src/sim`; `pure-rand` imports only in the adapter |
| Adversarial fractional chunk probe | **Fail (finding reproduced)** | `1` versus ten `0.1` advances yielded time `1`/resolved versus `0.9999999999999999`/unresolved |
| Adversarial terminal-state probe | **Fail (finding reproduced)** | Terminal resolver at hour 1 still advanced to hour 10; starting initiative from `lost` returned success |
| Adversarial invalid-command probe | **Fail (finding reproduced)** | Runtime speed `3` returned success and entered canonical state |
| Adversarial nested-import probe | **Fail (finding reproduced)** | Malformed pending decision and negative diagnostic limit imported successfully |
| Adversarial seed-collision probe | **Fail (finding reproduced)** | Two distinct strings produced identical serialized PRNG state |

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none; findings require implementation to conform to existing deterministic clock,
  terminal-state, pause, invalid-import and 64-bit-seed contracts
- Balance values changed: none
- Save/schema impact: fixes may require a versioned PRNG seed-mapping change and stricter schema-version-1
  import validation; WP-019 must decide whether the unreleased schema can be corrected in place
- Wiki pages updated: none by critic; the three owned pages need correction after implementation fixes

## Risks and deferred work

- The generic extension seam appropriately avoids premature economy/politics/war/AI ownership, but WP-019
  still must freeze how `succession` differs from terminal `won`/`lost` scheduler behavior.
- The resolution ceiling, same-time comparator, decision queue stop, transition cloning, snapshot helper and
  forbidden-dependency boundaries survived review.
- Runtime post-transition invariant enforcement remains worth considering after command validation; domain
  handlers are currently trusted to return JSON-compatible finite state.

## Integration notes

- Shared contracts touched: review only; no production/shared seam modified
- Merge order constraints: implementer must resolve both P1 findings and rerun the adversarial plus full
  gates before WP-019 integration
- Follow-up packets: WP-010 remediation, then WP-019 contract freeze
- Integration-ready: **No**
- Final verdict: **Needs fixes**
