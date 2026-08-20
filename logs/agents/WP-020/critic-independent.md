# Agent Log — WP-020 — Critic/Independent

- **Packet:** WP-020 Time, Royal Health, Economy, Orders and Common Actions
- **Role:** Critic
- **Git target:** `main`
- **Starting revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283`
- **Ending revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283` (reviewed uncommitted shared-main candidate)
- **Status:** Ready for integration

## Scope

Owned review paths:

- `src/sim/systems/{time,king,economy,orders,actions/core,actions/common}/**`
- `src/sim/projections/resources/**`
- `tests/sim/{time,economy,orders,actions/common}/**`
- `wiki-site/game-systems/time-economy-orders.md`
- `logs/agents/WP-020/**`

Explicitly out of scope:

- Concurrent WP-021, WP-022 and WP-023 production/test/wiki files, except cross-packet contract seams
- Implementing fixes; the implementer owned every production, test and wiki remediation

## Work performed

- Read the packet, canonical game rules/balance/world inputs, frozen Wave 2 contracts, implementer evidence, technical authority, wiki authority and latest compacted Wave 1 log.
- Inspected every WP-020 owned production file, focused test and wiki page on the actual shared-main candidate.
- Attacked dawn ordering, fixed-point economy/cap behavior, occupation queries, two-slot lifecycle, cancellation/invalidation, reactions, anti-spam, save import, projections and presentation semantics.
- Ran disposable adversarial probes for death-event mismatch, missing required state, future-reaction resume speed, deleted dawn backbone and forged health phase. All probe files were removed after evidence capture.
- Re-reviewed the implementer's fixes and repeated focused, scoped quality, save/replay and wiki gates.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| Treat valid-shape but impossible cross-field saves as a broken-save defect | A mismatched stored death day imported successfully and then failed at the death resolver; a deleted dawn silently removed income/recovery | WP-020 import must validate domain shape plus scheduler/domain coherence, not only primitive bounds |
| Capture reaction resume speed when the reaction opens | Requested speed can change between queue time and the scheduled interruption | Preserves the actual pre-pause request through save/load without making UI timing authoritative |
| Enforce the WP-019 effect envelope | `Wave2DomainModule` and `FoundationEffect` are frozen integration contracts | WP-029 receives discriminated `domain`/`type` effects instead of untyped string-only messages |
| Treat concurrent full-gate failures as external blockers, not WP-020 findings | Failures reproduce solely in WP-021/WP-023 owned files and the WP-020 focused/scoped gates are green | WP-029 must rerun the full shared-main gate after all four packet candidates settle |

## Critic findings and resolution

| Severity | Finding | Reproduction/evidence and expected behavior | Resolution/status |
|---|---|---|---|
| P1 | WP-020 import accepted incomplete or internally contradictory saves | Disposable probes changed `king.deathDawnElapsedDay` without its scheduled item, deleted `invalidTargets`, deleted a future dawn, and forged Deathbed at hour zero. All originally imported `ok: true`; the mismatched death save later returned a resolver failure. Import must reject impossible state before use. | **Fixed and verified.** Full nested shape validation, immutable territory identity, Order/reaction/event coherence, exact death draw/event, exact remaining dawn/phase/prognosis backbone, canonical traces and current-time timestamp bounds were added. Permanent corrupt-import regressions pass; the critic's deleted-dawn/forged-phase recheck now passes. |
| P1 | WP-020 bypassed the frozen Wave 2 effect/module contract | Module/resolvers used generic `DomainModule`/`SimulationEffect`; effects lacked required `domain: 'time'` and `type: 'effect'` discriminants. This broke the shared contract intended for WP-029 routing. | **Fixed and verified.** `Wave2DomainModule`, `FoundationScheduledResolver`, `FoundationEffect` and typed `timeEffect` now govern the boundary; focused tests assert the discriminants. |
| P2 | Future reactions captured stale resume speed at queue time | Disposable probe queued at speed 1, changed to speed 2 before opening, saved/loaded and selected; emitted `resumeSpeed` was 1. Expected the speed immediately before automatic pause. | **Fixed and verified.** The open resolver snapshots `state.speed`; permanent future-due, speed-change and save/load regression emits 2. The application explicitly issues the follow-up speed request as documented. |
| P2 | Resource projection could label expired conditions active and omitted levy-recovery reasons | Projection mapped raw condition arrays and exposed only scalar `dailyLevyRecovery`, contrary to the active-condition and income/recovery-reasons contract. | **Fixed and verified.** Projection filters conditions at `state.timeHours`, rate helpers receive the filtered territories, `activeConditions` also respects start time, and `dailyLevyReasons` exposes per-territory machine reasons. Exact mid-dawn expiry regression passes. |

No finding remains unresolved.

## Acceptance tests independently verified

- Phase transitions, prognosis and seeded death are chunk- and save-stable; canonical phase trace is exact.
- An Order due on the death dawn resolves before the death effect and succession status.
- Two active player slots reject a third initiative while a reaction bypasses capacity and pauses the kernel.
- Cancellation, timestamp progress, target invalidation, Raise Taxes occupation fallback and partial Court invitee fallback release capacity without softlock.
- The 56-day deterministic economy table and conditioned fractional fixture match exact Gold/levy outcomes without drift or cap banking.
- Occupation grants authored 25% income while denying legal income, levy recovery and legal traits.
- Raise Taxes escalation and Gift/Court diminishing/refusal state survive save/load and concurrent timestamp accounting.
- Common previews expose costs, duration, collateral, locked troops, visibility, consequences, cancellation loss, fallback, unknowns, warnings and semantic intent.
- Typed normal confirmation/commitment remains distinct from danger; no literal color/style coupling, browser clock, wall clock or UI/storage import exists in owned simulation/projection code.
- Wiki content builds and matches the implemented contracts and WP-029 handoff.

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| Focused WP-020 Vitest command | Pass | 4 files, 21 tests after all remediations |
| Disposable corrupt-import probes | Initially failed, then pass after remediation | Death mismatch caused runtime failure before fix; missing dawn/forged phase are now rejected; disposable files removed |
| `pnpm exec biome check` on all 25 WP-020 owned source/test/wiki files | Pass | No findings |
| `pnpm wiki:check` | Pass | Isolated VitePress build succeeds; one earlier parallel run collided in `.vitepress/.temp` |
| `pnpm test:sim` | External fail | 178/179; sole failure is concurrent WP-021 `bargain-collateral-mismatch:ysabel-escrow` |
| `pnpm test` | External fail | 45/46; sole failure is concurrent WP-023 `systems/events/events.ts` sim-to-content import |
| `pnpm build` | External fail | Concurrent WP-021 `BargainCollateral` narrowing and WP-023 possibly-undefined event-window errors; no WP-020 diagnostic |
| No-wall-clock/browser/color coupling scan | Pass | No production hit under owned paths |

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Save/schema impact: versioned `systems.time` payload remains version 1; import validation is substantially hardened without changing the frozen root schema version
- Shared contract impact: WP-020 now conforms to the frozen Wave 2 module/effect envelope; no frozen contract file changed
- Wiki pages reviewed: `wiki-site/game-systems/time-economy-orders.md`

## Risks and deferred work

- WP-029 must reconcile WP-020 `commit | confirm | danger` preview intent names with WP-021's standalone political semantic vocabulary and retain a real Offer Bargain versus Break Agreement fixture.
- WP-029 must route relationship, politics, war, AI, succession and reaction consumers exactly once and make every integrated action use the shared capacity/resource lifecycle.
- Full shared-main typecheck/unit/simulation/build gates remain blocked by concurrent WP-021/WP-023 files; the integrator must rerun them after those packet owners settle their candidates.
- No WP-020 production/test/wiki defect remains from this review.

## Integration notes

- Shared contracts touched: none; WP-020 now consumes `Wave2DomainModule`/`FoundationEffect` as frozen
- Reconciliation/order constraints on `main`: preserve dawn priority 100 → 400 → 500/550 → 600 and do not consume one effect twice
- Follow-up packets: WP-029
- Integration-ready: **Yes for WP-029**, contingent on the integrator obtaining green combined shared-main gates

## Final verdict

**Clear for integration.** All P1/P2 WP-020 findings were fixed by the implementer and independently rechecked. The remaining red full-repository gates are confined to concurrent packet ownership and must be cleared at the serialized WP-029 gate.
