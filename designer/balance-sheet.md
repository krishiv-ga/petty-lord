# Final First-Pass Balance Contract

These are the canonical first implementation values. Change them only after simulation or human testing and record every change in `paperplay/final-amendments.md`.

## 1. Starting state

| Lord | Gold | Levies / Cap | Prestige | Claim | Influence | Stable private position |
|---|---:|---:|---:|---:|---:|---|
| Player / Greyfen | 70 | 360 / 420 | 12 | 10 | 35 | Not candidate |
| Edric / Northkeep | 55 | 620 / 720 | 55 | 18 | 35 | Unaligned; dislikes Renard |
| Ysabel / Eastvale | 170 | 240 / 300 | 36 | 24 | 55 | Leaning Renard |
| Renard / Southmere | 110 | 450 / 520 | 48 | 72 | 60 | Declares at Ailing |
| Oswin / Abbeylands | 85 | 210 / 260 | 42 | 16 | 50 | Leaning Renard |
| Mara / Westmarch | 65 | 430 / 500 | 34 | 12 | 40 | Unaligned; anti-Renard |

No public Pledge exists during Stable.

## 2. Territories

| Territory | Wealth | Levy cap | Starting levies | Fort | Trait |
|---|---:|---:|---:|---:|---|
| Greyfen | 2 | 420 | 360 | 1 | Fen Roads |
| Northkeep | 2 | 720 | 620 | 3 | Iron Hills |
| Westmarch | 2 | 500 | 430 | 1 | Free Companies |
| Eastvale | 5 | 300 | 240 | 1 | Golden Vale |
| Abbeylands | 3 | 260 | 210 | 2 | Holy Seat |
| Southmere | 4 | 520 | 450 | 2 | Old Blood |
| Capital | 4 | — | phase garrison | 3 | Seat of Crown |

Eastvale trait: +1 Gold/day for Ysabel while legal and physical controller. Capital occupier receives 1 Gold/day.

## 3. Clock and death

1 day = 60 real seconds at 1×. Death dawn is stored at run creation.

| Elapsed day | Probability |
|---:|---:|
| 49 | 5% |
| 50 | 8% |
| 51 | 12% |
| 52 | 16% |
| 53 | 19% |
| 54 | 18% |
| 55 | 13% |
| 56 | 9% |

Reports: Day42 “perhaps a fortnight”; Day49 “unlikely to survive week”; Day53 “days”; Day55 “any hour,” only if alive.

## 4. Economy

### Gold

Daily legal income = Wealth + trait, multiplied by conditions.

- occupation income ×0.25;
- Tax Strain ×0.50;
- Unrest ×0.25;
- Greyfen Charter ×0.75 remainder;
- Provincial Liberties event ×0.90 remainder, multiplicative with Charter if both occur;
- Defaulted Debtor Greyfen ×0.50 remainder;
- Church Immunities changes Raise Taxes only: proceeds ×0.80.

Use fractional accumulator.

### Levies

Daily recovery accumulator:

`capacity × 0.005 × modifiers`

| Territory | Base/day |
|---|---:|
| Greyfen | 2.10 |
| Northkeep | 3.60 |
| Westmarch | 2.50 |
| Eastvale | 1.50 |
| Abbeylands | 1.30 |
| Southmere | 2.60 |

Tax Strain ×0.50; Charter ×0.75; Unrest/occupation 0. No minimum daily troop.

### Influence

+1 each dawn, maximum100, blocked only by explicit Disgraced condition.

## 5. Relationship values

| Cause | Change |
|---|---:|
| Gift20 / 40 / 80 | +4 / +8 / +12 |
| Second Gift within14d | half |
| Premature Request | -4 |
| Request invalidated externally | -2 |
| Break Agreement | -25 partner |
| Public Threaten | -20 target |
| Occupy seat | -40 legal lord |
| Liberate seat | +20 legal lord |
| Expose secret | -30 target |
| Join defensive war | +12 |
| First Hold Court invitee | +6 |
| Diminished second Court invitee | +3 |
| First Patronize Church | +8 Oswin |
| Later valid Patronage repetition | +3 Oswin |
| Abbey Endowment | +8 Oswin unless first Patronage already granted; never stacks twice |

Relationship component = `round(value / 5)`, clamp -20…+20.

## 6. Viability component

- voluntary Pledge +5;
- voluntary Commitment +8 instead;
- coerced Pledge +2 Ysabel / 0 Edric,Mara / -2 Oswin;
- Claim None -8, Dubious -4, Plausible0, Strong+3, Excellent+6, Overwhelming+8;
- Church Favorable +3, Endorsed +7;
- Capital +5;
- major victory last10d +4;
- major defeat last10d -5;
- Dispossessed -6;
- withdrawn excluded.

Clamp -20…+20. Ysabel ×1.25 before cap; Mara ×0.60; Edric/Oswin ×1.00.

All other exact evaluation is in `candidate-evaluation.md`.

## 7. Support thresholds

- hear bargain: evaluation≥0;
- Leaning: best≥15 and margin≥8;
- retain Leaning: best≥10 and margin≥4;
- voluntary Pledge: declared + Leaning + maturation + Proof + accepted collateral + no Red Line.

Maturation: Ailing2d, Gravely3d, Deathbed4d. Reset when candidate changes or lord becomes Unaligned.

Inertia: Ailing10, Gravely20, Deathbed30.

Numeric shock entries expire after10 full days. Automatic breakers, active Red Lines, breached agreements and persistent conditions remain.

Premature Request cooldown7d.

## 8. Church case

Claim case: None0, Dubious1, Plausible2, Strong3, Excellent4, Overwhelming5.

- Oswin Pledged +2 / Committed +4;
- after Simony +1 / +2;
- Patronage +1;
- Renard undiscredited Favorite +1;
- defended Abbeylands +1;
- funeral +1;
- Usurper -2;
- Broke Peace -1;
- Stable defiance additional -1;
- two publicly known coerced Pledges block Endorsement;
- Abbeylands attack or unconfessed Forgery = Condemned.

Case0–1 Skeptical,2–3 Neutral,4–5 Favorable,6+ eligible. Highest qualifying wins; tie Claim, then Oswin, then no endorsement.

## 9. Actions

| Action | Duration | Gold | Influence |
|---|---:|---:|---:|
| Gift | 1d | 20/40/80 | 0 |
| Offer Bargain | 2d | collateral on acceptance | 8 start |
| Request Declaration | 2d / 1d Deathbed | 0 | 8 |
| Threaten | 2d / 1d Deathbed | 0 | 12 |
| Watch Court | 3d | 20 | 8 |
| Find Dirt | 5d | 30 | 12 |
| Research Lineage | 6d | 35 | 12 |
| Forge Royal Descent | 8d | 50 | 25 |
| Expose Secret | 2d / 1d Deathbed | 0 | 10 |
| Invade | 3d / 2d Deathbed | 10 + troops | 0 |
| Raise Taxes | 1d | 0 | 0 |
| Hold Court | 3d / 2d Deathbed | 60 | 0 |
| Patronize Church | 4d / 3d Deathbed | 50 | 0 |
| Declare | 1d | 0 | 15 |
| Confess/Penance | 3d | 40 | 10 |

Hold Court: +8 Prestige,+10 Influence. Second within21d halves both; third locked. Penance also -5 Prestige.

## 10. Bargains

### Edric

- Marshal: reserve office + military Proof.
- Border Aid: lock150 levies7d.
- Joint Campaign: both commit100+; victory can Commit.

### Ysabel

- Escrow80; with Access Debt100.
- Chancellorship budget40; with Access Debt60.
- Protection100 troops7d; with Access Debt150.

Access Debt is consumed on accepted bargain.

### Oswin

- Abbey Endowment60; creates Patronage and +8 relationship unless already granted.
- Church Immunities: Raise Taxes×0.80 + Patronize Church50; no extra cash.

### Mara

- Charter: Greyfen income/recovery×0.75; Edric -4, Oswin -3.
- Denounce: Renard -15, Mara +4, Oswin -3, future Capital Church penalty -1 extra; Leaning only.
- Provincial Aid: lock100 troops5d or liberate.

## 11. Coercion

Thresholds after Fortification:

- Ysabel1.25× or occupation;
- Mara1.50× or occupation;
- Edric2.00×, occupation only if army<250;
- Oswin no military Pledge; secret can coerce vote;
- Renard separate withdrawal.

Military/occupation coercion is public Under Duress and known to Church/rivals. Secret blackmail is private; only informed actors react. One secret yields one successful blackmail use. Exposure removes that leverage and releases the coerced support unless another basis exists.

Threat: target -20; cautious/pious observers -5 if public.

## 12. Spy

At Order start snapshot:

`spyPower = 50 + floor(actorInfluence/5) + modifiers + seeded(-15…15)`

`defense = 50 + floor(targetInfluence/5) + modifiers`

- ≥defense+10: secret, no detection;
- ≥defense: secret,25% detection;
- ≥defense-10: partial intel,50% detection;
- lower: no useful intel, detected.

Repeated Find Dirt within10d adds +20 percentage points detection each, cap100; no defense increase.

## 13. Claim/fraud

Research +12 safe. Forge +25 fabricated. Genealogy event +4/+6 safe.

Forgery exposure: remove20 fabricated, -10 Prestige, Condemned, shocks. Rumor confession removes12 and -5 Prestige. Post-exposure Penance costs40 Gold/10 Influence/3d/-5 Prestige, removes fraud Condemnation to at most Skeptical, restores no Claim.

## 14. Secrets

Every secret can be exposed once and used for one blackmail.

### Renard: one guaranteed

**Questioned Paternity:** Claim -20, Prestige -5, remove Favorite, Church conduct -1, Oswin shock15, Ysabel shock8.

**Foreign Concession:** Prestige -8, remove Favorite, Edric relation -25, Mara -15, Edric shock20, Compromised Sovereignty.

**Bought Royal Testament:** Claim -15, Prestige -8, remove Favorite, Church conduct -1, all voluntary Renard Pledges shock10, Oswin15.

### Others

**Edric Border Massacre:** Prestige -8, candidate Church case -2, Mara relation -25, Oswin -15, Edric-candidate Pledges shock10.

**Ysabel Tax Embezzlement:** lose up to40 Gold, Prestige -8, Renard relation -20, her Opportunistic Pledge shock10.

**Oswin Simony:** Prestige -10, Church influence reduced to+1/+2, pious relationships -10, immediate recalc.

**Mara Smuggler Compact:** Prestige -6, lose up to30 Gold, Oswin relation -15, mercenary discount disabled7d.

**Player Forgery:** as Section13.

## 15. Battle

Commander ordinary1.00, Edric1.10. Fort levels0/1/2/3 =1.00/1.10/1.20/1.30. Fortune stored0.92–1.08.

Garrisons: hereditary75, Capital200.

Mercenary:150 troops,50 Gold/7d, renewal20, max2; Mara holding Westmarch40 initial.

Capital royal garrison450 Gravely/300 Deathbed; minimum attack250. Victory with <200 survivors makes Capital Uncontrolled.

AI Yield uses observer-known expected power excluding fortune and requires≥1.75× with no relief.

## 16. Prestige

- Declare None -5/Laughable;
- Plausible +3; Strong+ +5;
- major victory +8;
- minor +4;
- lose attack -6;
- lose defense -4;
- yield -5;
- Capital +8/-8;
- dispossessed -8 once;
- Court +8;
- break agreement -8;
- loan default -12;
- Forgery -10;
- Penance -5.

Clamp0–100.

## 17. Threat

Each observer uses their knowledge estimate:

- fresh exact/direct observation exact;
- public midpoint Broken75, Modest225, Strong400, Formidable600 unless visible minimum higher;
- stale exact blended halfway toward current midpoint;
- own defense exact;
- no prebattle fortune.

Then:

- +20 if estimate >1.25× own defense;
- +15 adjacent occupation;
- +10 per occupied seat;
- +15 Capital;
- +10 two public supporters;
- +10 second offensive war;
- +10 per publicly known coerced Pledge;
- -10 if voluntarily Committed.

Bands Low<20, Concern20–39, Serious40–59, Existential60+.

## 18. Council

Six legal votes; four wins. Candidate self-votes. Valid Pledge/Commitment binds; coercion revalidates. Eliminate lowest until two. Sole candidate gets6–0.

Final3–3: Church → Capital → Commitments → exact Claim → Prestige → earlier declaration.

If player is eliminated or never declared and more than one candidate remains, mandatory Cast Greyfen's Vote. It can decide historical winner but player still loses.

Military Acclamation: declared + Capital + three non-Capital seats +200 Capital troops.

## 19. Opening packages

- Fractured: Renard–Ysabel -10, Edric Prestige+5, Player–Mara+5.
- Border: Edric/Mara levies -60, relation -10, border Intents.
- Holy: Renard Church conduct -2, Oswin Gold+15/levies-30, legitimacy Intent.
- Favorite: Renard–Ysabel bargain progress, Ysabel Gold+20, Renard vulnerability still guaranteed.

## 20. Event exact values

- Raiders casualties: stored uniform integer0–20.
- Ignored unpaid Guard:50%0,25%-25,25%-50 at Deathbed.
- Hawk Tournament:50% high result,50% low.
- Rumor blame:50% success; failure -5 Prestige and +20 discovery points.
- Funeral troops:25 Capital-only for3d; expire absolutely and can collapse garrison.
- Mara avoidance: next bargain +10 Influence.

### Merchant Loan

Eligibility Stable/Ailing, elapsed≤27, Gold<80, Ysabel not Hostile.

Borrow +80, mandatory decision14d later:

- repay105 if available;
- default: spendable Gold→0, Prestige -12, Ysabel -25, Greyfen income×0.50 remainder, Defaulted Debtor, Ysabel one Debt Leverage use.

Political Access alternative: +45 Gold and exact Ysabel Access Debt modifiers in Section10.

## 21. Route budgets

Coalition minimum political cost: Declare15 + three bargains24 + three Requests24 =63 Influence, plus collateral.

Legitimacy: Research35g/12i, Forge50g/25i, Declare15i, Patronage50g or Endowment60g, Oswin bargain/request16i.

Military minimum lock: two seats150 + Capital200 + casualties80–200+ + mercenaries50–100 and renewals.

## 22. Tuning invariants

1. Future promise never Pledges alone.
2. Three kingmakers cost more than starting stockpile.
3. Claim + viable Oswin route can Endorse without event luck.
4. One battle cannot normally Acclaim.
5. Two occupations + Capital exceed starting levies after casualties.
6. Mercenary conquest remains possible.
7. Repeated taxes worsen.
8. Late declaration cannot mature several fresh voluntary Pledges before every death date.
9. Renard favored, not automatic.
10. Every decisive number is previewed or reconstructible.