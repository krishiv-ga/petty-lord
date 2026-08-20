# Agent Log — WP-023 — Critic/Independent

- **Packet:** WP-023 Rival AI, Observer Knowledge, Secrets, Openings and Events
- **Role:** Critic
- **Git target:** `main`
- **Starting revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283`
- **Ending revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283` (reviewed frozen uncommitted WP-023 candidate)
- **Status:** Ready for integration

## Scope

Owned write path:

- `logs/agents/WP-023/critic-independent.md`

Read-only review paths:

- `src/sim/systems/{ai,knowledge,intelligence,secrets,openings,events}/**`
- `src/sim/systems/actions/intelligence/**`
- `src/sim/projections/knowledge/**`
- `tests/sim/{ai,knowledge,events}/**`
- `wiki-site/game-systems/ai-knowledge-events.md`
- `logs/agents/WP-023/{implementer-codex,hunter-independent}.md`

Explicitly out of scope:

- Concurrent WP-020, WP-021 and WP-022 production, test, wiki and log paths
- WP-029 cross-domain scheduler/action/effect integration
- WP-040 balance tuning

## Work performed

- Read the packet, canonical AI/information, actor/opening/secret, action, candidate-evaluation,
  balance and relevant paperplay contracts before inspecting the implementation.
- Audited all WP-023 production paths and tests for observer leakage, one-Intent capacity, resource
  accounting, stored randomness, event closure, secret invalidation, notification pacing, structural
  simulation boundaries and JSON-safe state.
- Ran focused and full simulation gates plus novel inline Vite probes for conditional event effects,
  forbidden ambient days, canonical observer threat, hidden-knowledge candidate gating, invalidation
  timing and JSON round trips.
- Reported findings during the frozen pass, then independently re-read and reran every remediation.
- Made no production, test, canonical-design or wiki changes.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| Review the live uncommitted candidate at the fixed `main` revision | All four Wave 2 packets are intentionally disjoint uncommitted work on shared `main` | Ending SHA remains the starting SHA; the log identifies the reviewed candidate rather than a commit |
| Treat real action enumeration/effect application as a WP-029 integration gate, not permission for hidden inputs | WP-023 now requires actor-owned knowledge, derives knowledge/threat gates internally and has no authoritative hidden-state input; WP-029 still owns common player action and cross-domain wiring | WP-029 must use the fixed catalog/projection seam and repeat hidden-twin/common-action tests |
| Record remediated findings at their original severity | The critic pass reproduced concrete failures before fixes | Integration has an auditable falsification and resolution trail instead of a clean-only narrative |
| Do not attribute the earlier shared typecheck failures to WP-023 | They reproduced in concurrent WP-020/021/022 files and disappeared after those owners settled | Final live typecheck and full simulation gates are green |

## Critic findings and resolution

| Severity | Finding | Resolution/status |
|---|---|---|
| P1 | Random event results returned contradictory authored placeholder effects: E09 outcome `0` still emitted `-50` garrison, E12 low emitted high-result rewards, and E14 failure emitted both success and failure effects. | **Fixed and verified.** Stored outcomes now materialize exact typed effects; regressions and novel probes cover E06/E09/E12/E14. |
| P1 | The AI entry point accepted caller-computed legality/threat without an observer projection, leaving hidden-data-derived candidate decisions unenforced. | **Fixed and verified.** Decisions require knowledge owned by the acting lord, knowledge requirements and threat are evaluated from the observer projection, and Intent visibility/fallback snapshots are stored. Real action-catalog composition remains an explicit WP-029 gate. |
| P1 | The knowledge projection could not represent public Under Duress versus observer-known secret coercion, so Church/AI/forecast consumers could not preserve the canonical visibility distinction. | **Fixed and verified.** Public and private support knowledge are structurally separated; public secret-coercion leakage is excluded, public duress combinations are validated, and observer-private support carries freshness. Current privately known coercion contributes only to that observer's threat; uninformed or stale-private coercion does not. |
| P1 | A partial Find Dirt result accepted a numeric army value which projected as fresh exact intelligence, bypassing Watch Court's exact-army contract. | **Fixed and verified.** Partial army intelligence is restricted to bands at type and runtime boundaries; projection grants exactness only to confirmed direct/Watch Court observations. |
| P2 | A resolved event follow-up could be queued repeatedly and its authored due time was not enforced. | **Fixed and verified.** State stores the parent resolution hour and resolved follow-up IDs; queueing requires the resolved parent, derives the authored due time internally, and rejects early/missing-parent/replayed follow-ups. |
| P2 | Destroying already invalid evidence could emit repeated `release-secret-coercion` effects. | **Fixed and verified.** Invalid/exposed evidence is rejected and blackmail use is cleared on the first destruction; regression passes. |
| P2 | Ambient cadence trusted an arbitrary caller `windowKey`; Day 11 could select E13 despite falling between canonical ambient slots. | **Fixed and verified.** The engine derives the six canonical slots internally and suppresses outside-slot dawns. |
| P2 | AI invalidation allowed immediate replacement, omitted required visibility/fallback state, and accepted negative/excess troop losses. | **Fixed and verified.** Intent snapshots include visibility/fallback, loss bounds are enforced and invalidation advances eligibility to the next canonical dawn. |
| P2 | Partial army-band observations could remain apparently current forever and override a newer public band. | **Fixed and verified.** Stale partial bands yield to the current public band; regression passes. |
| P2 | Initial observer-threat remediation used invented army-ratio bands and raw army instead of the canonical point formula and exact defense power. | **Fixed and verified.** Projection now applies the exact +20/+15/+10/-10 public/known inputs and canonical band thresholds using observer `defensePower`; novel composite evidence reached `existential` exactly. |
| P2 | The cadence repair introduced a local identifier named `window`, tripping the simulation browser-global architecture guard. | **Fixed and verified.** The identifier was renamed; architecture is 5/5. |
| P2 | Hunter found that discovered evidence could still be exposed after destruction. | **Fixed before final critic pass and independently verified.** Exposure now rejects invalid evidence and cannot resurrect authored scandal effects. |
| P0/P1/P2/P3 | No unresolved finding remains in the isolated WP-023 layer. | **Closed.** |

## Acceptance tests independently verified

- [x] Every NPC holds at most one active Intent; legal reactions preserve it.
- [x] Knowledge-gated/unaffordable candidates are rejected and selected Intents charge Gold,
  Influence and troop locks without negative resources.
- [x] Opening, near-tie, Spy and event randomness is stored and same-seed replay is stable.
- [x] Approved seed corpora vary all four openings, all three Renard vulnerabilities and both near-tie
  choices without escaping canonical bounds.
- [x] Observer projections exclude undiscovered Leanings, Intents, secrets, exact armies, private
  coercion and future death/event draws.
- [x] Exact and partial military intelligence obey source/freshness rules; stale facts do not present
  as exact current truth.
- [x] Every opening contains one legal Renard vulnerability, two distinct additional secrets and at
  least three declared route compatibilities.
- [x] Same-dawn death suppresses ambient selection.
- [x] Routine AI gifts, taxes and harmless court activity remain feed-only; direct/major cases interrupt.
- [x] Find Dirt stores its snapshot/detection outcome, cannot start in Deathbed, cannot expose exact
  troops through partial failure and cannot reroll on reload.
- [x] All 16 authored events have a zero-resource safe fallback; random branches, mandatory
  follow-ups, once rules and canonical ambient slots resolve without a softlock.
- [x] No unresolved P0/P1 cheating, hidden-information or softlock result remains.
- [x] Focused gates, full simulation, typecheck, architecture, formatting and wiki build pass.

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| `pnpm exec vitest run --config vitest.sim.config.ts tests/sim/ai tests/sim/knowledge tests/sim/events` | Pass | Final hardened candidate: 6 files, 34/34 |
| `pnpm exec vitest run tests/unit/architecture.test.ts` | Pass | 5/5; no sim-to-content/browser/UI dependency |
| `pnpm test:sim` | Pass | 30 files, 180/180 across the settled shared Wave 2 checkout |
| `pnpm typecheck` | Pass | Strict `tsc -b`, no diagnostics |
| Focused `pnpm exec biome check ...` | Pass | 18 WP-023 production/test/wiki/log files; no fixes applied |
| `pnpm wiki:check` | Pass | VitePress client/server build and page render complete |
| Novel conditional-event and cadence probe | Pass after fixes | Day 11 suppresses with `outside-ambient-slot`; E09 `0`, E12 `2` and E14 failure return only exact matching effects |
| Novel observer/threat/AI probe | Pass after fixes | Composite canonical public evidence produces `existential`; informed private coercion raises Renard to `concern` while an uninformed observer remains `low`; self idle is known-null; identical serialized knowledge produces byte-identical AI result; invalidation at hour 100 waits until dawn 120; state JSON round-trips |
| Hunter corpus review | Pass | 4,096 opening/Spy seeds, whole event traces, notification sample and destroyed-evidence regression contain no unresolved P0/P1 |

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Save/schema impact: WP-023 introduces JSON-serializable AI, knowledge, secret, opening and event
  domain records, including stored draws, support visibility, `resolvedEventAtHours`,
  `resolvedFollowUpIds` and `nextDecisionAtHours`; WP-029 must compose them into the authoritative
  save schema.
- Wiki pages updated: `wiki-site/game-systems/ai-knowledge-events.md`
- Structural boundary: simulation consumes local structural authored-content views and does not
  transitively import `src/content`.

## Risks and deferred work

- WP-029 must source the AI catalog's dynamic legality, exact costs/durations and targets from the
  common player action contracts, then prove identical candidate lists and choices for authoritative
  hidden-state twins with identical observer knowledge.
- WP-029 must apply event/secret/opening typed effects through real politics, time and war consumers,
  preserve death-before-ambient order in the integrated scheduler and serialize the new domain state.
- WP-029 must exercise leader-versus-latent-threat targeting, invalidation fallback and reaction
  legality in whole-game traces; the isolated layer cannot prove cross-domain correctness.
- WP-040 owns tuning of opening pressure, target repetition/pinball, intrigue cost, stale-information
  shocks and total interruption cadence. No canonical value was silently changed here.

## Unresolved questions

- None blocking WP-023 integration. The listed cross-domain checks are explicit WP-029 acceptance
  gates, not unresolved defects in the isolated candidate.

## Integration notes

- Shared contracts touched: none
- Reconciliation/order constraints on `main`: preserve actor-owned observer projections, stored draws,
  public/private coercion separation and typed conditional event effects during WP-029 composition
- Follow-up packets: WP-029, WP-040
- Final verdict: **Clear for integration**
- Integration-ready: Yes
