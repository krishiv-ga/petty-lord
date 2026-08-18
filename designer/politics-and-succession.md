# Politics and Succession

## 1. Separation of political systems

The design deliberately separates four concepts that are often collapsed into one number:

1. **Relationship** — personal trust, warmth and hostility.
2. **Support** — whom a lord wants to become King.
3. **Legitimacy** — public Claim and Church judgment.
4. **Power** — military leverage, territorial control and control of the Capital.

A gift can improve Relationship without changing Support. A lord can support someone they dislike because that candidate appears lawful or inevitable. A terrifying claimant can gain coerced votes while losing voluntary support. The implementation must preserve these distinctions.

There is no global succession score.

## 2. Candidate set

### Renard

Renard declares automatically when the King becomes Ailing and remains a candidate unless forced to withdraw under the exact rule in `world-and-actors.md`.

### Player

The player becomes a candidate only after completing Declare Candidacy from Ailing onward. Declaration is irreversible.

### Edric

Edric may declare from Gravely Ill onward if his authored conditions are met.

### Other lords

Ysabel, Oswin and Mara are kingmakers in the first release. They do not spontaneously declare. This keeps the ballot readable and their political identities distinct.

## 3. Support states

Every great lord has one support record:

- `candidateId` or null;
- `level`;
- `basis`;
- proof and bargain references;
- public/private visibility;
- active break conditions;
- date last changed.

A lord can support only one candidate at a time.

### Unaligned

No current preference strong enough to record.

Public presentation: **Undeclared**.

### Leaning

A private preference.

- Not visible without current intelligence.
- Easy to change when the board changes.
- Does not bind the death ballot.
- Allows the candidate to Request Declaration.

### Pledged

A public declaration.

- Visible to everyone.
- Creates political momentum.
- Persists through ordinary preference changes.
- Can be voluntary or Under Duress.
- Breaking it damages the lord's Prestige and relationships unless a recognized shock or Red Line justifies the break.

### Committed

A public or discoverable tie created by shared risk.

Examples:

- troops fought together;
- the lord publicly funded the claimant;
- the Church endorsed the claimant through Oswin's intervention;
- the claimant enacted a costly policy central to the lord's Desire;
- the lord publicly denounced another candidate and cannot retreat safely.

Commitment is not purchased by a larger gift. It breaks only through betrayal, Red Line violation, candidate withdrawal or a catastrophic loss that makes the relationship impossible.

### Self

A declared claimant supports themselves and casts their own vote in every ballot while eligible.

## 4. Support basis

The support record also stores why the lord is backing the candidate:

- `ideological`;
- `legitimacy`;
- `bargain`;
- `opportunism`;
- `protection`;
- `coercion`;
- `self`.

The basis changes behavior.

Examples:

- Opportunistic support is sensitive to visible collapse.
- Ideological support is sensitive to policy betrayal.
- Bargain support is sensitive to the agreement state.
- Coerced support is sensitive only to credible threat and can never become Committed.
- Legitimacy support is especially sensitive to Claim scandal or Church condemnation.

## 5. Candidate evaluation for a specific lord

Rival AI may use an internal per-lord candidate utility, but this is not a kingdom-wide victory score. It exists only to compare whom one person currently prefers.

The components are capped separately:

- **Relationship:** -20 to +20
- **Desire alignment:** -25 to +25
- **Legitimacy fit:** -15 to +15
- **Viability:** -20 to +20
- **Bargain value:** 0 to +30
- **Fear response:** -20 to +20, with sign and weight determined by personality
- **Red Line:** candidate excluded from voluntary support while violated

The UI never exposes a total. It exposes the strongest positive and negative reasons.

Examples:

> Friendly toward you  
> Impressed by your victory over Renard  
> Doubts your Claim  
> Fears that Edric still controls the northern armies

### Leaning rule

A lord becomes Leaning when:

1. no Red Line is active;
2. one candidate's evaluation is at least 15;
3. that candidate leads the next alternative by at least 8.

A lord can remain Unaligned when all options are poor.

### Negotiation rule

A lord will hear a bargain when the candidate's evaluation is at least 0 and no Red Line is active.

### Voluntary Pledge rule

A voluntary Pledge requires all:

1. candidate is formally declared;
2. lord is Leaning toward the candidate;
3. the lord's personal Proof is satisfied;
4. present collateral or a concrete concession has been delivered;
5. no incompatible Pledge or Commitment exists.

A reserved future office or land grant by itself never satisfies item 4.

### Commitment rule

A Pledged lord becomes Committed only when an authored shared-risk trigger occurs. Each lord has at least one such trigger and no generic “pay more” route.

## 6. Political viability

Viability is one capped input to individual lord judgment. It prevents lords from ignoring obvious reality without making momentum the only strategy.

Public facts that can contribute:

- number and strength of public Pledges and Commitments;
- Claim band;
- Church stance;
- control of the Capital;
- major military victory or defeat;
- dispossession;
- withdrawal of another candidate.

The full Viability component is capped at ±20. Ysabel weights it strongly, Mara weakly, and Oswin/Edric moderately. This cap prevents automatic coalition snowballing.

## 7. Pledge inertia and political shocks

Leanings may change whenever a lord selects a new Intent or a major public event occurs.

Pledges do not continuously oscillate. They reevaluate only after a recognized political shock, phase change or direct violation.

### Inertia by phase

- Ailing: 10
- Gravely Ill: 20
- Deathbed: 30

A voluntary Pledge breaks only when:

1. the cumulative relevant shock value reaches the current inertia;
2. an alternative candidate is at least 10 evaluation points better;
3. no Commitment lock remains.

### Canonical shocks

- Candidate violates the lord's Red Line: automatic break.
- Candidate breaks the supporting bargain: automatic break.
- Candidate withdraws: automatic release.
- Coercive leverage disappears: automatic release of Under Duress support.
- Candidate's seat is occupied: 12.
- Candidate loses the Capital: 12.
- Candidate suffers a major military defeat: 10.
- Candidate loses all other public supporters: 10 for opportunistic basis.
- Claim forgery is exposed: 20 for legitimacy basis, 10 otherwise.
- Church condemns candidate: 15 for Oswin/legitimacy basis.
- Candidate publicly becomes Oathbreaker: 10 for honorable or cautious lords.

Committed support ignores numeric inertia and breaks only for its authored breaker, a Red Line, bargain betrayal, candidate withdrawal or impossible coercion.

## 8. Agreements and collateral

An agreement records:

- participants;
- demanded objective;
- immediate collateral;
- reserved finite reward, if any;
- expiry or duration;
- satisfaction state;
- support effect;
- breach consequences.

### Finite rewards

The first release contains two unique Crown offices:

- Marshal;
- Chancellor.

Each can be reserved for only one lord. The UI prevents contradictory office promises. Prospective territory grants may be discussed as flavor or Leaning modifiers but do not independently create Pledges.

### Immediate collateral examples

- Gold placed into escrow and removed from spendable funds;
- troops locked for allied defense;
- a public Charter that weakens Greyfen;
- a Church endowment paid now;
- a public denunciation that damages another relationship;
- participation in a war.

### Escrow

Escrowed Gold is unavailable to both sides until the agreement ends.

- If the supporter breaks without recognized cause, 50% returns immediately and 50% remains frozen until death.
- If the player breaks, the full escrow transfers to the supporter.
- If the supporter remains loyal, Gold stays locked through the succession and appears as an obligation on the ending report.

The game ends at coronation, so the relevant mechanical cost is the Gold being unusable during the crisis.

## 9. Coercion

Threaten can create a **Pledge — Under Duress** only when leverage is credible.

Credible leverage exists when at least one is true:

- the player physically occupies the target's hereditary seat;
- the player's available adjacent military strength is at least 1.5× the target's defensive availability after Fortification;
- the player controls a discovered secret whose authored consequence is politically devastating to that target.

Personality still matters. Edric is more likely to refuse military intimidation and prepare war; Ysabel is more likely to submit temporarily.

### Coerced support rules

- Publicly counts as a Pledge and casts a vote while leverage remains.
- Does not count as voluntary momentum for lords who value legitimacy or trust.
- Can never become Committed.
- Automatically breaks if the leverage condition ceases to be true.
- Each coerced Pledge adds a severe threat reason to every other lord.
- Two or more coerced Pledges prevent Church endorsement until at least one is released.

The coercive route is viable but naturally creates containment behavior.

## 10. Claim

Claim is public legal credibility, not a spendable resource.

### Sources

- starting lineage;
- Research Lineage, once per run;
- Forge Royal Descent, once per run;
- authored event evidence;
- exposure of false rival claims does not directly add to the player's Claim;
- Church endorsement does not add Claim, but validates it politically.

### Fraud

Forge Royal Descent always grants its listed Claim. It also creates Forgery Evidence.

If exposed:

- remove 20 of the 25 fabricated Claim immediately;
- apply -10 Prestige;
- apply a major negative Church-conduct flag;
- trigger pledge shocks;
- Oswin's Red Line activates unless the player publicly confesses through a contextual event.

The safe Research Lineage gain is never removed by fraud exposure.

## 11. The Church

The Church is an institution, not a seventh noble vote and not identical to Oswin.

Each declared candidate has one public Church stance:

- Condemned
- Skeptical
- Neutral
- Favorable
- Endorsed

Only one candidate can be Endorsed at a time. Before Ailing, nobody is Endorsed.

### Church case

The Synod uses a separate transparent institutional case, not a succession score:

- Claim band: 0–5 case strength
- Oswin support: 0 Leaning/none, +2 Pledged, +4 Committed
- public Patronage: +1
- lawful/pious conduct: -6 to +2
- Renard's royal-favorite presumption: +1 while not discredited

Church case is recalculated only after relevant public events, not every frame.

### Endorsement

A candidate can be Endorsed when:

1. Claim is at least Plausible;
2. candidate is not Condemned;
3. Church case is at least 6;
4. candidate has fewer than two coerced Pledges.

The qualifying candidate with the strongest case is Endorsed. Ties resolve by higher Claim, then Oswin's preference. If still tied, the Church withholds endorsement.

This allows a player with Strong Claim, Oswin's Pledge and Patronage to overcome Renard's passive presumption, while keeping Oswin influential rather than omnipotent.

### Condemnation

The Church condemns a candidate for:

- attacking Abbeylands without a recognized defensive cause;
- exposed unconfessed royal-lineage fraud;
- seizing Church wealth through an event;
- repeated oath-breaking involving the Church;
- another authored major impiety.

Condemnation can be repaired only through an authored confession/reparation path. Gold alone cannot erase it immediately.

## 12. Public and private political information

### Always public

- declared candidates;
- Pledged and Committed support;
- whether a Pledge is visibly coerced;
- Claim ratings and bands;
- Church stance;
- territory control and occupations;
- approximate army bands;
- public agreements and policy concessions;
- wars, victories, defeats and withdrawals.

### Private unless discovered

- Leanings;
- current AI Intent;
- unannounced bargain negotiations;
- secrets;
- exact troop availability;
- some proof and Red Line progress;
- hidden preparation before a campaign becomes public.

Private political intelligence becomes stale seven days after observation. Secrets do not become stale.

## 13. Succession forecast

After Ailing begins, the player can open **IF THE KING DIED TODAY**.

The forecast uses the exact ballot rules but distinguishes knowledge from uncertainty.

It displays:

- locked public votes;
- known current intelligence with observation date;
- undecided or unknown houses;
- likely first-ballot leader;
- likely runoff pair;
- active tie-break advantages;
- a qualitative verdict: Favored, Contested, Unlikely or Constitutionally Blocked.

It never displays a percentage or aggregate King score.

Example:

> **You — 2 public votes**  
> Self; Mara Pledged  
> Ysabel privately Leaning toward you — intelligence 3 days old
>
> **Renard — 2 public votes**  
> Self; Oswin Pledged  
> Church Favorable
>
> **Forecast:** Contested. You require one additional first-ballot vote or a favorable 3–3 runoff tie-break.

## 14. Military acclamation

Before the Council ballots, check whether a declared claimant has physically made the constitutional process irrelevant.

A claimant wins by **Military Acclamation** only if, at the instant of death, all are true:

1. physically controls the Capital;
2. physically controls at least three non-Capital seats, one of which may be their hereditary home;
3. maintains at least 200 loyal or contracted troops in the Capital garrison;
4. is not currently defeated in a battle resolving earlier that same dawn.

This means the claimant controls four of seven territories including the Capital.

Because ordinary occupations require garrisons, yield little income and create threat, this route requires real military and economic commitment.

If the condition is met, the claimant is crowned before the Council can assemble. The ending is **Crowned by the Sword** and reports the hostile houses and occupied realm.

Only one claimant can control the Capital, so simultaneous military acclamation is impossible.

## 15. Council of Six succession procedure

If nobody qualifies for Military Acclamation, the six great lords meet in Council.

Every legal great lord retains one vote even if dispossessed.

### 15.1 Candidate eligibility

Eligible candidates are:

- player, if declared;
- Renard, unless withdrawn;
- Edric, if declared.

There is no minimum Claim that removes a declared candidate from the ballot. A laughable candidate can stand and be rejected.

### 15.2 Vote behavior

At each ballot:

- eligible candidates vote for themselves;
- valid Committed supporters vote for their candidate;
- valid voluntary Pledges vote for their candidate;
- Under Duress Pledges vote for the coercer only if leverage remains credible at death;
- unpledged lords choose according to current candidate evaluation;
- in a final two-candidate ballot, every lord must choose one of the finalists, even if both are disliked.

The ending report exposes each vote's dominant reasons.

### 15.3 Immediate acclamation

A candidate receiving at least **4 of 6 votes** on any ballot is crowned immediately.

### 15.4 Elimination ballots

If no candidate has four votes and more than two candidates remain:

1. eliminate the candidate with the fewest votes;
2. supporters of the eliminated candidate reevaluate among those remaining;
3. conduct another ballot.

If multiple candidates tie for fewest votes, eliminate in this order:

1. fewer Committed supporters;
2. lower exact Claim;
3. lower Prestige;
4. later formal declaration date.

This is a deterministic constitutional elimination rule, not an aggregate score.

### 15.5 Final two-candidate ballot

With two finalists, all six lords cast a final vote.

- 4–2 or better wins.
- A 3–3 result uses the constitutional tie-break chain below.

### 15.6 Constitutional tie-break chain

Apply the first condition that distinguishes the finalists:

1. sole Church Endorsement;
2. physical control of the Capital;
3. greater number of valid Committed supporters;
4. higher exact Claim;
5. higher Prestige;
6. earlier formal declaration.

The winning condition is named explicitly on the ending screen.

The Capital therefore matters sharply in a deadlock without acting as a generic bonus in every election.

## 16. Support after candidate elimination

A lord whose candidate is eliminated is released from their Pledge for ballot purposes without oath-breaking penalties.

They then choose between remaining candidates according to:

1. active Red Lines;
2. relationships and Desire alignment;
3. legitimacy;
4. viable bargains that remain relevant;
5. fear and military reality;
6. current constitutional tie-break situation.

An eliminated claimant also casts a vote under the same rule. Renard and Edric can therefore become decisive kingmakers after losing.

## 17. No invisible postgame debt exploit

Outstanding promises appear in the ending report, but no future promise alone can have delivered a Pledge. Every winning coalition has already paid meaningful pre-death cost through locked Gold, committed troops, policy weakness, hostile acts or shared risk.

This preserves the dramatic image of a mortgaged crown without making “promise everything, win, end screen” the optimal strategy.