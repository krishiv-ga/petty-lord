# Exact Candidate Evaluation

This file is authoritative for private Leanings, voluntary bargaining, unpledged Council votes and AI explanations. It prevents implementation from inventing a generic relationship-to-vote rule.

The calculation answers:

> **How does this specific lord currently judge this specific candidate?**

It is not a kingdom-wide victory score and is never shown as a total.

## 1. Formula

`evaluation = relationship + legitimacy + viability + desireAndConduct + bargain + fear`

Calculate from that lord's knowledge projection. An active Red Line returns `EXCLUDED` from voluntary support.

### Relationship

`round(relationshipValue / 5)`, clamped -20…+20.

### Viability

Use `balance-sheet.md`, including lord multiplier.

### Bargain

Use highest, never add:

- none: 0;
- reserved future reward only: +8;
- accepted present collateral still in progress: +12;
- preferred bargain fulfilled: +20;
- shared-risk bargain fulfilled: +25.

### Fear

Use observer's known threat band.

### Exact ties

Keep current Leaning. If none:

1. higher Relationship component;
2. higher Legitimacy;
3. earlier declaration;
4. stable candidate ID.

Tie rule does not bypass Leaning threshold.

## 2. General support behavior

- hear bargain at evaluation≥0;
- Lean at evaluation≥15 and lead≥8;
- become Unaligned if best<10 or lead<4;
- otherwise retain Leaning;
- Pledge only after Proof, collateral and maturation;
- then use Pledge/Commitment inertia.

`maturationStart` resets whenever candidateId changes or lord becomes Unaligned.

At Council an unpledged lord chooses highest non-excluded remaining candidate. If both finalists are excluded, choose by: no current violence against own seat → higher Relationship → higher Claim → earlier declaration.

## 3. Edric

### Legitimacy

Claim: None -6, Dubious -3, Plausible0, Strong+2, Excellent+4, Overwhelming+5.

Church: Condemned -4, Skeptical -1, Neutral0, Favorable+1, Endorsed+2.

Clamp combined -8…+7.

### Desire and conduct

Add and clamp -25…+25:

- known military <0.50× Edric defense: -12;
- 0.50–0.89×: -5;
- 0.90–1.39×: +8;
- 1.40–1.99×: +5;
- 2.00×+: +5 here, danger in Fear;
- major victory previous10d: +8;
- major defeat previous10d: -8;
- fulfilled Border Aid: +10;
- shared campaign victory: +12;
- held Capital continuously3d: +5;
- publicly abandoned ally: -15;
- Oathbreaker involving military aid: -20.

### Fear

Low0, Concern+3, Serious-8, Existential-20.

### Proof

Any one:

1. major battle won in previous14d;
2. known available effective military≥0.90× Edric and Prestige≥35;
3. fulfilled Border Aid/joint obligation;
4. held Capital3d without major defeat.

### Red Lines

- broke promised aid;
- abandoned Edric in triggered shared war;
- currently occupies Northkeep;
- valid Commitment to a program requiring Edric's destruction.

## 4. Ysabel

### Legitimacy

Claim: None -8, Dubious -4, Plausible0, Strong+2, Excellent+4, Overwhelming+5.

Church: Condemned -5, Skeptical -2, Neutral0, Favorable+2, Endorsed+4.

Clamp -12…+9.

### Desire and conduct

Clamp -25…+25:

- controls Capital: +4;
- successfully protected Eastvale: +15;
- active troop protection: +8;
- major victory previous10d: +4;
- major defeat previous10d: -6;
- public Oathbreaker: -8;
- Defaulted Debtor to Ysabel: -25;
- lost all other support after Ysabel took risk: -12.

### Fear for voluntary support

Low0, Concern+2, Serious+4 if active protection benefits Ysabel otherwise -6, Existential-15.

Military coercion uses Threaten, not positive voluntary evaluation.

### Proof

Any one:

- another voluntary public Pledge/Commitment;
- Plausible+ Claim and Church Favorable/Endorsed;
- Capital control;
- defeated rival claimant in major battle;
- accepted Escrow80+;
- accepted Protection100+.

Chancellorship plus budget is collateral but not Proof alone.

### Red Lines

- occupies Eastvale without protection/liberation agreement;
- has the Defaulted Debtor flag from Ysabel's loan — this lasts for the remainder of the launch-scope run;
- publicly destroyed her financial network;
- authored accepted-bargain collapse.

## 5. Oswin

### Legitimacy

Claim: None -15, Dubious -10, Plausible0, Strong+5, Excellent+8, Overwhelming+10.

Church: Condemned EXCLUDED, Skeptical -5, Neutral0, Favorable+3, Endorsed+5.

Clamp numeric -20…+15.

### Desire and conduct

Clamp -25…+25:

- Patronage/Endowment +5;
- defended/liberated Abbeylands +10;
- funeral +3;
- Church Immunities +8;
- exposed rival impiety while lawful +5;
- Broke Peace Ailing -4;
- Defied Peace Stable -8;
- Usurper -8;
- second offensive war -5;
- public Oathbreaker -8.

### Fear

Low0, Concern-2, Serious-8, Existential-15.

### Proof

Plausible+ Claim and one of Patronage/Endowment, Immunities, defense/liberation of Abbeylands, or exposing major rival impiety while having no negative Church conduct.

### Red Lines

- unjustified attack on Abbeylands;
- unconfessed exposed Forgery;
- seized Church wealth;
- active sacrilegious agreement;
- two publicly known coerced Pledges while pursuing Church legitimacy.

## 6. Mara

### Legitimacy

Claim: None+3, Dubious+2, Plausible0, Strong-2, Excellent-4, Overwhelming-6.

Church: Condemned0, Skeptical+1, Neutral0, Favorable-1, Endorsed-3.

Clamp -9…+4.

### Desire and conduct

Clamp -25…+25:

- Greyfen Charter +20;
- supported Provincial Liberties +6;
- Denounced Central Rule +8;
- fulfilled Provincial Aid +12;
- liberated Westmarch +20;
- defended royal centralization -12;
- program expanding royal taxation/levies -20;
- seized Capital against Renard +3;
- public Oathbreaker -10.

### Fear

Low0, Concern-2, Serious-10, Existential-20.

### Proof

Charter, fulfilled Provincial Aid, liberation of Westmarch, or equivalent authored decentralizing concession. Denounce alone is insufficient.

### Red Lines

- occupies Westmarch without liberation agreement;
- revoked/contradicted Charter;
- centralizing tax/levy program;
- betrayed Provincial Aid.

## 7. Renard after elimination

Renard normally votes self. This applies only after elimination/withdrawal.

### Legitimacy

Claim: None -10, Dubious -6, Plausible0, Strong+4, Excellent+7, Overwhelming+9.

Church: Condemned -8, Skeptical -3, Neutral0, Favorable+3, Endorsed+6.

Clamp -18…+15.

### Desire and conduct

Clamp -25…+25:

- candidate exposed his secret -20;
- occupies Southmere -25;
- defeated Renard -10;
- protected/restored Southmere +15;
- Greyfen Charter -10;
- Denounced Central Rule -8;
- Usurper -10;
- public Oathbreaker -8.

### Fear

Low0, Concern+2, Serious-5, Existential-15.

Bargain always0; Renard is not launch-scope bargain target.

No absolute exclusion in final two-candidate ballot; Constitution forces choice.

## 8. Player vote

Never auto-evaluate player preference.

If Greyfen must vote and player is not eligible:

- pause succession;
- show remaining candidates and known reasons;
- require Cast Greyfen's Vote;
- choice cannot restore player or change their loss to a win.

One remaining candidate is forced.

## 9. Known military values

- fresh exact/direct campaign: exact;
- public band midpoint: Broken75, Modest225, Strong400, Formidable600 unless visible minimum higher;
- stale exact: halfway to current midpoint;
- own defense exact;
- no hidden fortune.

## 10. Explanation order

1. Red Line;
2. binding support/coercion;
3. unmet Proof/maturation;
4. largest Desire/Conduct;
5. Bargain;
6. Legitimacy;
7. Viability;
8. Fear;
9. Relationship.

Inspector max three positive and three negative; ending may show more.

## 11. Opening unit tests

- Ysabel strongly Leans Renard.
- Oswin strongly Leans Renard.
- Mara remains Unaligned despite opposing Renard because player lacks concession.
- Edric remains Unaligned because neither candidate satisfies his strength/Proof expectations.

Encode these as unit tests so data changes cannot rewrite the opening accidentally.