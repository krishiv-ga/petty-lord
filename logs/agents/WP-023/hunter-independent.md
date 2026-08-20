# Agent Log — WP-023 — Hunter/Independent

- **Packet:** WP-023 Rival AI, Observer Knowledge, Secrets, Openings and Events
- **Role:** Hunter
- **Git target:** `main`
- **Starting revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283`
- **Ending revision:** `997716ac12b5573188d413d66ca8a982238414a5` (reviewed uncommitted WP-023 candidate)
- **Status:** Complete

## Scope

Owned paths:

- `logs/agents/WP-023/hunter-independent.md`

Read-only attack surface:

- `src/sim/systems/{ai,knowledge,intelligence,secrets,openings,events}/**`
- `src/sim/systems/actions/intelligence/**`
- `src/sim/projections/knowledge/**`
- `tests/sim/{ai,knowledge,events}/**`

Explicitly out of scope:

- Production changes, changes to existing tests, tuning changes and canonical design amendments
- Whole-game AI target enumeration and political/war consequences owned by WP-029 integration

## Work performed

- Read WP-023 and the canonical AI/information, world/opening, action, candidate-evaluation, balance and final-paperplay rules.
- Ran deterministic hostile probes against extra AI capacity, resource charges, cross-seed near ties, opening variety, guaranteed Renard intrigue, observer isolation, stale intelligence, Find Dirt persistence/detection, event reload/death/fallback behavior and notification volume.
- Reported one P2 evidence-invalidation defect during the frozen pass. The implementer added a guard and regression; the exact hostile seed now rejects the invalid exposure.
- Re-ran the frozen critic-updated API against knowledge-gated AI selection, observer-specific threat/coercion, canonical ambient-slot boundaries, partial-Spy army bands, materialized random effects and parent-bound follow-up replay.
- Made no production or test changes.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| AI variety was measured after `createSeededOpening` consumed and returned the run PRNG state | This is the canonical whole-run order; probing a newly initialized PRNG in isolation is not a representative run trace | Avoids drawing balance conclusions from a non-game RNG position |
| Caller-supplied Intent enumeration remains a WP-029 seam, while WP-023 now enforces acting-observer knowledge requirements | The API rejects a projection for another lord and filters candidates whose declared knowledge requirement is unknown | WP-029 must derive candidate costs, legality, base priority and knowledge requirements from shared actions without hidden-state pre-filtering |
| No canonical values were changed from hostile distributions | `$hunt` is read-only and WP-040 owns tuning after integrated simulation evidence | All distribution/pacing questions below are deferred, not silently tuned |

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| `pnpm vitest run --config vitest.sim.config.ts tests/sim/ai tests/sim/knowledge tests/sim/events` | Pass | Final critic-updated candidate: 6 files, 34/34 tests |
| `pnpm typecheck` | Pass | `tsc -b` completed without diagnostics |
| AI capacity corpus `hostile-capacity-0..31`, three completion cycles each | Pass | At most one active Intent; an attempted simultaneous second Intent was rejected; Gold/Influence never became negative; locked troops were released at completion |
| Whole-stream equal-score near-tie corpus `run-0..1023` after opening initialization | Pass | Both choices occurred: candidate `a` 550 and `b` 474; no all-seed fixed opener and stored selection remained replayable |
| Knowledge-bound AI seed `hunter-knowledge-bound` | Pass | Without Renard Intent knowledge Mara selected `public-fallback` and the 100-priority containment candidate was absent from scores; after a Mara-owned direct Intent observation it selected `requires-known-intent`. Passing Oswin's projection for Mara threw `AI decision knowledge must belong to the acting lord` |
| Opening corpus decimal seeds `0..4095` | Pass | 0 invalid openings; packages: Fractured 1135, Holy 1135, Border 913, Favorite 913; Renard vulnerabilities: Paternity 1342, Testament 1400, Concession 1354; all four additional NPC secrets appeared about equally (2033–2061 of 8192 slots) |
| Find Dirt corpus decimal seeds `0..4095` after opening initialization | Pass | Secret/partial/none: 1456/1301/1339. Detection increased monotonically from 2329/4096 at 0 repeats to 2865/4096 at 1 and 3832/4096 at 3; discovery tiers did not change with repeat count |
| Find Dirt reload seed `hunter-spy-reload` | Pass | Stored start snapshot stayed `spyPower=52`, `defense=62`, `tier=partial`, `detectionRoll=74`, detected=true even when reload inputs were deliberately changed |
| Partial Spy band seed `hunter-partial-band` | Pass | A forced partial result recorded credible `broken`, projected banded 75 rather than an exact count, then yielded to the current public `strong`/400 band after 169h; a numeric `447` partial payload was rejected |
| Observer stale probe, observation hour 24 projected at hour 193 | Pass | Renard army became labeled `stale-estimate` 424 (447 blended with Strong midpoint 400); Leaning remained explicitly stale with age 169h, never current |
| Observer threat/coercion probes | Pass | The same public Renard state projected `serious` to committed Greyfen and `existential` to weaker Oswin. Seed `hunter-private-coercion-live` showed Greyfen's direct secret-coercion fact and `concern` Renard threat while uninformed Oswin saw an ordinary public Pledge and `low` threat |
| Canonical ambient-slot boundary/gap sweep, elapsed Days 0–56 | Pass | All 12 slot boundaries (6/10, 14/18, 22/26, 30/34, 38/42, 45/49) selected an eligible event; all 27 gap days returned `outside-ambient-slot`; callers cannot invent a window key |
| Event reload seed `hunter-event-replay-live` | Pass | Selected E13 on Day 8; unrelated refresh RNG reproduced E13 from the internally stored canonical slot |
| Whole event traces `whole-run-0`, `whole-run-1`, `whole-run-6`, `whole-run-23` | Pass | Six distinct ambient decisions resolved per live trace and stored exact resolution hours. Example `whole-run-0`: E13, E15, E08, E05, E07, E16 across Days 8/16/24/32/40/47 |
| Event outcome replay seed `hunter-e06-replay` | Pass | E06 stored casualty outcome 1; an unrelated reload RNG reproduced outcome 1 and the exact `adjust-levies: -1` typed effect with `wasStored=true` |
| Follow-up replay probe, E13 resolved at hour 168 | Pass | Queue without a resolved parent was rejected; hour 503 was rejected as early; hour 504 queued repayment, unaffordable repay safely defaulted, and hour 505 replay was rejected as already resolved |
| All 16 authored events with zero resources and an invalid/unaffordable requested choice | Pass | Every event selected a legal zero-cost fallback; 0 throws |
| Same-dawn death probe `death-first` | Pass | Ambient selection suppressed with `king-died-this-dawn` |
| Notification sample | Pass | 120 routine gifts/taxes/court notices all remained feed; only phase, direct attack and mandatory choice interrupted (120 feed / 3 interrupts) |
| Destroyed-evidence regression seed `hunter-destroyed-secret` | Pass after fix | Initialize → discover Renard secret → destroy evidence → expose at hour 120 now throws `Secret evidence is no longer valid for exposure` |

## Critic findings and resolution

| Severity | Finding | Resolution/status |
|---|---|---|
| P0 | None | No release-blocking exploit or hard softlock found in the WP-023 layer |
| P1 | None | No hidden extra Intent, wrong-observer AI input, negative start spend, hidden projection leak, exact partial-Spy army, replay reroll or missing Renard opening was reproduced |
| P2 | Destroyed/non-discoverable evidence could still be exposed for the full authored scandal. Exact seed `hunter-destroyed-secret` returned six authored effects after `destroySecretEvidence`. | Fixed by implementer during review; exact repro now rejects, and the final focused suite is 34/34 |
| P3 | None | No remaining isolated low-severity implementation finding |

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Save/schema impact: none by hunter; stored AI, Spy, opening and event draws were exercised as JSON-compatible values
- Wiki pages updated: none by hunter

## Risks and deferred work

- **WP-029 integration gate — leader fixation and second-place hoarding:** WP-023 now requires the acting lord's observer projection and can gate candidates on known Intent, Leaning, secret and threat. WP-029 must still run whole-state seeds in which the public vote leader differs from the latent military/Claim/Capital threat and prove candidate enumeration/base priorities respond to thematic known evidence rather than hidden truth or rank alone.
- **WP-029 integration gate — hidden-data equivalence:** construct two authoritative games with identical projections for one NPC but different hidden player Order, secret, exact troops and private bargain. The generated candidate list, score trace and chosen Intent must remain byte-identical; WP-023 can enforce projection ownership but cannot detect hidden data already baked into caller-supplied candidate values.
- **WP-029 integration gate — real action contracts:** candidate costs, durations, legality, visibility, fallback and resource locks still arrive through the integration seam. The combined scheduler must prove they come from common player action definitions and preserve the new next-dawn wait after invalidation.
- **WP-029 integration gate — observer facts:** populate public support/coercion, offensive-war counts, occupations, exact self defense and private support observations from the real domains. The projection now distinguishes informed private coercion and canonical observer threat, but only from supplied facts.
- **WP-029 integration gate — event effect application:** the WP-023 engine now materializes stored E06/E09/E12/E14 outcomes and records exact parent resolution hours. Repeat with real politics/time/war consumers, including repayment scheduling and E16 temporary-troop expiry.
- **WP-040 balance deferral — opening pressure:** measure Renard win rate and route viability separately for all four packages; the 4096-seed package/secret coverage proves availability, not balanced win pressure.
- **WP-040 balance deferral — AI pinball/predictability:** after integrated target enumeration, measure repeat target rate, Leaning switches per lord, same-family Intent streaks and second-place survival across a fixed approved seed corpus. Do not tune personality modifiers from the isolated equal-score probe.
- **WP-040 balance deferral — intrigue pressure:** compare successful Renard discovery timing, resources spent and relationship damage across repeat policies. The current 4096-seed first-attempt corpus provides a baseline, not a verdict on route strength.
- **WP-040 balance deferral — stale intelligence:** measure how often actors make materially wrong threat/support decisions from stale facts and whether that creates legible shocks rather than arbitrary punishment.
- **WP-040 balance deferral — interruption cadence:** the structural cap is six ambient choices and routine activity remains feed-only, but a timed human/full-sim run must judge the combined phase, attack, bargain, scandal and repayment interruption rate.

## Integration notes

- Shared contracts touched: none by hunter
- Reconciliation/order constraints on `main`: preserve the destroyed-evidence guard, acting-observer AI check, canonical slot derivation, band-only partial Spy contract, observer-known coercion threat and parent-bound follow-up replay; WP-029 must not precompute candidate values from hidden authoritative state
- Follow-up packets: WP-029, WP-040
- Integration-ready: Yes for the isolated WP-023 layer; no unresolved P0/P1 gameplay finding remains. Whole-game AI behavior remains conditional on the explicit WP-029 gates above.
