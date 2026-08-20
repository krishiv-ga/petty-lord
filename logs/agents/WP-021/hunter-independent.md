# Agent Log — WP-021 — Hunter/Independent

- **Packet:** WP-021 Politics, Support, Claim, Church and Succession
- **Role:** Hunter
- **Git target:** `main`
- **Starting revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283`
- **Ending revision:** `613a3de16b1962313f2b146e9dfacbd99c64aa03` in the shared checkout; WP-022 advanced `main` concurrently while the WP-021 result remained uncommitted
- **Build/version:** `0.1.0-alpha.1`; Node 24.16.0; hostile pass run 2026-08-20
- **Status:** Complete — hostile constitutional scope clear after repairs

## Scope

Owned review surface:

- `src/sim/systems/{relationships,politics,support,claim,church,succession}/**`
- `src/sim/systems/actions/politics/**`
- `src/sim/projections/politics/**`
- `tests/sim/{politics,succession}/**`
- canonical politics, candidate-evaluation, core rules, actors, balance and final-amendment contracts

Only this hunter log was created. Production code and tests were not edited by the hunter.

Explicitly out of scope:

- battle/occupation fact production, secret discovery, scheduler/economy integration, UI and persistence adapters;
- tuning or canonical-rule changes;
- concurrent WP-020/WP-022/WP-023 implementation except where a full gate exposed an external blocker.

## Intended pressure falsified

The pass attempted to win or distort the constitution through free promises, replayed acceptance,
late undeclared preparation, relationship-only support, reusable coercion, candidate coercion,
institutionally hidden public threats, support churn, runoff manipulation and manual-vote restoration.
All probes were deterministic pure-API replays; no RNG, browser state or debug resource grant was used.

## Exact hostile scenarios and final disposition

| Scenario | Exact policy/reproduction | Final evidence/result |
|---|---|---|
| Promise spam / duplicate offices | Accept an 80-Gold + Chancellor offer, then replay a structured-cloned original offer and accepted ledger; separately offer duplicate Marshal reservations, incompatible policies, wrong-lord bargain, 1-Gold Ysabel escrow, office-only Pledge and Mara Denounce as Pledge collateral. | Replay returns `offer-already-accepted`; Gold/locks unchanged. Duplicate office/incompatible policy/target/price fail atomically. Office-only and Denounce are non-Pledge collateral. |
| Late declaration burst | Attempt Offer Bargain in Stable and Offer/Request/Threaten while Ailing but undeclared; start a Deathbed Leaning and Request after 3 then 4 days. | Stable bargain is locked; undeclared political actions return `candidate-not-declared`; Deathbed day 3 is premature and day 4 Pledges. |
| Relationship-as-vote | Ysabel evaluates warm Greyfen (Relationship 45, total 15) against modestly friendly Renard (Relationship 20, total 16). | One-point lead is insufficient to Lean/retain; result is Unaligned. Relationship remains one reason, never a Support conversion. |
| Oswin double counting | Build a Church case with Strong Claim, Patronage and Oswin Pledged; inspect structured reasons and exact case. | Case is 6 with exactly one Oswin reason. Equal cases use Claim then Oswin preference; Oswin never equals the institution. |
| Duress after leverage loss | Apply private blackmail, project informed/uninformed views, then revalidate with leverage false. | Vote releases to Unaligned. One secret is serialized as spent and a second use returns `leverage-already-spent`. |
| Public coercion + Church | Compare one public coercion, two distinct public coercions and two institutionally hidden secret coercions. | One public coercion remains endorsement-eligible; two block with `two-known-coerced-pledges`; hidden blackmail count is zero. Military/occupation leverage is typed public; secret leverage private. |
| Three-candidate elimination manipulation | Force 2–2–2, vary valid Commitments, then Claim, Prestige and declaration precedence; release an eliminated candidate's bound vote. | Elimination order is Commitments → Claim → Prestige → later declaration. Released vote is reevaluated and fully reconstructed. |
| Near-tie Pledge churn | Give a Deathbed Pledge shock 30, compare alternative lead 9 versus 10; trigger premature Request, transition Unaligned and re-Lean before the seven-day refusal expires. | Lead 9 does not break; lead 10 does. Refusal survives Unaligned churn and retry returns `request-refused-cooldown`. |
| Threat repetition | Record an Ailing Threaten against Mara with `army-westmarch`, then retry the same target/leverage, a new leverage ID and the old leverage in Gravely Ill. | Same target/leverage/phase is blocked with `threat-target-already-attempted`; new leverage and a later phase remain legal. |
| Greyfen manual vote restoration | Eliminate Greyfen in a three-candidate first ballot, pause on the runoff, cast Greyfen for Edric. | Renard still wins the supplied scenario and `playerOutcome` remains `lost`; the manual vote cannot restore Greyfen. |
| Sole candidate | Supply only legal Renard and all six legal voters. | Forced 6–0, no evaluator call and no manual-vote pause. |
| All dispossessed | Mark all six voters dispossessed while Greyfen retains valid coalition bindings. | All six votes remain; dispossessed Greyfen wins 4–2 and every vote records dispossession. |
| Tie-break order drift | Force 3–3 while equalizing earlier criteria, then distinguish Church, Capital, Commitments, Claim, Prestige and declaration sequence in turn. | Reconstruction records exact final order: Church → Capital → Commitments → Claim → Prestige → earlier declaration. |
| Both finalists excluded (new) | Give Mara active Red Lines against both finalists, with Edric currently violent against Westmarch and Renard nonviolent. | Exact forced fallback selects nonviolent Renard, marks `usedExcludedFinalistFallback: true`, then Relationship → Claim → declaration order remains available. |
| Candidate/self coercion (new) | Apply occupation leverage to Renard's `Self` support. | Returns `blocked-by-self-support`; Renard remains self-voting and must use the separate withdrawal constitution. |
| Private-Leaning information leak (new) | Project Mara's private Leaning to Greyfen with and without supplied intelligence. | Without intelligence Greyfen sees unknown/Unaligned; with explicit knowledge the Leaning is revealed. |
| Joint Campaign lifecycle (new) | Offer Edric Joint Campaign with separate 100-troop locks owned by Greyfen and Edric; first retry with Edric at 99 troops, then accept with both funded and terminate through ordinary `releaseAgreement`. | Underfunded acceptance returns `insufficient-troops:edric` with byte-identical ledger. Acceptance atomically moves Greyfen 360→260 and Edric 620→520 and stores `{greyfen: 100, edric: 100}`; ordinary release restores both and clears the joint lock. Shared-risk victory remains the later Commitment hook. |
| Active-condition bargain bypass (new) | Serialize each authored disqualifier into `activeConditions`: Oathbreaker with Edric Border Aid, Usurper with Mara Charter and Oswin Endowment, Defaulted Debtor with Ysabel Escrow. | Each returns its exact `bargain-incompatible-condition:*` error, creates no Agreement and preserves the input ledger by identity; collateral never applies. |
| Request start-snapshot manipulation (new) | Serialize a valid Ysabel Request start assessment, structured-clone it through the planned resolution, then remove Proof before resolution; separately begin before maturation and let maturation finish during the Order. | Valid-at-start loss becomes `request-invalidated` with relationship -2 and no refusal lock. Premature-at-start remains `request-premature` with relationship -4 and a seven-day refusal even though current facts later mature. |
| Fake Proof ID (new) | Supply a nonempty `fake-proof` cast to `ProofId` with otherwise valid candidate/voter facts. | The authored voter Proof allowlist rejects it; eligibility remains false and the Request is premature. Candidate/voter/validity mismatches are likewise filtered. |
| Commitment after ordinary Agreement release (new) | Mature Ysabel's Pledge, upgrade it through a joint-battle-victory shared-risk event, then revalidate against its Agreement with status `released`. | Commitment remains `committed`, clears the obsolete `agreementId`, and returns `no-change`; ordinary collateral release cannot erase authored shared risk. |
| Same-time declaration tie (new) | Give Greyfen and Renard equal Council evaluation, Claim, declaration time 4 and inverse stable-ID/sequence order (Greyfen sequence 2, Renard sequence 1). | Renard wins: serialized `declarationSequenceId` is consulted before stable ID when timestamps are equal. |
| Off-dawn Patronage cooldown (new) | Complete first Patronage at day 5.5; retry planner/resolver at 26.49 and exactly 26.5. | Day 26.49 is rejected before the 50-Gold charge with `patronage-cooldown`; day 26.5 succeeds. Fractional completion time is preserved rather than rounded to dawn. |
| Relationship modifier replay (new) | Add `gift-1`, expire it at day 8, structured-clone the relationship with historical reasons intact, then reuse `gift-1` at day 9. | Replay throws `Relationship modifier gift-1 already exists`; expiry removes the active modifier but never releases its serialized identity. |

## Findings and resolution

All findings were technical implementation/contract defects. No locked-rule defect was reproduced, so
`$design-guard` was not invoked and no tuning was performed.

| Initial severity | Finding | Classification | Resolution/status |
|---|---|---|---|
| P1 release-blocking exploit | Accepted offer could be replayed, doubling escrow/cost; cooldown could be retried or erased through preference churn. | Technical | Fixed with accepted-offer/ledger identities and persistent refusal state; direct structured-clone replays clear. |
| P1 release-blocking exploit | Support trusted arbitrary collateral/Proof strings, exact bargain amount/target was unchecked and Denounce could Pledge. | Technical | Fixed by passing the accepted Agreement plus voter/candidate/valid Proof facts, exact authored collateral validation, target mapping, Access Debt consumption and bargain-specific Pledge collateral. |
| P1 dominant/degenerate route | Bargains/Requests/Threats scheduled before candidacy, enabling undeclared coalition preparation. | Technical | Fixed with phase and declared-candidate start gates. |
| P1 release-blocking exploit | One secret coerced multiple voters; coercion could overwrite candidate Self support. | Technical | Fixed by serializable spent-secret ledger and Self/candidate guard. |
| P1 pressure failure | Public coercion visibility could be represented as private. | Technical contract | Fixed with discriminated leverage: military/occupation public, secret private. |
| P2 constitutional incompleteness | Both-excluded Council finalists had no exact forced-choice fallback. | Technical | Fixed with the authored violence → Relationship → Claim → declaration fallback and regression. |
| P2 hidden-information failure | Supported candidate automatically saw a private Leaning without intelligence. | Technical | Fixed by explicit observer-knowledge input; direct projection replay clear. |
| P2 route nonviability | Joint Campaign required its own completed shared-risk victory before acceptance. | Technical | Fixed: pending 100-troop obligation accepts first; victory is the later Commitment hook. |
| P2 atomicity | Same-offer incompatible policies and wrong-lord bargain identities could pass validation. | Technical | Fixed; both fail before any ledger mutation. |
| P2 anti-spam failure | Repeating the same Threaten leverage against one lord in one phase was not represented in the action seam. | Technical | Fixed with serialized phase/target/leverage history; same leverage is blocked while a genuinely new source remains legal. |
| P1 atomicity / resource duplication risk | Joint Campaign represented only Greyfen's obligation, so Edric's authored matching troop risk was neither locked nor restored through the Agreement lifecycle. | Technical | Fixed with owner-tagged per-Agreement troop locks. Direct underfunded, acceptance and ordinary-release probes show all-or-nothing mutation and exact restoration for both owners. |
| P1 eligibility replay risk | Resolution could recompute only current Request facts, allowing a premature start to mature during the Order or a valid start to be punished as premature after external invalidation. | Technical | Fixed with a serialized `PledgeStartAssessment`; both directions have exact regressions and distinct consequences. |
| P2 authority/replay drift | Arbitrary nonempty Proof strings, released modifier identities, same-time stable-ID fallback and dawn-rounded Patronage could change eligibility or ordering after serialization. | Technical | Fixed with authored Proof allowlists, history-wide modifier identity uniqueness, declaration sequence precedence and elapsed fractional-day cooldown checks. |
| P2 lifecycle coupling | Ordinary Agreement release could erase a separate shared-risk Commitment; active canonical conditions were absent from bargain admission. | Technical | Fixed: Commitment survives ordinary release while clearing its stale Agreement reference, and condition incompatibilities reject before collateral mutation. |

No unresolved WP-021 gameplay/design, technical or comprehension finding remains from this pass.

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| `pnpm exec vitest run --config vitest.sim.config.ts tests/sim/politics tests/sim/succession --reporter=verbose` | Pass | Final post-critic delta run: 7 files, **80/80 tests**. Includes two-sided Joint Campaign atomicity, condition admission, typed Proof rejection, both serialized Request start-snapshot branches, ordinary-release Commitment, same-time declaration sequence, fractional-day Patronage and relationship-history replay. |
| `node --experimental-strip-types --input-type=module -e <Joint Campaign + condition API probe>` | Pass | Edric-at-99 rejection returned `insufficient-troops:edric` without mutation; acceptance locked Greyfen/Edric 100 each; ordinary `released` termination restored 360/620 and cleared the lock. Oathbreaker/Usurper/Defaulted-Debtor probes rejected exact Edric/Mara/Oswin/Ysabel bargains before mutation. |
| `node --experimental-strip-types --input-type=module -e <off-dawn + relationship API probe>` | Pass | Planner and resolver reject repeat Patronage at day 26.49 after day 5.5 and accept exactly at 26.5; start rejection has no effects. A structured-cloned expired `gift-1` replay throws `already exists`. |
| Earlier direct pure-API lifecycle probes | Pass | Denounce present collateral `false`; Access Debt escrow locks 100 and consumes debt; public coercion projects Under Duress; secret coercion looks voluntary to outsider; repeat secret returns `leverage-already-spent`; mismatched Proof facts are premature while a matching valid Proof Pledges. |
| Direct Threat history probe through `planPoliticalAction` | Pass | Same Ailing Mara/`army-westmarch` retry blocked; `occupation-westmarch` and the same army leverage in Gravely Ill schedule normally. |
| Direct Deathbed/churn probe through `requestVoluntaryPledge` and `reevaluatePledge` | Pass | 3 days premature / 4 days Pledged; lead 9 stable / lead 10 breaks; refusal survives Unaligned and blocks retry. |
| Direct Church/evaluation probes | Pass | One/two/hidden coercion counts 1/2/0; Oswin reason count one; friendly Relationship does not convert Support; both-excluded fallback is exact. |
| `pnpm typecheck` | Pass | Final independent rerun passed. An earlier run exposed concurrent WP-023 `events.ts:109` narrowing errors after WP-021 was type-clean; those external errors were repaired before this final gate. |

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Save/schema impact: owned serializable ledgers/history now preserve accepted Agreement IDs, active bargain-disqualifying conditions, owner-tagged troop locks, Ysabel Access Debt, spent secret leverage, phase/target/leverage Threat attempts, Request start assessments, declaration sequence and expired relationship-modifier identities; WP-029 must include them in integrated authoritative state
- Wiki pages updated by implementer: `politics-and-support.md`, `claim-church-succession.md`, constitutional `endings.md`

### WP-040-only balance notes

No balance conclusion is justified by these deterministic correctness probes. The pass found no
post-fix dominant policy, route nonviability or value defect. Frequency questions (Mara first-support,
Ysabel defection cadence, Deathbed action density and route win rates) remain WP-040 simulation work;
none should change WP-021 values now.

## Risks and deferred work

- WP-029 must wire the typed observer knowledge, leverage revalidation, Agreement/Proof validation,
  candidate validation, action charging and death trigger without bypassing these state machines.
- The final shared typecheck is green. Full standard gates and combined Wave 2 behavior remain the lead
  implementer/integrator responsibility.
- Browser/UI comprehension was not in this headless hunter scope.

## Integration notes

- Shared contracts touched by hunter: none
- Follow-up packets: WP-029 for cross-system wiring; WP-040 for balance frequencies only
- Independent hostile constitutional status: Clear
- Overall packet integration-ready decision: lead implementer/critic after full shared gates; no severe exploit remains from this hunter pass
