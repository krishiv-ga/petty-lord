# Agent Log — WP-010 — Critic/Codex

- **Packet:** WP-010 Deterministic Simulation Kernel
- **Role:** Critic
- **Branch/worktree:** `wp/WP-010-deterministic-simulation-kernel`
- **Starting revision:** `5c154a87e899e924dc6c4f0395dad960b3367578`
- **Ending revision:** `ccadf9a`
- **PR:** https://github.com/krishiv-ga/petty-lord/pull/2
- **Status:** Complete — clear for integration

## Scope

Owned path:

- `logs/agents/WP-010/critic-codex.md`

Reviewed scope:

- initial implementation diff `5c154a87..bc6383a`
- six-finding remediation diff `bc6383a..2fa77ac`
- decision-softlock remediation diff `2fa77ac..ccadf9a`
- all WP-010 production, test and owned wiki paths

Explicitly out of scope:

- production-code fixes; all fixes remained implementer-owned
- content, UI, economy, politics, war, AI, events and succession implementation
- WP-019 integration and shared-contract freeze

## Work performed

- Read the packet, canonical inputs, technical stack, repository skill/index/wiki material and Wave 00
  compacted log before reviewing the implementation.
- Confirmed Wave 1 legality and path ownership, then inspected the actual committed code and tests rather
  than relying on the implementer narrative.
- Attacked alternate time chunking, terminal resolution, same-time recursion, decision creation/resume,
  invalid commands/imports, seed entropy, pause behavior, PRNG state, aliases, forbidden dependencies and
  premature domain ownership.
- Reproduced two P1 and four P2 findings against `bc6383a`; reran their exact probes against `2fa77ac`,
  where all six passed.
- During remediation review, found and reproduced a further P1 zero-choice mandatory-decision softlock
  against `2fa77ac`. Inspected `ccadf9a` and reran the exact counterexample; invalid resolver-created
  decisions now fail atomically.
- Ran the relevant full repository gates against final revision `ccadf9a`. Disposable critic probes were
  removed after execution; this log is the critic's only worktree modification.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| The Wave 00 gate, not WP-010's stale header, determines legality | `work-packets/INDEX.md` and `logs/compacted/WAVE-00.md` explicitly open Wave 1 | No legality finding |
| Fractional command deltas are in scope | Live pacing converts wall time into fractional simulation hours; the packet requires chunk-independent outcomes | Integer-only replay evidence was insufficient |
| `succession` is a frozen-clock ending phase | Canonical death locks initiatives and there is no post-coronation clock; mandatory decisions remain explicitly resolvable | WP-019 must preserve this status contract |
| Public TypeScript boundaries still require runtime validation | TypeScript types disappear at runtime; the packet requires structured, recoverable invalid-command/import errors | Invalid commands, saves and resolver decisions must fail atomically |

## Critic findings and final resolution

| Severity | Finding/evidence | Final resolution |
|---|---|---|
| **P1** | Fractional time chunking changed outcomes: one `ADVANCE_TIME(1)` resolved work due at hour 1, while ten `ADVANCE_TIME(0.1)` calls stopped at `0.9999999999999999`. | **Fixed in `2fa77ac`.** Canonical micro-hour normalization is applied to stored time and public deltas; the exact 1-vs-10×0.1 probe passes and is a permanent replay regression. |
| **P1** | A resolver could set `won` at hour 1 yet the scheduler continued to hour 10 and resolved later work; terminal state also accepted `START_INITIATIVE`. | **Fixed in `2fa77ac`.** Non-playing status stops the active advance at the transition timestamp, leaves later work queued and locks initiative start/cancel. Exact terminal probe passes. |
| **P1** | Re-review found that a fully typed resolver could open `{ choiceIds: [] }`, force speed 0 and create an unresolvable mandatory-decision softlock. | **Fixed in `ccadf9a`.** `openDecision` validates non-empty IDs/kinds, non-empty unique choices and JSON payloads before state entry. The exact zero-choice counterexample now returns atomic `RESOLVER_FAILURE` with the original state. |
| **P2** | Runtime command enums were trusted; speed `3` entered canonical state and invalid advance mode was accepted. | **Fixed in `2fa77ac`.** Runtime speed/mode, IDs, numeric ranges and JSON payload validation return structured failures with original-state identity. Exact invalid-speed probe passes. |
| **P2** | Import accepted malformed kernel-owned decisions and diagnostics, including duplicate empty choices, negative opening time, string source sequence and negative diagnostic limit. | **Fixed in `2fa77ac`.** Nested kernel shapes, ranges, sequence references and bounded traces are validated. Exact hostile import probe returns `INVALID_STATE`. |
| **P2** | String seeds collapsed to a 32-bit hash; distinct `18l1cn2-169a` and `1dsiqji-19fy` produced identical PRNG state. | **Fixed in `2fa77ac`.** Stable 64-bit FNV-1a input is expanded into the generator's four-word state; the reported collision pair now differs and is a permanent regression. |
| **P2** | Public instant advancement bypassed speed 0, contradicting pause acceptance. | **Fixed in `2fa77ac`.** All public advancement modes respect pause; instant only skips pacing while active. Exact pause/instant probe passes. |

No unresolved P0–P3 finding remains.

## Acceptance tests independently verified

| Acceptance item | Final result | Evidence/notes |
|---|---|---|
| Same seed + same commands gives identical normalized state/trace | Pass | Repeated replay fixture and normalized hash pass |
| Save midway/reload equals uninterrupted execution | Pass | Exact serialized continuation passes |
| 72 hours once equals hourly/daily chunks | Pass | Official integer replay plus critic fractional-boundary probe pass |
| Mandatory decision freezes later work and resumes exactly | Pass | Existing decision test plus invalid-decision atomic regression pass |
| Same-time priority/sequence including recursion | Pass | Comparator, recursive scheduling and resolution-limit tests pass |
| Pause does not advance; 1×/2× remain pacing only | Pass | Both paced and instant requests remain frozen at speed 0 |
| PRNG state round-trips; no simulation `Math.random()` | Pass | PRNG/snapshot tests and repository scan pass |
| Invalid/corrupt import is structured and atomic | Pass | Shallow and hostile nested import tests pass |
| Fake domain registration requires no kernel modification | Pass | Starter, resolver, decision, terminal and invalid-decision fixtures pass |
| Owned tests and relevant standard gates pass | Pass | See final validation table |
| Independent critic exists and severe findings are resolved | Pass | This log records all finding dispositions and final re-review |
| Owned wiki pages describe contracts truthfully | Pass | Time, pause, terminal, seed, import and resolver-decision contracts match final code |

## Final validation at `ccadf9a`

| Command/check | Result | Evidence/notes |
|---|---|---|
| Exact six original disposable adversarial probes | Pass | 6/6: fractional chunks, terminal lock, invalid speed, hostile import, seed collision and paused instant advance |
| Targeted zero-choice resolver counterexample | Pass | 1/1; `tests/sim/kernel/scheduler.test.ts` atomic invalid-decision regression |
| `pnpm test:sim` | Pass | 7 files, 28 tests |
| `pnpm test` | Pass | 2 files, 3 tests |
| `pnpm check` | Pass | 49 files; no fixes |
| `pnpm typecheck` | Pass | `tsc -b` |
| `pnpm build` | Pass | TypeScript and Vite production build; 22 modules |
| `pnpm wiki:check` | Pass | VitePress production build completed |
| `git diff --check 5c154a87..ccadf9a` | Pass | No whitespace errors |
| Forbidden API/dependency scan | Pass | No browser/time/storage/React/content/UI dependency or `Math.random()` in `src/sim`; `pure-rand` remains adapter-only |

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none; fixes bring implementation into conformance with the existing clock, pause,
  terminal, decision, import and 64-bit-seed contracts
- Balance values changed: none
- Save/schema impact: unreleased schema version `1` now enforces canonical micro-hour precision and complete
  kernel-owned validation; stored PRNG state remains serializable and exact
- Wiki pages verified: `architecture/deterministic-sim.md`, `architecture/scheduler-and-rng.md`,
  `reference/state-schema.md`

## Risks and deferred work

- WP-019 must reconcile/freeze the generic extension seams with WP-011 schemas and preserve the documented
  frozen-clock `succession` contract.
- Runtime domain-extension validation remains intentionally delegated to WP-019's Zod seam; kernel-owned
  time, status, scheduler, decisions, commands, diagnostics and serialization are covered here.
- No balance, release or UI risk was introduced by this packet.

## Integration notes

- Shared contracts touched: packet-owned public modules only; no root/shared barrel changed
- Merge order constraints: integrate with WP-011 and WP-012 only through WP-019
- Follow-up packets: WP-019, then WP-020–WP-023
- Integration-ready: **Yes**
- Final verdict: **Clear for integration**
