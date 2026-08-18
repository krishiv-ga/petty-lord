# Politics and Succession

## 1. Separate political concepts

The implementation keeps four systems distinct:

1. **Relationship** — personal trust or hostility.
2. **Support** — preferred claimant.
3. **Legitimacy** — Claim and Church judgment.
4. **Power** — armies, occupations and Capital control.

A friendly lord may vote Renard. A terrified lord may vote the player while remaining hostile. There is no kingdom-wide succession score.

Exact per-lord candidate evaluation is defined in `candidate-evaluation.md`.

## 2. Candidates

- Renard declares automatically at Ailing and remains eligible unless forced to withdraw.
- The player is eligible only after completing Declare Candidacy.
- Edric may declare from Gravely Ill if his conditions pass.
- Ysabel, Oswin and Mara are kingmakers only.

Edric cannot declare while any valid Pledge exists, including Under Duress. When that Pledge releases, candidacy checks at the next dawn.

## 3. Support record

Each lord stores:

- candidateId or null;
- level;
- basis;
- public/private visibility;
- Proof/bargain references;
- break conditions;
- date last changed;
- maturationStart;
- timestamped shock entries.

One lord supports at most one candidate.

### Unaligned

No current preference strong enough to record. Publicly Undeclared.

### Leaning

Private preference.

- visible only through current intelligence;
- does not bind ballot;
- must mature continuously toward the same candidate.

Maturation at Request resolution:

- Ailing: 2 full days;
- Gravely Ill: 3;
- Deathbed: 4.

Current phase requirement applies. Prior time toward the same candidate counts. `maturationStart` resets when candidateId changes or lord becomes Unaligned. A Commitment-grade shared-risk event may waive maturation.

### Pledged

Public declaration.

- sticky through ordinary preference movement;
- voluntary or coerced;
- casts vote while valid;
- breaking without recognized cause damages the lord.

### Committed

Support tied to shared risk, such as joint battle, public financing, Synod alignment or costly constitutional concession.

Commitment cannot be bought by a larger gift. It breaks only through authored betrayal, Red Line, withdrawal or catastrophic breaker.

### Self

A declared candidate supports and votes for themselves while eligible.

## 4. Support basis

- ideological;
- legitimacy;
- bargain;
- opportunism;
- protection;
- coercion;
- self.

Basis determines break behavior.

## 5. Evaluation and hysteresis

Use `candidate-evaluation.md`.

General thresholds:

- Hear bargain at evaluation ≥0.
- Lean at best evaluation ≥15 and lead ≥8.
- Become Unaligned if best falls below10 or lead below4.
- Otherwise retain current Leaning.
- Voluntary Pledge requires declaration, Leaning, maturation, Proof, accepted present collateral and no Red Line.
- Commitment requires authored shared risk.

The UI exposes reasons, not total.

## 6. Pledge inertia and shocks

Pledges reevaluate only after recognized shock, phase change or direct violation.

Inertia:

- Ailing 10;
- Gravely Ill 20;
- Deathbed 30.

A voluntary Pledge breaks when:

1. current unexpired shock reaches inertia;
2. an alternative leads evaluation by at least10;
3. no valid Commitment lock remains.

### Shock lifetime

Numeric shocks are timestamped and expire after 10 full days. Automatic breakers, active Red Lines, breached agreements and persistent public conditions remain while their cause remains. Old unrelated defeat cannot sit forever waiting to combine with a tiny Deathbed event.

Canonical shocks:

- Red Line/bargain breach: automatic;
- candidate withdrawal: automatic release;
- coercive leverage disappears: automatic release;
- seat occupied: 12;
- Capital lost: 12;
- major defeat: 10;
- all other public supporters lost: 10 for Opportunism;
- Forgery exposed: 20 for Legitimacy, 10 otherwise;
- Church Condemnation: 15 for pious/legitimacy basis;
- public Oathbreaker: 10 for honorable/cautious lord.

Committed support ignores numeric inertia and uses authored breaker.

## 7. Agreements and collateral

Agreement stores participants, demand, accepted present collateral, reserved future reward, satisfaction/expiry, support effect and breach consequence.

### Acceptance timing

Offer Bargain costs 8 Influence at start. Collateral applies only if accepted at resolution. If target becomes unavailable, Influence is lost but collateral untouched.

Accepted collateral belongs to an Agreement, not a cancellable Order. End through Break Agreement.

### Finite offices

Each candidate's hypothetical government has one Marshal and one Chancellor. Uniqueness is per candidate: the player cannot double-promise their Marshalship, but Renard may separately offer his.

Future reward alone creates/strengthens Leaning; it never satisfies present collateral.

### Defection bargain

A voluntary defection from an existing Pledge may begin only when one is true:

- current Pledge has half current inertia in unexpired shock;
- Opportunistic basis and challenger leads Viability by10;
- current candidate violated known bargain/Red Line;
- challenger has valid coercive leverage.

A valid Commitment cannot be replaced by ordinary bargaining or coercion.

Successful voluntary defection:

1. old Pledge breaks publicly;
2. lord becomes Leaning toward challenger;
3. normal maturation begins from zero.

## 8. Escrow

- Supporter breaks without cause: 50% returns now, 50% frozen to death.
- Claimant breaks: full escrow transfers to supporter.
- Loyal agreement: Gold stays locked through succession.

## 9. Coercion

Credible leverage:

- target seat occupied;
- adjacent military meets personality threshold;
- devastating discovered secret.

Leverage must pass at Threaten start and resolution.

### Public military/occupation coercion

- Threat is public.
- Pledge displays **Under Duress** to everyone.
- Counts toward public-coercion Church block.
- Other lords react to it.

### Private secret blackmail

- Threaten and basis are known only to parties unless discovered.
- Publicly the resulting Pledge appears ordinary.
- The player's own forecast may label it Secretly Coerced.
- Church and rivals react only if they know the blackmail.
- At death the vote remains bound while the secret remains unexposed and leverage valid.
- Exposing the secret removes blackmail leverage and releases the Pledge unless another valid basis independently supports it.

### Shared coercion rules

- never becomes Committed;
- breaks with leverage;
- valid Commitment cannot be overwritten;
- one secret creates one successful blackmail agreement, then is spent for blackmail but remains exposable;
- two **publicly known** coerced Pledges block Church Endorsement.

## 10. Claim and fraud

Claim sources: starting lineage, Research once, Forge once and authored evidence. Rival damage does not add to player Claim.

Forge grants +25 and creates Forgery Evidence.

Exposure:

- remove20 fabricated Claim;
- -10 Prestige;
- fraud Condemnation;
- support shocks;
- Oswin Red Line.

Confess and Seek Penance removes fraud Condemnation at cost but never restores Claim or trust.

## 11. Church

Stances: Condemned, Skeptical, Neutral, Favorable, Endorsed. One candidate maximum Endorsed; none before Ailing.

Church case:

- Claim band 0–5;
- Oswin Pledged +2 / Committed +4, reduced after Simony;
- Patronage +1;
- lawful conduct -6…+2;
- Renard undiscredited favorite +1.

Endorsement requires:

1. Plausible+ Claim;
2. not Condemned;
3. case at least6;
4. fewer than two publicly known coerced Pledges.

Highest case wins. Tie: higher Claim, then Oswin preference, then withhold.

## 12. Information

### Public

Candidates, public Pledges/Commitments, public Under Duress basis, Claim, Church, occupations, army bands, wars, conduct and public bargains.

### Private

Leanings, AI Intent, private bargains/blackmail, secrets, exact troops and some Proof/Red Line progress.

Political intelligence stale after7 days. Secrets do not.

## 13. Forecast

**IF THE KING DIED TODAY** uses only `PlayerKnowledgeProjection`.

Show locked votes, known Leanings/timestamps, unknown houses, likely ballot/runoff, tie-break advantages, Acclamation checklist and qualitative verdict. The player sees their own private blackmail basis; other actors do not unless discovered.

No percentage or king score.

## 14. Military Acclamation

Before Council, declared claimant wins by sword only if at death:

1. controls Capital;
2. controls at least three non-Capital seats;
3. has at least200 troops in Capital;
4. has not lost an earlier-resolving battle that dawn.

## 15. Council of Six

Every legal lord retains one vote while dispossessed.

Eligible: declared player, Renard unless withdrawn, Edric if declared.

### Vote behavior

- candidates vote self;
- valid Pledge/Commitment binds;
- coercion revalidates using knowledge-independent actual agreement/leverage at death;
- unpledged NPCs evaluate remaining candidates;
- final two-candidate ballot forces every lord to choose.

### Player's vote after elimination or non-declaration

If the player is not an eligible remaining candidate and Greyfen's vote is not forced:

1. pause succession;
2. present **Cast Greyfen's Vote** with remaining candidates and known reasons;
3. player chooses.

This choice can decide who wins history, but cannot restore the player or convert their loss into a win. If one candidate remains, Greyfen's vote is forced.

### Sole candidate

One eligible candidate receives required6–0 acclamation. Zero cannot occur because Renard withdraws only before another declared claimant.

### Majority and elimination

Four votes wins any ballot. With more than two and no majority, eliminate fewest votes. Tie for lowest:

1. fewer Commitments;
2. lower exact Claim;
3. lower Prestige;
4. later declaration.

Released supporters reevaluate.

### Final 3–3 tie

First distinction:

1. sole Church Endorsement;
2. Capital control;
3. more valid Commitments;
4. exact Claim;
5. Prestige;
6. earlier declaration.

## 16. Candidate elimination

Pledges to eliminated candidate release without oath penalty for ballot purposes. NPCs and eliminated NPC claimant evaluate remaining candidates. Eliminated player casts Greyfen's vote manually.

## 17. No postgame promise exploit

Every winning coalition paid meaningful pre-death cost. Outstanding promises appear in ending but future words alone never produced Pledge.