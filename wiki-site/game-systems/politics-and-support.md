# Politics and support

WP-021 implements political judgment as several explicit systems. Relationship, Support, Claim,
Church judgment and military Power never collapse into one victory value. All modules are pure
TypeScript and accept observer-limited facts rather than importing private knowledge, war or AI state.

## Relationships and exact evaluation

`src/sim/systems/relationships` stores a directed base attitude, bounded -100…100 value, authored
reason history and temporary or permanent modifiers. Expiry removes an active modifier but preserves
its historical reason. Relationship projections explicitly state that warmth does not bind a vote.

`src/sim/systems/politics/evaluation.ts` implements separate Edric, Ysabel, Oswin, Mara and
post-elimination Renard rules. Inputs carry the observer's known Relationship, Claim, Church, military
threat, viability, conduct, bargain and Red-Line facts. Output retains component values plus ordered
reason data. UI-facing projections deliberately omit the total; tests and ending reconstruction may
use it to reproduce a decision.

Preference hysteresis is exact:

- Lean when the best legal evaluation is at least 15 and leads by at least 8.
- Become Unaligned below 10 or below a lead of 4.
- Otherwise retain the current Leaning.
- An exact tie retains the current Leaning, then uses Relationship, Legitimacy, earlier declaration and
  stable candidate ID.

Opening fixtures lock the intended private state: Ysabel and Oswin Lean Renard; Mara and Edric remain
Unaligned.

## Support state machine

`src/sim/systems/support` is the only WP-021 API that changes a lord's Support record. One record can
name only one candidate.

| State | Visibility | Ballot effect | Entry | Exit |
|---|---|---|---|---|
| Unaligned | Publicly undeclared | None | No stable preference | Exact evaluation reaches Leaning |
| Leaning | Private | None | Authored threshold and lead pass | Preference changes, thresholds fail, or valid Request matures |
| Pledged | Public | Binds while valid | Declared candidate + continuous Leaning + phase maturation + personal Proof + accepted present collateral + no Red Line | Authored breaker or inertia plus an alternative lead of 10 |
| Committed | Public | Binds while valid | Existing voluntary Pledge plus an authored shared-risk event | Betrayal, Red Line, withdrawal or catastrophic breaker only |
| Pledged under duress | Pledge public; coercion public or secret | Binds while leverage remains | Typed leverage passes at Threaten start and resolution | Leverage fails revalidation |
| Self | Public | Candidate self-vote | Legal declaration | Withdrawal or elimination |

The serialized maturation clock stores accumulated active days and the active start day. Pausing does
not erase earned time; changing candidate or becoming Unaligned resets it. The resolution phase sets
the requirement: 2 days Ailing, 3 Gravely Ill and 4 Deathbed. Numeric shocks expire after 10 full days.
Pledge inertia is 10, 20 and 30 in those phases. Commitments ignore numeric shock totals.

A premature Request applies the authored seven-day refusal to the voter, not to one candidate-state
snapshot. Preference churn resets maturation but cannot erase that refusal. A Request also validates
the actual accepted Agreement and its authored collateral; caller-supplied IDs cannot turn a future
office or a Leaning-only concession into a Pledge. Start eligibility is stored with the Order, so a
later external invalidation gives -2 Relationship and no cooldown while a genuinely premature start
still gives -4 and seven days.

The serialized start assessment records the voter, candidate, accepted Agreement and exact frozen
`ProofId` facts. Proof IDs are checked against the authored voter-specific set at runtime. Maturation
completed during an Order cannot rescue a Request that was premature when scheduled.

Secret blackmail produces a public Pledge that looks ordinary to uninformed observers. The duress
basis remains visible to the parties and becomes institutional knowledge only when supplied as known.
Public military or occupation coercion projects as Under Duress to everyone. The leverage type fixes
that visibility, one secret can fund only one successful blackmail Agreement, and candidate Self
support cannot be overwritten through Threaten.

## Bargains and collateral

`src/sim/systems/politics/bargains.ts` separates an Offer from an accepted Agreement. An Offer changes
no collateral. Acceptance validates the entire set and then atomically applies Gold escrow/payment,
troop locks, unique per-candidate offices, permanent policies and completed-action requirements.
Duplicate or incompatible promises fail before anything is deducted.

Each `BargainId` has one authored target and an exact collateral contract. This includes exact base
amounts, office/policy identity, both Greyfen's and Edric's 100-troop Joint Campaign obligations, and Ysabel's stored
Access Debt surcharges. Access Debt is consumed only by an accepted Ysabel bargain. Replaying an
accepted offer, substituting a different lord, or passing a cheaper collateral packet leaves the
ledger unchanged.

Acceptance also checks the authored active-condition exclusions: Oathbreaker blocks Edric bargains,
Defaulted Debtor blocks Ysabel bargains, and Usurper blocks the specified Oswin and Mara bargains.
Troop locks are stored per Agreement and owner, so two-sided obligations release to the correct lords.

A future office is a reserved reward, not present collateral. `agreementProvidesPresentCollateral`
therefore returns false for an office-only promise and Mara's Leaning-only Denounce. Accepted
collateral is owned by the Agreement:
canceling the old Order cannot release it. Claimant breach transfers escrow to the supporter;
unsupported supporter breach returns half now and freezes half until succession. Permanent Charter or
Church Immunities costs are not silently undone by agreement release.

The Support state machine revalidates its exact Agreement ID. Missing, breached, collapsed or released
Agreements deterministically release a voluntary Pledge. A Commitment detaches and survives ordinary
Agreement completion; only its explicit betrayal, Red Line, withdrawal or catastrophic breaker ends
it. Under Duress remains on the separate leverage-revalidation path.

## Candidacy and action seam

`src/sim/systems/politics/candidacy.ts` supplies Renard's automatic Ailing declaration, the player's
one-day irreversible declaration, Laughable Pretender consequences below Claim 10, Edric's exact
Gravely Ill gate, Renard withdrawal and legal-candidate queries.

Typed political action plans live under `src/sim/systems/actions/politics`. WP-020/WP-029 may charge
and schedule their emitted start/resolution effects. Threaten consumes a WP-022/WP-023 leverage
assessment; Expose Secret consumes a discovered-secret payload. No private military or intelligence
module is imported.

Action presentation metadata describes meaning only. Offer Bargain, Request Declaration, Patronize
Church and ordinary candidacy confirmation use `confirm`; Break Agreement is `destructive`; Threaten
is `hostile`. No color or CSS variant appears in simulation output, so a red wax seal cannot turn an
ordinary confirmation into a danger action.

Stable politics cannot schedule succession bargains, Requests or Threats, and those actions remain
locked until the actor has declared. Offer planning validates the authored bargain target before it
charges negotiation Influence. Threat history blocks repeating the same leverage against one target
inside a phase; a genuinely new leverage ID remains available.

## Integration hooks

WP-029 must connect action charging/durations and the dawn sequence, while WP-022 supplies military
leverage and WP-023 supplies observer knowledge and discovered-secret facts. Those integrations must
use the typed inputs above and may not bypass the Support state machine with direct field assignment.
