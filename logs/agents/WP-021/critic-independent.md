# Agent Log — WP-021 — Critic/Independent

- **Packet:** WP-021 Politics, Support, Claim, Church and Succession
- **Role:** Critic
- **Git target:** `main`
- **Starting revision:** `997716ac12b5573188d413d66ca8a982238414a5`
- **Reviewed candidate:** uncommitted WP-021 owned-path result over `613a3de16b1962313f2b146e9dfacbd99c64aa03`; WP-020/WP-023 advanced `main` during review
- **Ending revision:** pending implementer commit
- **Status:** Ready for integration

## Scope

Owned review surface:

- `src/sim/systems/{relationships,politics,support,claim,church,succession}/**`
- `src/sim/systems/actions/politics/**`
- `src/sim/projections/politics/**`
- `tests/sim/{politics,succession}/**`
- `wiki-site/game-systems/{politics-and-support,claim-church-succession,endings}.md`
- WP-021 packet, canonical politics/evaluation/rules/actors/balance/amendments, implementer log and independent hunter log

Explicitly out of scope:

- Editing production code, tests or wiki; this critic created only this log.
- WP-022 military implementation, including its concurrently dirty formatter failure.
- WP-029 cross-packet authoritative-state and scheduler wiring.

## Work performed

- Read the packet and canonical inputs before inspecting the implementation and evidence.
- Reviewed every WP-021 production module, focused test and owned wiki page against the exact political constitution.
- Attacked preference hysteresis, Request start/resolution timing, Proof identity, Agreement/Support lifecycle, two-sided Joint Campaign collateral, bargain condition gates, same-time declaration ordering, relationship replay, off-dawn Church timing and all Council tie-breaks.
- Independently reran the expanded WP-021 suite, combined Wave 2 simulation suite, scoped formatting, typecheck, wiki build and production build.
- Rechecked each repair in the actual source and its regression rather than accepting the implementer narrative.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| Observer knowledge, military leverage and secret discovery remain supplied facts | WP-021 forbids imports of WP-022/WP-023 private state | WP-029 must preserve these typed seams |
| A normal Agreement termination releases a Pledge but does not itself break a Commitment | Canonical Commitment breakers are authored betrayal, Red Line, withdrawal or catastrophe | WP-029 must invoke `breakCommitment` only for an authored breaker |
| Shared full-repository formatting failure is external to this verdict | The sole failure is `tests/sim/war/hostile-correctness.test.ts`, owned by concurrent WP-022 review | It must be cleared before the shared commit/push gate, but does not invalidate WP-021 scoped evidence |

## Findings and resolution

| # | Severity | Finding and evidence | Resolution/status |
|---:|:---:|---|---|
| 1 | P1 | `choosePreference` returned Unaligned for current Renard 14 versus challenger Greyfen 18 (lead 4), violating the retain band and resetting maturation near ties. | Fixed: retain unless the challenger meets the full switching gate; exact regression passes. |
| 2 | P1 | Exact evaluation omitted Mara's Provincial Liberties +6 and Ysabel's Defaulted Debtor -25, and could not emit binding/Proof-maturation reasons. | Fixed: authored flags/weights and ordered structured reasons added. |
| 3 | P1 | Same-time ordinary evaluation ties ignored declaration `sequenceId` and fell to stable ID. | Fixed: day then `sequenceId` precedes stable ID; Council regression passes. |
| 4 | P1 | Deathbed Offer Bargain remained two days, and Patronize Church could schedule inside its 21-day cooldown and charge Gold. | Fixed: Deathbed bargain is one day; planner blocks Patronage cooldown before charging. |
| 5 | P1 | Request resolution could not distinguish a premature start from later external invalidation; the first repair still allowed an immature Request to mature during the Order and Pledge. | Fixed: a serialized start assessment travels through the cloned action effect; false-at-start always yields -4/7 days, while valid-at-start external failure yields -2/no cooldown. |
| 6 | P1 | Arbitrary string Proof IDs could manufacture a Pledge. | Fixed: `ProofId` plus runtime voter-specific whitelist; fake and cross-voter regressions pass. |
| 7 | P1 | Agreement breach/release/collapse had no Support transition; the first repair incorrectly broke Commitment on ordinary release. | Fixed: exact participant-aware agreement revalidation releases Pledge, detaches/preserves Commitment, and leaves explicit authored breakers to `breakCommitment`. |
| 8 | P1 | Edric Joint Campaign locked only Greyfen's 100 troops although the frozen contract requires both sides to commit 100. | Fixed: per-owner atomic locks deduct/release Greyfen and Edric; insufficient-Edric and save-safe lifecycle regressions pass. |
| 9 | P1 | Bargain acceptance ignored frozen active-condition exclusions, allowing Oathbreaker/Defaulted Debtor/Usurper bargains to lock collateral. | Fixed: exact per-bargain condition gates reject before mutation. |
| 10 | P1 | Church Patronage rejected valid off-dawn fractional elapsed days despite the hour scheduler. | Fixed: finite non-negative elapsed days are accepted; exact 20.99/21-day cooldown boundary is tested. |
| 11 | P2 | Expired relationship modifier IDs could be replayed because duplicate detection inspected only active modifiers. | Fixed: historical IDs remain spent after expiry; structured-clone replay regression passes. |
| 12 | P2 | Required deterministic evidence did not make final Commitment/Prestige or elimination Claim/Prestige tie-breaks independently decisive. | Fixed: table-driven decisive scenarios now cover every constitutional step. |
| 13 | P2 | Agreement revalidation accepted a same-ID record with mismatched candidate/supporter identities. | Fixed: full participant identity is enforced and corruption throws. |
| 14 | P2 | Wiki text said ordinary Agreement termination released Commitment after code was corrected to preserve it. | Fixed: wiki now distinguishes Pledge release from authored Commitment breakers. |

No critic finding remains unresolved. No canonical-rule defect or balance-only issue was found, so `$design-guard` and `$tune` were not triggered.

## Acceptance tests independently verified

- Canonical opening evaluations and private positions are exact.
- Leaning maturation is phase-specific, pause/save stable, start-gated and resistant to refusal churn.
- Future offices, Leaning-only concessions and fake/cross-voter Proof cannot produce a voluntary Pledge.
- Commitment survives ordinary evaluation and Agreement completion; only explicit authored breakers end it.
- Under Duress releases with leverage, spent secrets cannot be reused, and private blackmail stays hidden from uninformed observers.
- Claim bands, Research/Forge, Forgery exposure, Rumor confession, Church case, Patronage and Penance match authored arithmetic.
- Bargain collateral is acceptance-time atomic, replay-safe, target/condition checked, office-unique and owner-correct.
- Military Acclamation, coalition, every elimination/final tie-break, sole candidate, dispossession and player-eliminated manual vote have deterministic reconstructions.
- Greyfen's historical vote remains a loss and cannot restore candidacy.
- Political action semantics distinguish ordinary sealed confirmation from hostile/destructive actions without literal color coupling.
- UI projections hide candidate totals; no relationship shortcut or kingdom-wide king score exists.

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| `pnpm exec vitest run --config vitest.sim.config.ts tests/sim/politics tests/sim/succession --reporter=verbose` | Pass | Initial independent candidate: 69/69 before critic repairs. |
| `pnpm exec vitest run --config vitest.sim.config.ts tests/sim/politics tests/sim/succession` | Pass | Final candidate: 7 files, 80/80. |
| `pnpm exec vitest run --config vitest.sim.config.ts --maxWorkers=1` | Pass | Combined Wave 2 simulation: 30 files, 196/196. |
| `pnpm exec biome check <WP-021 production/test/wiki paths>` | Pass | 26 files clean. |
| `pnpm typecheck` | Pass | Full strict TypeScript build graph clean. |
| `pnpm wiki:check` | Pass | VitePress production wiki build completed. |
| `pnpm build` | Pass | TypeScript plus Vite production build; 130 modules transformed. |
| `pnpm check` | External fail only | Sole formatter failure is concurrent WP-022 `tests/sim/war/hostile-correctness.test.ts`; no WP-021 issue. |

## Design, balance, schema and release impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Shared contracts changed: none
- Save/schema impact: WP-029 must serialize the owned Support clocks/refusals/shocks/start assessments, accepted Agreement IDs, per-owner collateral locks, spent secret leverage, threat history, Access Debt, Claim/Church state and succession reconstruction.
- Wiki pages reviewed: `politics-and-support.md`, `claim-church-succession.md`, `endings.md`
- Release impact: headless checkpoint candidate once WP-029 integrates the typed seams and the shared full gate is clean.

## Risks and deferred work

- WP-029 must wire resource charging, scheduler hours, action history, observer knowledge, active conditions, leverage revalidation and death resolution without bypassing these state machines.
- WP-040 still owns route-frequency and value tuning; this correctness review provides no evidence for changing values.
- Concurrent WP-022 must clear its dirty formatter failure before the repository-wide standard gate and push.

## Integration notes

- Shared contracts touched by critic: none
- Files created by critic: `logs/agents/WP-021/critic-independent.md`
- Follow-up packets: WP-029 for integration; WP-040 for later evidence-based tuning
- Final verdict: **Clear for integration**
- Integration-ready: **Yes**, scoped to WP-021; shared commit/push still requires the external WP-022 formatter fix and final synchronization with `origin/main`.
