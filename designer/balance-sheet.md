# First-Pass Balance Sheet

This file contains the initial numeric contract for implementation and paperplay. Values are expected to move during simulation, but they must be changed intentionally and recorded in `paperplay/final-amendments.md`.

## 1. Starting state

| Lord | Gold | Levies / Cap | Prestige | Claim | Influence | Initial public support |
|---|---:|---:|---:|---:|---:|---|
| Player / Greyfen | 70 | 360 / 420 | 12 | 10 | 35 | None; not a candidate |
| Edric / Northkeep | 55 | 620 / 720 | 55 | 18 | 35 | None |
| Ysabel / Eastvale | 170 | 240 / 300 | 36 | 24 | 55 | None |
| Renard / Southmere | 110 | 450 / 520 | 48 | 72 | 60 | Self only after Ailing declaration |
| Oswin / Abbeylands | 85 | 210 / 260 | 42 | 16 | 50 | None |
| Mara / Westmarch | 65 | 430 / 500 | 34 | 12 | 40 | None |

Baseline private opening preferences before package variation:

- Edric: Unaligned; dislikes Renard.
- Ysabel: Leaning Renard.
- Oswin: Leaning Renard.
- Mara: Unaligned; strongly anti-Renard.

No public Pledge exists while Stable.

## 2. Territory values

| Territory | Wealth | Levy cap | Starting levies | Fortification | Trait |
|---|---:|---:|---:|---:|---|
| Greyfen | 2 | 420 | 360 | 1 | Fen Roads |
| Northkeep | 2 | 720 | 620 | 3 | Iron Hills |
| Westmarch | 2 | 500 | 430 | 1 | Free Companies |
| Eastvale | 5 | 300 | 240 | 1 | Golden Vale |
| Abbeylands | 3 | 260 | 210 | 2 | Holy Seat |
| Southmere | 4 | 520 | 450 | 2 | Old Blood |
| Capital | 4 | n/a | phase garrison | 3 | Seat of the Crown |

Eastvale's trait adds +1 daily Gold while legally and physically controlled, so Ysabel normally receives 6 Gold/day.

The Capital produces 1 Gold/day for an occupier because the administration is disrupted.

## 3. Clock and death distribution

- 1 day = 60 real seconds at 1×.
- Death is impossible before elapsed Day 49.
- The run seed selects one death dawn using this distribution:

| Elapsed day | Live minutes at 1× | Probability |
|---:|---:|---:|
| 49 | 49 | 5% |
| 50 | 50 | 8% |
| 51 | 51 | 12% |
| 52 | 52 | 16% |
| 53 | 53 | 19% |
| 54 | 54 | 18% |
| 55 | 55 | 13% |
| 56 | 56 | 9% |

The draw is made and stored at run start.

Physician reports are calendar-based rather than accurate countdowns:

- elapsed Day 42: “perhaps a fortnight”;
- elapsed Day 49: “unlikely to survive the week”;
- elapsed Day 53: “days, perhaps fewer”;
- elapsed Day 55 if alive: “any hour.”

## 4. Passive economy

### Gold

Daily income:

`heldTerritoryWealth + trait modifiers`, multiplied by conditions.

- Occupier: 25% of normal territory Wealth, fractions retained internally.
- Tax Strain: ×0.50.
- Unrest: ×0.25.
- Greyfen Charter: ×0.75 for the remainder of the run.
- Church Immunities bargain: Raise Taxes proceeds ×0.80; passive income unchanged.

### Levies

Daily recovery:

`max(1, floor(levyCap × 0.005))`

Resulting normal recovery:

- Greyfen: 2/day
- Northkeep: 3/day
- Westmarch: 2/day
- Eastvale: 1/day
- Abbeylands: 1/day
- Southmere: 2/day

Modifiers:

- Tax Strain: ×0.50, round down but minimum 1 if recovery remains allowed.
- Greyfen Charter: ×0.75, round down but minimum 1.
- Unrest/occupation: zero.

### Influence

- +1 every second dawn.
- Maximum 100.
- No passive gain while the player has the public condition Disgraced from an unpaid debt or exposed oath-breaking event; the condition lasts seven days unless authored otherwise.

## 5. Relationship effects

| Action | Baseline relationship change |
|---|---:|
| 20 Gold gift | +4 |
| 40 Gold gift | +8 |
| 80 Gold gift | +12 |
| Second gift within 14 days | 50% of listed gain |
| Premature Request Declaration | -4 |
| Successful bargain fulfillment | +8 to +15, authored |
| Break agreement | -25 with partner |
| Public threat | -20 with target |
| Occupy target's seat | -40 with legal lord |
| Liberate target's seat | +20 with legal lord |
| Expose target's secret | -30 with target |
| Join target's defensive war | +12 |

Relationship-to-evaluation component:

`round(relationship / 5)`, clamped to -20…+20.

## 6. Candidate viability component

This is one capped input to a specific lord's support evaluation.

Start at 0 and apply public facts:

- voluntary Pledge: +5 each;
- voluntary Commitment: +8 each instead of +5;
- coerced Pledge: +2 for Ysabel, 0 for Edric/Mara, -2 for Oswin;
- Claim None: -8;
- Claim Dubious: -4;
- Claim Plausible: 0;
- Claim Strong: +3;
- Claim Excellent: +6;
- Claim Overwhelming: +8;
- Church Favorable: +3;
- Church Endorsed: +7;
- controls Capital: +5;
- major victory in last 10 days: +4;
- major defeat in last 10 days: -5;
- Dispossessed: -6;
- candidate has withdrawn: excluded.

Clamp total to -20…+20 before personality weighting.

Ysabel multiplies this component by 1.25 before the overall per-lord cap. Mara multiplies it by 0.60. Edric and Oswin use 1.00.

## 7. Support thresholds

- Will hear bargain: candidate evaluation ≥ 0.
- Leaning: best candidate evaluation ≥ 15 and margin over next candidate ≥ 8.
- Request Declaration available: Leaning, declared candidate, no refusal cooldown.
- Voluntary Pledge: Leaning + Proof + present collateral + no Red Line.
- Pledge break: authored automatic breaker or shock threshold plus alternative lead ≥10.

Pledge inertia:

- Ailing: 10
- Gravely Ill: 20
- Deathbed: 30

Refusal cooldown: 7 days.

## 8. Church case

Claim-band case strength:

| Claim band | Case strength |
|---|---:|
| None | 0 |
| Dubious | 1 |
| Plausible | 2 |
| Strong | 3 |
| Excellent | 4 |
| Overwhelming | 5 |

Additional modifiers:

- Oswin Pledged: +2
- Oswin Committed: +4 instead
- public Patronage: +1
- Renard's undiscredited royal-favorite presumption: +1
- defended Abbeylands: +1
- public funeral sponsorship: +1
- Usurper conduct from Capital seizure: -2
- Broke the King's Peace: -1
- Defied the King while Stable: -1 additional
- two or more coerced Pledges: cannot be Endorsed
- attack on Abbeylands: Condemned
- exposed unconfessed Forgery: Condemned

Derived stance when not explicitly Condemned:

- case 0–1: Skeptical
- case 2–3: Neutral
- case 4–5: Favorable
- case 6+: eligible for Endorsed

Only the highest qualifying case is Endorsed. Tie: higher Claim, then Oswin preference, then no endorsement.

Baseline at Ailing declaration:

- Renard: 4 Claim +1 Favorite = 5, Favorable.
- Player before projects: 1, Skeptical.

Player route examples:

- Research + Forge = Claim 47 / Strong = 3; Oswin Pledged +2; Patronage +1; total 6 → eligible for Endorsed.
- Forge only = Claim 35 / Plausible = 2; Oswin Committed +4; Patronage +1; total 7 → eligible, but Forgery exposure can collapse it.

## 9. Base actions

| Action | Duration | Gold | Influence | Core result |
|---|---:|---:|---:|---|
| Gift — small | 1d | 20 | 0 | +4 relationship |
| Gift — medium | 1d | 40 | 0 | +8 relationship |
| Gift — grand | 1d | 80 | 0 | +12 relationship |
| Offer Bargain | 2d | term-specific | 10 | create/advance agreement |
| Request Declaration | 2d / 1d Deathbed | 0 | 12 | Leaning → Pledged if gates pass |
| Threaten | 2d / 1d Deathbed | 0 | 12 | coercion or authored concession |
| Watch Court | 3d | 20 | 8 | guaranteed current intent/leaning/troops |
| Find Dirt | 5d | 30 | 12 | contested secret discovery |
| Research Lineage | 6d | 35 | 12 | +12 safe Claim, once |
| Forge Royal Descent | 8d | 50 | 25 | +25 Claim + Forgery Evidence, once |
| Expose Secret | 2d / 1d Deathbed | 0 | 10 | authored public consequences |
| Invade | 3d / 2d Deathbed | 10 + troops | 0 | battle/occupation |
| Raise Taxes | 1d | 0 | 0 | 14d income now + Tax Strain |
| Hold Court | 3d / 2d Deathbed | 60 | 0 | +8 Prestige, +10 Influence, relations |
| Patronize Church | 4d / 3d Deathbed | 50 | 0 | Patronage flag, Church/Oswin effects |
| Declare Candidacy | 1d | 0 | 20 | irreversible claimant state |

## 10. Bargain numbers

### Edric

#### Marshal's Baton

- reserve unique Marshal office;
- candidate must satisfy military Proof;
- no immediate Pledge from office alone;
- once Proof is satisfied, Request Declaration can succeed.

#### Border Aid

- lock 150 levies for 7 days;
- if Edric is attacked, troops participate;
- if player cancels/refuses after trigger: Red Line and agreement break;
- satisfying it creates voluntary Pledge if Edric is Leaning.

#### Joint Campaign

- player and Edric each commit at least 100 troops to the same defensive or offensive objective;
- victory upgrades an existing Pledge to Committed;
- defeat does not automatically break support unless the player withheld promised troops.

### Ysabel

#### Gold Escrow

- lock 80 Gold;
- counts as present collateral;
- Pledge still requires Viability Proof.

#### Chancellorship

- reserve unique Chancellor office;
- lock 40 Gold court budget;
- counts as partial collateral;
- needs one additional Viability Proof.

#### Protection

- lock 100 troops in Eastvale for 7 days;
- if Eastvale is attacked they defend;
- counts as collateral and Proof.

Commitment trigger: while Pledged, player either successfully defends Eastvale or has two other voluntary public supporters and Ysabel publicly transfers 40 of her Gold to the candidacy through a contextual event/Intent.

### Oswin

#### Abbey Endowment

- pay 60 Gold;
- complete Patronize Church either before or during the bargain;
- candidate must have Plausible Claim;
- enables Pledge.

#### Church Immunities

- Raise Taxes proceeds reduced 20% for rest of run;
- pay 30 Gold legal endowment;
- candidate must have Plausible Claim;
- enables Pledge.

Commitment trigger: Church Endorses candidate while Oswin is Pledged.

### Mara

#### Greyfen Charter

- passive Greyfen income ×0.75 for rest of run;
- Greyfen levy recovery ×0.75 for rest of run;
- -4 Edric relationship; -3 Oswin relationship;
- satisfies concrete-concession Proof.

#### Denounce Central Rule

- -15 Renard relationship;
- +4 Mara relationship;
- -3 Oswin relationship;
- future Capital seizure Church penalty worsens by 1;
- by itself creates Leaning, not Pledge.

#### Provincial Aid

- send 100 troops for five days or liberate Westmarch;
- enables Pledge if Mara is Leaning.

Commitment trigger: full Greyfen Charter plus a public anti-central action, or successful liberation of Westmarch while Pledged.

## 11. Coercion thresholds

Military coercion uses defensive effective power, including Fortification.

- Ysabel submits at attacker power ≥1.25× her defense if adjacent; occupation always qualifies.
- Mara submits at ≥1.50×; occupation qualifies, but her Pledge breaks immediately if occupation ends.
- Edric submits at ≥2.00×; occupation qualifies only if his available army is below 250.
- Oswin does not give a military Under Duress Pledge; military threat can force neutrality or withdrawal from another Pledge. A devastating secret can coerce his vote, but causes Church hostility toward the coercer.
- Renard follows the separate candidacy-withdrawal rule.

Public Threaten relationship penalty: -20 target, -5 with every cautious/pious observer, plus derived threat.

## 12. Spy checks

### Watch Court

Guaranteed. No detection roll.

### Find Dirt

`spyPower = 50 + floor(playerInfluence / 5) + relevant modifiers`

`defense = 50 + floor(targetInfluence / 5) + target modifiers`

Add a stored seeded factor from -15 to +15 to spyPower.

Outcomes:

- spyPower ≥ defense +10: discover one secret; not detected.
- spyPower ≥ defense: discover one secret; 25% stored detection chance.
- spyPower ≥ defense -10: no secret; reveal current Intent and one relationship reason; 50% stored detection chance.
- below defense -10: no useful result; detected.

Repeated Find Dirt against same target within 10 days adds +10 defense per repeat.

Fen Roads reduces Watch Court Gold cost by 5 against Westmarch, Capital/royal court and Abbeylands targets.

## 13. Claim consequences

- Research Lineage: +12 permanent safe Claim.
- Forge Royal Descent: +25 fabricated Claim.
- Forgotten Genealogy event: +4 or +6 safe Claim.
- Exposed Forgery: remove 20 fabricated Claim, -10 Prestige, Condemned until confession/reparation.
- Confess at Rumor event: lose 12 fabricated Claim, -5 Prestige, change Condemned to Skeptical after three days if no other impiety.
- Claim cannot fall below 0 or exceed 100.

## 14. Battle values

### Commander

- player, Ysabel, Renard, Oswin, Mara: 1.00
- Edric: 1.10

### Fortification

- level 0: ×1.00
- level 1: ×1.10
- level 2: ×1.20
- level 3: ×1.30

### Fortune

Uniform seeded factor from 0.92 to 1.08 per side.

### Garrison

- hereditary seat: 75 minimum;
- Capital: 200 minimum.

### Mercenary band

- 150 troops;
- 50 Gold / 7 days;
- renewal 20 Gold / 7 days;
- maximum two bands;
- Mara controlling Westmarch: initial contract 40 Gold.

### Capital

- Gravely Ill royal garrison: 450;
- Deathbed royal garrison: 300;
- minimum attacker commitment: 250;
- hold requirement after victory: 200.

## 15. Prestige changes

| Event | Prestige |
|---|---:|
| Declare with None Claim | -5 and Laughable Pretender |
| Declare with Dubious Claim | 0 |
| Declare with Plausible Claim | +3 |
| Declare with Strong+ Claim | +5 |
| Major battle victory | +8 |
| Minor battle victory | +4 |
| Losing major attack | -6 |
| Losing major defense | -4 |
| Yield seat | -5 |
| Occupy Capital | +8 |
| Lose Capital | -8 |
| Become dispossessed | -8 once |
| Hold Court first use | +8 |
| Break agreement | -8 |
| Unpaid loan default | -8 |
| Exposed Forgery | -10 |

Clamp Prestige to 0–100.

## 16. Threat calculation

Use exact values in `war-and-occupation.md`.

Worked example after player occupies Westmarch:

- one occupied seat: +10;
- Westmarch adjacent to Edric: +15 to Edric;
- if player army exceeds Edric threshold: +20;
- if it was player's second offensive war: +10;

Edric could therefore move from Concern to Serious Threat even while respecting the player's victory.

## 17. Council vote rules

- Six legal lords always retain votes.
- Four votes wins any ballot.
- Candidate self-votes.
- Valid Pledged/Committed support votes as recorded.
- Under Duress vote validates leverage at death.
- Eliminate lowest candidate until two remain.
- Final 3–3 tie-break: Church Endorsement → Capital control → more Commitments → exact Claim → Prestige → earlier declaration.

### Military Acclamation

Requires:

- Capital control;
- physical control of three non-Capital seats including home;
- 200 troops in Capital;
- declared candidacy.

Worked minimum territorial pattern:

- Greyfen held;
- Westmarch occupied with 75;
- Abbeylands occupied with 75;
- Capital occupied with 200.

This locks 350 troops before accounting for battle casualties, making mercenary support or exceptional conservation necessary.

## 18. Opening-package adjustments

### Fractured Court

- Renard↔Ysabel relationship -10 from baseline;
- Edric Prestige +5;
- Player↔Mara relationship +5.

### Border Crisis

- Edric starting levies -60;
- Mara starting levies -60;
- Edric↔Mara relationship -10;
- both first Intents weighted toward border response.

### Holy Anxiety

- Renard Church conduct -2 at Ailing, making baseline case 3 / Neutral;
- Oswin Gold +15;
- Oswin starting levies -30;
- Oswin's first Intent is legitimacy investigation.

### Favorite Ascendant

- Renard begins with Ysabel bargain progress and makes Request Declaration his first legal Ailing Intent;
- Ysabel Gold +20;
- one major Renard secret is guaranteed.

## 19. First-pass route budgets

These are feasibility checks, not scripted solutions.

### Coalition example

By elapsed Day 28, Greyfen has generated roughly 56 Gold before actions. Starting 70 gives ~126.

Possible costs:

- Mara Charter: persistent 25% economy/levy cost;
- Ysabel escrow: 80 locked Gold;
- two Declaration requests: 24 Influence;
- candidate declaration: 20 Influence.

The player cannot casually add Oswin's 80–110 Gold package without taxation, events or abandoning another route.

### Legitimacy example

- Research: 35 Gold / 12 Influence / 6 days;
- Forge: 50 Gold / 25 Influence / 8 days;
- Patronage: 50 Gold / 4 days;
- Oswin Endowment: 60 Gold or cheaper Immunities route;
- declaration and requests: 32+ Influence.

This route consumes substantial time and money and creates forgery risk.

### Military example

Minimum Acclamation lock:

- two hereditary occupation garrisons: 150;
- Capital garrison: 200;
- battle casualties: likely 80–200+;
- one or two mercenary bands: 50–100 Gold plus renewals.

The route is possible but should require at least two successful wars and a late Capital campaign.

## 20. Tuning invariants

Numbers may move, but preserve these relationships:

1. A future promise is cheaper than collateral and cannot Pledge by itself.
2. Securing three kingmakers by their preferred terms costs more than the player's starting stockpile.
3. Research + Forge + Patronage + Oswin support can reach endorsement without random event dependence.
4. One battle cannot normally satisfy Military Acclamation.
5. Two occupations plus Capital require more troops than the player's starting available levies after expected casualties.
6. A mercenary-assisted military route remains feasible.
7. Repeated taxes become worse before they become optimal spam.
8. A late declaration leaves insufficient time to create multiple new voluntary Pledges from scratch.
9. Renard starts favored but not mathematically crowned.
10. Every first-pass number must be visible in preview or explainable in result text.