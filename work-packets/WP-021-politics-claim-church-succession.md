# WP-021 — Politics, Support, Claim, Church and Succession

- **Status:** Blocked by WP-019
- **Wave:** 2
- **Execution:** Parallel-safe within Wave 2
- **Depends on:** WP-019
- **May run with:** WP-020, WP-022, WP-023
- **Must not run with:** WP-029 or any Wave 3 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$critic`, `$hunt` for constitutional exploit review
- **Critic:** Required
- **Integrator:** WP-029
- **Release impact:** Headless checkpoint candidate

## Objective

Implement the complete political constitution: relationships distinct from support, exact per-lord candidate evaluation, Leaning/Pledged/Committed/Under Duress transitions, candidacy, bargains and collateral, Claim, Church state, political actions, Council ballots, tie-breaks and ending reconstruction inputs.

The result must never collapse into a hidden KING SCORE.

## Canonical inputs

- [`designer/politics-and-succession.md`](../designer/politics-and-succession.md)
- [`designer/candidate-evaluation.md`](../designer/candidate-evaluation.md)
- [`designer/game-rules.md`](../designer/game-rules.md)
- [`designer/world-and-actors.md`](../designer/world-and-actors.md)
- [`designer/balance-sheet.md`](../designer/balance-sheet.md)
- relevant final paperplay amendments
- contracts/content frozen by WP-019

## Owned paths

Expected ownership:

- `src/sim/systems/relationships/**`
- `src/sim/systems/politics/**`
- `src/sim/systems/support/**`
- `src/sim/systems/claim/**`
- `src/sim/systems/church/**`
- `src/sim/systems/succession/**`
- political action handlers under `src/sim/systems/actions/politics/**`
- `src/sim/projections/politics/**`
- `tests/sim/politics/**`
- `tests/sim/succession/**`
- `wiki-site/game-systems/politics-and-support.md`
- `wiki-site/game-systems/claim-church-succession.md`
- `wiki-site/game-systems/endings.md` constitutional sections
- `logs/agents/WP-021/**`

Do not implement battle/occupation/threat facts, Spy discovery/event scheduling, baseline economy/time, UI, persistence adapters or shared contracts.

## Deliverables

### 1. Relationship model

Implement directed personal attitude independently from succession position.

- bounded relationship values and authored reason history;
- temporary/permanent modifiers with expiry;
- trust/betrayal effects where defined;
- projections that explain why a friendly lord may vote for someone else;
- no automatic relationship→support conversion.

### 2. Exact candidate evaluation

Implement the authored Edric, Ysabel, Oswin and Mara evaluation rules from `candidate-evaluation.md`.

Evaluation must:

- produce a deterministic preference/value per legal candidate;
- retain separate reason categories for relationship, Claim, Church, desire, conduct, fear, viability, bargain/proof and red lines;
- use observer-appropriate inputs supplied through contracts rather than omnisciently reading hidden information;
- apply authored hysteresis and stable tie handling;
- emit ordered explanation reasons for debug/forecast/ending;
- pass exact opening-position tests.

Do not replace individual rules with one universal weight table merely because it is shorter.

### 3. Support state machine

Implement:

- private Leaning with maturation start and phase-specific maturation days;
- reset/pause rules when preference changes or prerequisites fail;
- voluntary Pledge eligibility requiring candidacy, mature Leaning, personal Proof, present collateral and no Red Line;
- Commitment only through authored shared-risk events;
- Under Duress with explicit leverage reference, public/private visibility and automatic reevaluation when leverage ends;
- hardening/inertia by phase;
- authored support shocks and expiry;
- Pledge/Commitment break rules, Prestige/relationship consequences and released-vote behavior;
- one supported candidate per voter.

A future office/promise alone may affect interest but never satisfies Pledge collateral.

### 4. Bargains, offices and collateral

Implement contracts for:

- unique Marshalship and Chancellorship per candidate;
- Gold escrow;
- troop commitments/military aid hooks;
- Church Immunities/patronage;
- Mara’s autonomy/charter and permanent Greyfen costs;
- hostile acts or other authored requirements;
- offer, acceptance-time validation, locking, fulfillment, breach, release and collapse;
- incompatible/duplicate promises;
- ending obligations.

Collateral must not be removed before acceptance and must not duplicate or disappear through save/load/cancellation.

### 5. Candidacy

Implement:

- Renard’s automatic declaration at Ailing;
- player declaration from Ailing onward with one-day duration, Influence cost and irreversibility;
- Laughable Pretender consequences below Claim 10;
- Renard rival reaction hooks;
- Edric candidacy eligibility/entry conditions;
- withdrawal/elimination behavior where canonical;
- legal-candidate queries for Council and Acclamation.

The player cannot win without declared candidacy except no undocumented route.

### 6. Claim and Church

Implement:

- Claim bands and exact bounded rating behavior;
- Research Lineage and Forge Royal Descent once-per-run projects;
- Forgery Evidence creation and exposure consequences;
- Penance/repair limited exactly as designed;
- Church consideration, endorsement, condemnation and eligibility;
- Patronize Church and authored full/limited repeat effects;
- Oswin influence without making him identical to the institution;
- sole Endorsement and loss/reconsideration rules;
- public versus secret coercion effects on Church interpretation.

### 7. Political action handlers

Implement or register typed handlers for:

- Offer Bargain;
- Request Declaration;
- Threaten, consuming a leverage assessment supplied by WP-022/WP-023 contracts;
- Research/Forge Claim;
- Patronize Church;
- Expose Secret, consuming a discovered-secret payload supplied by WP-023;
- Declare Candidacy;
- Break Agreement;
- Confess and Seek Penance;
- Cast Greyfen’s Vote after player elimination.

Where an external system owns the fact—army leverage, battle shared risk, secret discovery—accept a typed query/effect rather than importing its private state.

### 8. Exact succession constitution

Implement the full end procedure:

1. validate contracts/support/Church/candidates through registered hooks;
2. accept Military Acclamation result supplied by WP-022 and stop if one legal claimant qualifies;
3. otherwise run Council of Six;
4. every legal lord retains one vote while dispossessed;
5. candidate self-votes;
6. valid Pledges/Commitments bind votes;
7. unbound voters use exact evaluation;
8. four of six wins;
9. with three candidates and no majority, eliminate lowest;
10. elimination tie: fewer Commitments → lower Claim → lower Prestige → later declaration;
11. final 3–3 tie: sole Church Endorsement → Capital control hook → more Commitments → Claim → Prestige → earlier declaration;
12. if player is eliminated/not declared, pause for historical Greyfen vote when more than one candidate remains.

Every ballot, released vote, reason and tie-break must be reconstructed in structured ending data.

### 9. Constitutional exploit scenarios

Use `$hunt` or an equivalent adversarial critic pass to test:

- promise spam;
- late declaration burst;
- relationship-as-vote;
- Oswin double counting;
- coerced support surviving lost leverage;
- public coercion still receiving Church Endorsement;
- three-candidate elimination manipulation;
- Pledge churn at utility near-ties;
- player manual vote accidentally restoring victory;
- sole-candidate and all-dispossessed edge cases;
- tie-break order drift.

Do not tune values inside this packet unless a canonical arithmetic defect blocks correctness; record balance findings for WP-040.

## Implementation contract

- The constitution is explicit, deterministic and explainable.
- Evaluation reasons are data, not hidden logs assembled after the fact.
- Support transitions occur through a state machine, not direct field assignments scattered across handlers.
- Public/private knowledge is supplied by WP-023 projections; politics must not read omniscient secrets unless resolving authoritative consequences.
- External military facts arrive through narrow queries/hooks.
- No generic additive victory total.

## Acceptance tests

- [ ] Opening private preferences match the canonical exact tests.
- [ ] Leaning maturation varies by phase and cannot be reset/exploited through save/load.
- [ ] Promise without proof/collateral cannot produce a voluntary Pledge.
- [ ] Commitment survives ordinary reevaluation and breaks only on authored shocks/red lines.
- [ ] Under Duress collapses when leverage ends and private blackmail remains institutionally hidden when appropriate.
- [ ] Claim/Church/Forgery/Penance sequences match every authored scenario.
- [ ] Every constitutional route and tie-break has a deterministic scenario test.
- [ ] A dispossessed lord retains title/vote.
- [ ] Player historical vote cannot reverse loss.
- [ ] Ending reconstruction explains every vote and decisive rule.
- [ ] No hidden KING SCORE or relationship shortcut exists.
- [ ] Independent critic and hostile constitutional pass clear severe exploits.
- [ ] Standard gates and wiki sync pass.

## Required evidence

- support-transition matrix;
- exact opening evaluation output;
- bargain/collateral lifecycle traces;
- full ballot reconstructions for coalition, Church tie, Capital tie, Claim tie, three-candidate runoff, dispossessed win and player-eliminated vote;
- hostile exploit report;
- implementer and critic logs.

## Agent topology

A lead implementer owns state-machine and constitution APIs. Disjoint sub-agents may work on Claim/Church tests and ballot scenario fixtures, but one owner must reconcile all political reasons and tie-break order.

The critic should act as an adversarial political player, not merely inspect types. Use `$hunt` against the completed packet and record balance-only findings separately for WP-040.

WP-029 integrates military leverage, secret discovery, AI choices, resource charging and death trigger.

## Logging

Create:

- `logs/agents/WP-021/implementer-<name>.md`
- `logs/agents/WP-021/hunter-<name>.md`
- `logs/agents/WP-021/critic-<name>.md`

## Completion handoff

Document public political queries/effects, required WP-022/WP-023 hooks, succession input/output structures, hostile findings and integration risks. State integration readiness.
