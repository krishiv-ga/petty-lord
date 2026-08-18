# Exact Candidate Evaluation

This file is authoritative for private Leanings, voluntary bargaining, unpledged Council votes and AI explanations. It prevents implementation from inventing a generic relationship-to-vote rule.

The calculation answers one question only:

> **How does this specific lord currently judge this specific candidate?**

It is not a kingdom-wide victory score and is never shown as a total to the player.

## 1. Evaluation formula

For each kingmaker or eliminated NPC claimant:

`evaluation = relationship + legitimacy + viability + desireAndConduct + bargain + fear`

Components are calculated from that lord's knowledge projection, not omniscient truth.

If an active Red Line excludes the candidate from voluntary support, return `EXCLUDED` rather than a number.

### Relationship

`round(relationshipValue / 5)`, clamped -20…+20.

### Viability

Use the exact public-fact calculation in `balance-sheet.md`, including the lord-specific multiplier.

### Bargain

Use the highest applicable state; do not add several values:

- no relevant offer: 0;
- reserved future office/reward only: +8;
- accepted present collateral, obligation still in progress: +12;
- preferred bargain fully fulfilled: +20;
- shared-risk bargain fulfilled: +25.

A breached bargain activates its authored Red Line or shock rather than a negative bargain score.

### Fear

Use the observer's known threat band. Hidden exact troops are forbidden.

### Ties

When two candidates have equal evaluation, the lord keeps their current Leaning. If no current Leaning, use:

1. higher Relationship component;
2. higher Legitimacy component;
3. earlier declaration;
4. stable candidate ID order for determinism.

The tie rule does not bypass the minimum Leaning threshold.

## 2. General support rules

A lord:

- hears a bargain at evaluation ≥0;
- Leans at evaluation ≥15 and at least 8 above the next candidate;
- becomes Unaligned if their best evaluation falls below10 or their lead falls below4;
- otherwise retains an existing Leaning through hysteresis;
- Pledges only after Proof, collateral and continuous maturation;
- follows Pledge/Commitment inertia rules after public support.

`maturationStart` resets whenever candidateId changes or the lord becomes Unaligned.

At the Council, an unpledged lord chooses the highest non-excluded remaining candidate. In a final two-candidate ballot, if both are excluded, the lord chooses the less severe Red-Line conflict using exact order: no active violence against own seat → higher Relationship → higher Claim → earlier declaration.

## 3. Edric evaluation

### Legitimacy

#### Claim

- None: -6
- Dubious: -3
- Plausible: 0
- Strong: +2
- Excellent: +4
- Overwhelming: +5

#### Church stance

- Condemned: -4
- Skeptical: -1
- Neutral: 0
- Favorable: +1
- Endorsed: +2

Add Claim and Church values, clamped -8…+7.

### Desire and conduct

Add relevant facts, then clamp -25…+25:

- known candidate available military below 0.50× Edric defense: -12
- 0.50–0.89×: -5
- 0.90–1.39×: +8
- 1.40–1.99×: +5
- 2.00× or more: +5 here, with danger handled by Fear
- major victory in previous 10 days: +8
- major defeat in previous 10 days: -8
- fulfilled Border Aid: +10
- shared campaign victory: +12
- held Capital continuously for at least 3 days: +5
- publicly abandoned an ally in war: -15
- Oathbreaker involving military aid: -20

### Fear

- Low: 0
- Concern: +3
- Serious: -8
- Existential: -20

Edric respects visible strength until it threatens his independence.

### Proof

Any one satisfies Proof:

1. candidate won a major battle in previous 14 days;
2. candidate's known available effective military is at least 0.90× Edric's and candidate Prestige is at least35;
3. candidate fulfilled Border Aid or a joint military obligation;
4. candidate held Capital for 3 continuous days without losing a major battle.

### Red Lines

Exclude voluntary support while any is active:

- candidate broke promised military aid;
- candidate abandoned Edric during a triggered shared war;
- candidate currently occupies Northkeep;
- candidate has a valid Commitment to a political program requiring Edric's destruction.

## 4. Ysabel evaluation

### Legitimacy

#### Claim

- None: -8
- Dubious: -4
- Plausible: 0
- Strong: +2
- Excellent: +4
- Overwhelming: +5

#### Church stance

- Condemned: -5
- Skeptical: -2
- Neutral: 0
- Favorable: +2
- Endorsed: +4

Clamp combined value -12…+9.

### Desire and conduct

Clamp -25…+25:

- controls Capital: +4
- successfully protected Eastvale: +15
- active troop-protection agreement: +8
- major victory in previous 10 days: +4
- major defeat in previous 10 days: -6
- public Oathbreaker: -8
- Defaulted Debtor to Ysabel: -25
- currently occupies Eastvale without a liberation/protection agreement: Red Line, not a score
- lost every other public supporter after Ysabel took a risk: -12

### Fear

For voluntary support:

- Low: 0
- Concern: +2
- Serious: +4 if an active protection bargain benefits Ysabel, otherwise -6
- Existential: -15

Military or occupation coercion is resolved through Threaten and does not use a positive voluntary evaluation.

### Proof

One path must pass:

- candidate has at least one other voluntary public Pledge/Commitment;
- candidate has Plausible+ Claim and Church Favorable/Endorsed;
- candidate controls Capital;
- candidate defeated a rival claimant in a major battle;
- accepted Gold Escrow of 80+;
- accepted Protection of 100+ troops.

Chancellorship plus 40 Gold is collateral but does not by itself satisfy Proof.

### Red Lines

Exclude voluntary support while:

- candidate occupies Eastvale without a protection/liberation agreement;
- candidate defaulted on Ysabel's loan and has not repaired the debt;
- candidate publicly destroyed Ysabel's financial network;
- candidate's collapse activated an authored accepted-bargain failure.

## 5. Oswin evaluation

### Legitimacy

#### Claim

- None: -15
- Dubious: -10
- Plausible: 0
- Strong: +5
- Excellent: +8
- Overwhelming: +10

#### Church stance

- Condemned: EXCLUDED
- Skeptical: -5
- Neutral: 0
- Favorable: +3
- Endorsed: +5

Clamp numeric combined value -20…+15.

### Desire and conduct

Clamp -25…+25:

- Patronage or Abbey Endowment: +5
- defended/liberated Abbeylands: +10
- funded royal funeral: +3
- active Church Immunities: +8
- exposed serious impiety in a rival while remaining lawful: +5
- Broke King's Peace in Ailing: -4
- Defied King's Peace in Stable: -8
- Usurper from Capital seizure: -8
- second offensive war: -5
- public Oathbreaker: -8
- attacks Abbeylands: Red Line
- unconfessed exposed Forgery: Red Line

### Fear

- Low: 0
- Concern: -2
- Serious: -8
- Existential: -15

### Proof

Candidate must have Plausible+ Claim and at least one:

- Patronage or Abbey Endowment;
- Church Immunities;
- defended/liberated Abbeylands;
- exposed a major impiety in the leading rival and has no negative Church conduct.

### Red Lines

Exclude voluntary support while:

- candidate attacked Abbeylands without defensive cause;
- candidate has unconfessed exposed Forgery;
- candidate seized Church wealth;
- candidate maintains an authored openly sacrilegious agreement;
- candidate has two publicly known coerced Pledges and is pursuing Church legitimacy.

## 6. Mara evaluation

### Legitimacy

#### Claim

- None: +3
- Dubious: +2
- Plausible: 0
- Strong: -2
- Excellent: -4
- Overwhelming: -6

#### Church stance

- Condemned: 0
- Skeptical: +1
- Neutral: 0
- Favorable: -1
- Endorsed: -3

Clamp combined -9…+4.

Mara distrusts a candidate who can easily restore royal centralization; she does not reward impiety itself.

### Desire and conduct

Clamp -25…+25:

- Greyfen Charter: +20
- supported Provincial Liberties event: +6
- Denounced Central Rule: +8
- fulfilled Provincial Aid: +12
- liberated Westmarch: +20
- defended royal centralization in the Petition event: -12
- active program expanding royal taxation/levies: -20
- Capital seized against Renard's government: +3
- public Oathbreaker: -10
- currently occupies Westmarch: Red Line

### Fear

- Low: 0
- Concern: -2
- Serious: -10
- Existential: -20

### Proof

Any one:

- Greyfen Charter enacted;
- Provincial Aid fulfilled;
- Westmarch liberated for Mara;
- another authored concrete decentralizing concession of equivalent cost.

Denounce Central Rule alone cannot satisfy Proof.

### Red Lines

Exclude voluntary support while:

- candidate occupies Westmarch without a temporary liberation agreement;
- candidate revoked/contradicted Charter;
- candidate adopted a centralizing tax/levy program;
- candidate betrayed Provincial Aid.

## 7. Renard after elimination

Renard normally votes for himself. This evaluation applies only after he is eliminated or withdrawn and must choose among remaining candidates.

### Legitimacy

#### Claim

- None: -10
- Dubious: -6
- Plausible: 0
- Strong: +4
- Excellent: +7
- Overwhelming: +9

#### Church stance

- Condemned: -8
- Skeptical: -3
- Neutral: 0
- Favorable: +3
- Endorsed: +6

Clamp -18…+15.

### Desire and conduct

Clamp -25…+25:

- candidate exposed Renard's major secret: -20
- candidate currently occupies Southmere: -25
- candidate defeated Renard in a major battle: -10
- candidate protected or restored Southmere: +15
- Greyfen Charter: -10
- Denounced Central Rule: -8
- Usurper from Capital seizure: -10
- candidate promises no authored immunity because post-coronation legal bargaining is outside launch scope
- public Oathbreaker: -8

### Fear

- Low: 0
- Concern: +2
- Serious: -5
- Existential: -15

Renard can respect a strong remaining monarch but resists one who destroyed his house.

### Bargain

Always 0 in launch scope. Renard is not a normal kingmaker bargain target.

### Red Lines

No candidate is absolutely excluded in a final two-candidate ballot; the Constitution forces a choice. Before the final ballot, current occupation of Southmere or exposure of his secret acts as maximum negative conduct rather than automatic abstention.

## 8. Player vote after elimination or non-declaration

The game never evaluates the player's political preference automatically.

When Greyfen must vote and the player is not an eligible remaining candidate:

- pause succession;
- present all remaining candidates with public/known reasons;
- require **Cast Greyfen's Vote**;
- the choice can determine who is crowned but cannot restore the player or change the player's loss into a win.

If one candidate remains, Greyfen's vote is forced and no choice modal is necessary.

## 9. Known military ratio and threat

All military comparisons in this file use the observer's estimate:

- fresh exact intelligence or directly observed campaign: exact;
- public band: midpoint (Broken 75, Modest 225, Strong 400, Formidable 600 unless a visible minimum is higher);
- stale exact intelligence: halfway between the old exact value and current public-band midpoint;
- observer's own defense: exact.

Battle fortune is never included before battle.

## 10. Explanation reason ordering

The UI and ending select reasons deterministically:

1. active Red Line/exclusion;
2. binding Pledge/Commitment/Coercion;
3. unmet Proof or maturation;
4. largest absolute Desire/Conduct modifier;
5. Bargain state;
6. Legitimacy;
7. Viability;
8. Fear;
9. Relationship.

Show at most three positive and three negative reasons in the inspector. The ending may show more.

## 11. Worked opening checks

### Ysabel → Renard

Baseline relationship, Excellent Claim, Church Favorable and high Viability put Renard comfortably over the Leaning threshold.

### Oswin → Renard

Excellent Claim plus Favorable Church and positive relationship create a strong Leaning, but no public Pledge exists before Ailing.

### Mara → nobody

Anti-Renard Desire makes Renard unattractive; the player lacks a concrete concession, so neither candidate reaches a mature Pledge path.

### Edric → nobody

Renard has legitimacy but not enough military/personal alignment; the player lacks strength and Proof. Edric remains available but not cheaply purchasable.

These checks should be encoded as unit tests so data changes cannot accidentally rewrite the opening.