# Politics and Succession

## 1. Separate political concepts

The implementation must keep these distinct:

1. **Relationship** — personal trust/hostility.
2. **Support** — preferred claimant.
3. **Legitimacy** — Claim and Church judgment.
4. **Power** — armies, occupations and Capital control.

A friendly lord may still vote Renard. A coerced vote may coexist with hatred. There is no kingdom-wide succession score.

## 2. Candidates

- **Renard:** declares automatically at Ailing; remains eligible unless forced to withdraw under his exact rule.
- **Player:** becomes eligible only after completing Declare Candidacy.
- **Edric:** may declare from Gravely Ill if his conditions pass.
- **Ysabel, Oswin and Mara:** kingmakers only in the first release.

Edric cannot declare while **any valid Pledge** exists, including Under Duress. If coercive leverage breaks, his Pledge releases and candidacy can be checked at the next dawn.

## 3. Support record

Each lord has one support record:

- `candidateId | null`;
- `level`;
- `basis`;
- visibility;
- Proof/bargain references;
- break conditions;
- date last changed;
- maturation start;
- accumulated relevant shock.

A lord supports at most one candidate.

### Unaligned

No preference strong enough to record. Publicly shown as Undeclared.

### Leaning

Private preference.

- visible only through current intelligence;
- may change as the board changes;
- does not bind the ballot;
- must mature before a voluntary Pledge.

Maturation required at Request resolution:

- Ailing: 2 full days;
- Gravely Ill: 3 full days;
- Deathbed: 4 full days.

The current phase's requirement applies; prior Leaning time counts. A Commitment-grade shared-risk event can waive maturation for that lord.

### Pledged

Public declaration.

- sticky through ordinary preference changes;
- can be voluntary or Under Duress;
- casts a vote while valid;
- breaking without recognized cause harms the lord's standing.

### Committed

Support tied to shared risk.

Examples:

- troops fought together;
- the lord publicly financed the candidacy;
- Oswin tied the Synod to the claimant;
- a costly policy central to the lord's Desire was enacted;
- the lord publicly destroyed their safety with another candidate.

Commitment cannot be bought with a larger gift. It breaks only through authored betrayal, Red Line, candidate withdrawal or catastrophic state that satisfies its breaker.

### Self

A declared candidate votes for themselves while eligible.

## 4. Support basis

Store one dominant basis:

- ideological;
- legitimacy;
- bargain;
- opportunism;
- protection;
- coercion;
- self.

Basis changes what can break support.

- Opportunism reacts to visible collapse.
- Legitimacy reacts strongly to Claim/Church scandal.
- Bargain reacts to agreement breach.
- Coercion reacts to leverage only.
- Ideology reacts to policy/Red Line.

## 5. Per-lord candidate evaluation

AI may compare candidates for one lord using capped components. This is not a victory score.

- Relationship: -20…+20
- Desire alignment: -25…+25
- Legitimacy fit: -15…+15
- Viability: -20…+20
- Bargain value: 0…+30
- Fear response: -20…+20, personality dependent
- Red Line: excludes voluntary support while active

The UI shows strongest reasons, never the total.

### Thresholds

- Hear bargain: evaluation ≥0.
- Leaning: best evaluation ≥15 and lead over next ≥8.
- Voluntary Pledge: declared candidate + Leaning + maturation + Proof + accepted present collateral + no Red Line.
- Commitment: authored shared-risk trigger after Pledge.

## 6. Viability

Viability is a capped individual judgment based on public facts:

- public Pledges/Commitments;
- Claim band;
- Church stance;
- Capital control;
- recent major victory/defeat;
- dispossession;
- candidate withdrawal.

Ysabel weights it strongly, Mara weakly. The component cap prevents automatic bandwagon snowball.

## 7. Pledge inertia and shocks

Leanings may reevaluate after AI decisions and public events. Pledges reevaluate only after phase transition, recognized shock or direct violation.

Inertia:

- Ailing: 10
- Gravely Ill: 20
- Deathbed: 30

A voluntary Pledge breaks when:

1. relevant shock reaches current inertia;
2. an alternative leads evaluation by at least 10;
3. no valid Commitment lock remains.

Canonical shocks:

- Red Line or bargain breach: automatic;
- candidate withdrawal: automatic release;
- coercive leverage disappears: automatic release of Under Duress;
- seat occupied: 12;
- Capital lost: 12;
- major defeat: 10;
- all other public supporters lost: 10 for Opportunism;
- Forgery exposed: 20 for Legitimacy, 10 otherwise;
- Church Condemnation: 15 for pious/legitimacy basis;
- Oathbreaker becomes public: 10 for honorable/cautious lord.

Committed support ignores numeric inertia and uses its authored breaker.

## 8. Agreements

An agreement stores:

- participants;
- demand;
- accepted present collateral;
- reserved future reward;
- satisfaction/expiry;
- support effect;
- breach consequences.

### Acceptance timing

Offer Bargain costs 8 Influence at start. Collateral applies only when the target accepts at resolution. If the target becomes unavailable, collateral is not charged.

Once accepted, collateral is an Agreement obligation. It cannot be cancelled as an Order; use Break Agreement.

### Finite rewards

Each candidate's prospective government has one Marshal and one Chancellor reservation.

Uniqueness is **per candidate**. Renard and the player may each hypothetically offer Marshal, but the player cannot offer their one Marshalship to two lords.

Future rewards alone create/strengthen Leaning; they do not satisfy present collateral.

### Defection from an existing Pledge

A voluntary defection bargain can begin only if one is true:

- current Pledge has at least half the phase's break-shock requirement;
- current basis is Opportunism and challenger leads Viability by at least 10;
- current candidate violated known agreement/Red Line;
- challenger has valid coercive leverage.

A valid Commitment cannot be replaced by ordinary bargaining or ordinary coercion.

If a voluntary defection bargain succeeds:

1. old Pledge breaks publicly with its consequences;
2. lord becomes Leaning to challenger;
3. normal maturation applies before a new Pledge.

## 9. Escrow

Escrowed Gold is unavailable until agreement ends.

- supporter breaks without recognized cause: 50% returns now, 50% remains frozen until death;
- claimant breaks: full escrow transfers to supporter;
- loyal agreement: Gold stays locked through succession and appears in ending obligations.

The meaningful cost is pre-death liquidity.

## 10. Coercion and blackmail

Credible leverage exists when:

- target's hereditary seat is occupied by coercer; or
- adjacent available military meets personality threshold after defense/Fortification; or
- coercer holds an authored devastating secret.

Leverage must exist at Threaten start and resolution.

### Under Duress

- public Pledge and vote while leverage remains;
- never becomes Committed;
- breaks automatically with leverage;
- does not count as voluntary momentum for legitimacy-minded lords;
- adds severe threat reasons to every other lord;
- two current coerced Pledges block Church Endorsement.

A valid Commitment cannot be replaced by Under Duress. Coercion may extract another concession or create a shock, but support changes only if the Commitment's authored breaker occurs.

### One-use blackmail

A discovered secret may power one successful private blackmail agreement. Mark it used. It may still be exposed later, but cannot generate another successful Threaten concession.

## 11. Claim

Claim is public legal credibility.

Sources:

- starting lineage;
- Research Lineage once;
- Forge Royal Descent once;
- authored event evidence.

Destroying a rival's Claim does not directly add to the player's.

### Forgery

Forge grants +25 Claim and creates Forgery Evidence.

Exposure:

- remove 20 fabricated Claim;
- -10 Prestige;
- fraud-based Church Condemnation;
- support shocks;
- Oswin fraud Red Line.

Confess and Seek Penance can remove the Condemnation at substantial cost but never restores Claim or trust.

## 12. Church institution

Church stance per candidate:

- Condemned;
- Skeptical;
- Neutral;
- Favorable;
- Endorsed.

Only one candidate may be Endorsed. No endorsement before Ailing.

### Church case

Transparent institutional case:

- Claim band: 0–5;
- Oswin Pledged +2 or Committed +4;
- Patronage +1;
- lawful/pious conduct -6…+2;
- Renard's undiscredited favorite presumption +1.

Recalculate only after relevant public changes.

Eligibility for Endorsed:

1. Claim at least Plausible;
2. not Condemned;
3. case at least 6;
4. fewer than two coerced Pledges.

Highest qualifying case wins endorsement. Tie: higher Claim, then Oswin preference; if still tied, withhold endorsement.

Condemnation sources include unconfessed exposed Forgery, unjustified attack on Abbeylands, seizure of Church wealth or authored major impiety.

## 13. Information

### Public

- candidates;
- Pledged/Committed support and visible coercion;
- exact public Claim;
- Church stance;
- occupation/control;
- approximate army bands;
- wars, conduct and public bargains.

### Private

- Leanings;
- AI Intent;
- private negotiations;
- secrets;
- exact available troops;
- some Proof/Red Line progress.

Political intelligence becomes stale after 7 days. Secrets do not.

## 14. Succession forecast

**IF THE KING DIED TODAY** runs from a projection of the player's knowledge, never authoritative hidden state.

Show:

- locked public votes;
- known Leanings with timestamp;
- unknown houses;
- likely first leader and runoff using known data;
- active tie-break advantages;
- military-acclamation progress;
- qualitative verdict: Favored, Contested, Unlikely, Constitutionally Blocked.

Never show percentage or aggregate King score.

## 15. Military Acclamation

Before Council, a declared claimant wins by force only when at death they:

1. physically control Capital;
2. physically control at least three non-Capital seats;
3. maintain at least 200 loyal/contracted troops in Capital;
4. have not lost an earlier-resolving battle that dawn.

This is control of four of seven territories including Capital. Ending: Crowned by the Sword.

## 16. Council of Six

Every legal great lord retains one vote even if dispossessed.

Eligible candidates:

- declared player;
- Renard unless withdrawn;
- Edric if declared.

No minimum Claim removes a declared candidate.

### Vote rules

- candidate votes self;
- valid Commitment/Pledge votes recorded candidate;
- Under Duress votes only if leverage validates after all dawn state changes;
- unpledged lords choose by current evaluation;
- in the final two-candidate ballot every lord must choose one finalist.

The ending exposes each vote's dominant reasons.

### Sole candidate

If exactly one eligible candidate remains, Council conducts required acclamation and all six votes go to that candidate. Zero candidates cannot occur because Renard withdraws only under pressure from another declared claimant.

### Immediate majority

Four of six votes crowns on any ballot.

### Elimination

If no majority and more than two candidates:

1. eliminate fewest votes;
2. released supporters reevaluate;
3. ballot again.

Tie for lowest eliminates by:

1. fewer Commitments;
2. lower exact Claim;
3. lower Prestige;
4. later declaration.

### Final ballot

- 4–2 or better wins.
- 3–3 uses first distinguishing condition:
  1. sole Church Endorsement;
  2. physical Capital control;
  3. more valid Commitments;
  4. higher exact Claim;
  5. higher Prestige;
  6. earlier declaration.

## 17. Candidate elimination

A Pledge to an eliminated candidate releases without oath penalty for ballot purposes. The lord and eliminated claimant choose among remaining candidates by Red Lines, relationship, Desire, legitimacy, still-relevant bargains, fear and constitutional reality.

## 18. No postgame promise exploit

Outstanding promises appear in the ending, but no future promise alone delivered a Pledge. Every coalition already paid meaningful pre-death cost through locked Gold/troops, policy weakness, public hostility, war or shared risk.