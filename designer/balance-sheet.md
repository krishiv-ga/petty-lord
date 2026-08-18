# Final First-Pass Balance Contract

These are the canonical numbers for the first implementation. They may move after automated simulation or human playtesting, but no code should silently invent alternatives. Any change to a value in this file must be recorded in `paperplay/final-amendments.md`.

## 1. Starting state

| Lord | Gold | Levies / Capacity | Prestige | Claim | Influence | Stable-phase private position |
|---|---:|---:|---:|---:|---:|---|
| Player / Greyfen | 70 | 360 / 420 | 12 | 10 | 35 | Not a candidate |
| Edric / Northkeep | 55 | 620 / 720 | 55 | 18 | 35 | Unaligned; dislikes Renard |
| Ysabel / Eastvale | 170 | 240 / 300 | 36 | 24 | 55 | Leaning Renard |
| Renard / Southmere | 110 | 450 / 520 | 48 | 72 | 60 | Declares at Ailing |
| Oswin / Abbeylands | 85 | 210 / 260 | 42 | 16 | 50 | Leaning Renard |
| Mara / Westmarch | 65 | 430 / 500 | 34 | 12 | 40 | Unaligned; strongly anti-Renard |

No public succession Pledge exists during Stable.

## 2. Territory values

| Territory | Wealth | Levy capacity | Starting levies | Fortification | Trait |
|---|---:|---:|---:|---:|---|
| Greyfen | 2 | 420 | 360 | 1 | Fen Roads |
| Northkeep | 2 | 720 | 620 | 3 | Iron Hills |
| Westmarch | 2 | 500 | 430 | 1 | Free Companies |
| Eastvale | 5 | 300 | 240 | 1 | Golden Vale |
| Abbeylands | 3 | 260 | 210 | 2 | Holy Seat |
| Southmere | 4 | 520 | 450 | 2 | Old Blood |
| Capital | 4 | — | Phase garrison | 3 | Seat of the Crown |

Eastvale's trait adds +1 Gold per day while Ysabel legally and physically controls it. A Capital occupier receives only 1 Gold per day.

## 3. Clock and death distribution

- 1 day = 60 real seconds at 1×.
- Death cannot occur before elapsed Day 49.
- One dawn is selected and stored at run creation.

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

Physician reports are intentionally approximate:

- elapsed Day 42: “perhaps a fortnight”;
- elapsed Day 49: “unlikely to survive the week”;
- elapsed Day 53: “days, perhaps fewer”;
- elapsed Day 55 if alive: “any hour.”

## 4. Passive economy

### Gold

Daily income is legal Wealth plus trait modifiers, multiplied by current conditions.

- Occupier: 25% of normal Wealth.
- Tax Strain: ×0.50.
- Unrest: ×0.25.
- Greyfen Charter: Greyfen ×0.75 for the remainder of the run.
- Church Immunities: passive income unchanged; Raise Taxes proceeds ×0.80.

Gold uses a fractional accumulator. For example, occupying Wealth 2 produces 0.5 Gold per day and pays one whole Gold every second dawn.

### Levies

Daily levy recovery enters a fractional accumulator:

`levyCapacity × 0.005 × active modifiers`

Normal rates before rounding through the accumulator:

| Territory | Recovery/day |
|---|---:|
| Greyfen | 2.10 |
| Northkeep | 3.60 |
| Westmarch | 2.50 |
| Eastvale | 1.50 |
| Abbeylands | 1.30 |
| Southmere | 2.60 |

Modifiers:

- Tax Strain: ×0.50.
- Greyfen Charter: ×0.75.
- Unrest or occupation: 0.

There is no minimum one-troop recovery. Fractions accumulate until a whole levy becomes available.

### Influence

- +1 every dawn.
- Maximum 100.
- No passive gain while under an explicit Disgraced condition.
- Discrete political successes and Hold Court can add more.

## 5. Relationship changes

| Cause | Change |
|---|---:|
| 20 Gold Gift | +4 |
| 40 Gold Gift | +8 |
| 80 Gold Gift | +12 |
| Second Gift within 14 days | 50% listed gain |
| Premature Request Declaration | -4 |
| Request invalidated by external change | -2 |
| Successful bargain fulfillment | +8 to +15, authored |
| Break Agreement | -25 with partner |
| Public Threaten | -20 with target |
| Occupy target's seat | -40 with legal lord |
| Liberate target's seat | +20 with legal lord |
| Expose target's secret | -30 with target |
| Join target's defensive war | +12 |

Relationship contribution to candidate evaluation:

`round(relationship / 5)`, clamped to -20…+20.

## 6. Candidate viability component

This is one capped input to one lord's evaluation, not a victory score.

- Voluntary Pledge: +5 each.
- Voluntary Commitment: +8 each instead of +5.
- Coerced Pledge: +2 for Ysabel, 0 for Edric/Mara, -2 for Oswin.
- Claim None: -8.
- Claim Dubious: -4.
- Claim Plausible: 0.
- Claim Strong: +3.
- Claim Excellent: +6.
- Claim Overwhelming: +8.
- Church Favorable: +3.
- Church Endorsed: +7.
- Controls Capital: +5.
- Major victory in previous 10 days: +4.
- Major defeat in previous 10 days: -5.
- Dispossessed: -6.
- Withdrawn: candidate excluded.

Clamp to -20…+20 before personality weighting.

- Ysabel multiplies Viability by 1.25 before the cap.
- Mara multiplies it by 0.60.
- Edric and Oswin use 1.00.

## 7. Support thresholds and maturation

- Hear bargain: candidate evaluation ≥0.
- Leaning: best evaluation ≥15 and margin over next candidate ≥8.
- Request Declaration available: declared candidate, current Leaning, no refusal cooldown.
- Voluntary Pledge: Leaning + maturation + Proof + accepted present collateral + no Red Line.
- Pledge break: automatic authored breaker or shock threshold plus alternative lead ≥10.

Leaning maturation at Request resolution:

| Phase | Required continuous Leaning |
|---|---:|
| Ailing | 2 full days |
| Gravely Ill | 3 full days |
| Deathbed | 4 full days |

The current phase requirement applies. Earlier Leaning time counts. A Commitment-grade shared-risk event may waive maturation for that lord.

Pledge inertia:

- Ailing: 10.
- Gravely Ill: 20.
- Deathbed: 30.

Premature Request cooldown: 7 days.

## 8. Church case

| Claim band | Case strength |
|---|---:|
| None | 0 |
| Dubious | 1 |
| Plausible | 2 |
| Strong | 3 |
| Excellent | 4 |
| Overwhelming | 5 |

Other modifiers:

- Oswin Pledged: +2.
- Oswin Committed: +4 instead.
- If Simony exposed: Oswin Pledged +1 / Committed +2 instead.
- Patronage: +1.
- Renard's undiscredited favorite presumption: +1.
- Defended Abbeylands: +1.
- Funded royal funeral: +1.
- Usurper from Capital seizure: -2.
- Broke King's Peace: -1.
- Defied King while Stable: -1 additional.
- Two or more coerced Pledges: cannot be Endorsed.
- Attack on Abbeylands: Condemned.
- Unconfessed exposed Forgery: Condemned.

When not Condemned:

- case 0–1: Skeptical;
- 2–3: Neutral;
- 4–5: Favorable;
- 6+: eligible for Endorsed.

Highest qualifying case receives sole Endorsement. Tie: higher Claim, then Oswin preference, then no endorsement.

Baseline when Ailing begins:

- Renard: Excellent Claim 4 + Favorite 1 = 5 / Favorable.
- Player: Dubious Claim 1 / Skeptical.

## 9. Action values

| Action | Duration | Gold | Influence | Principal result |
|---|---:|---:|---:|---|
| Gift small | 1d | 20 | 0 | +4 relationship |
| Gift medium | 1d | 40 | 0 | +8 relationship |
| Gift grand | 1d | 80 | 0 | +12 relationship |
| Offer Bargain | 2d | At acceptance | 8 at start | Negotiate agreement |
| Request Declaration | 2d / 1d Deathbed | 0 | 8 | Leaning → Pledged if all gates pass |
| Threaten | 2d / 1d Deathbed | 0 | 12 | Coercion or authored concession |
| Watch Court | 3d | 20 | 8 | Guaranteed current intelligence |
| Find Dirt | 5d | 30 | 12 | Contested secret discovery |
| Research Lineage | 6d | 35 | 12 | +12 safe Claim, once |
| Forge Royal Descent | 8d | 50 | 25 | +25 Claim + Forgery Evidence, once |
| Expose Secret | 2d / 1d Deathbed | 0 | 10 | Authored public consequence |
| Invade | 3d / 2d Deathbed | 10 + troops | 0 | Battle/occupation |
| Raise Taxes | 1d | 0 | 0 | Advance income + Strain/Unrest |
| Hold Court | 3d / 2d Deathbed | 60 | 0 | +8 Prestige, +10 Influence, relations |
| Patronize Church | 4d / 3d Deathbed | 50 | 0 | Patronage and Church/Oswin effect |
| Declare Candidacy | 1d | 0 | 15 | Irreversible claimant state |
| Confess and Seek Penance | 3d | 40 | 10 | Repair fraud Condemnation; -5 Prestige |

Offer Bargain charges only 8 Influence at start. Collateral is applied only on acceptance at resolution.

## 10. Bargain values

### Edric

**Marshal's Baton**

- Reserve candidate's Marshal office.
- Must also satisfy military Proof.
- Office alone cannot Pledge.

**Border Aid**

- Lock 150 levies for 7 days.
- If Edric is attacked, they fight.
- Refusal after trigger is Red Line/breach.

**Joint Campaign**

- Both sides commit at least 100 troops to same objective.
- Victory upgrades an existing Pledge to Committed.

### Ysabel

**Gold Escrow**

- Lock 80 Gold.
- Still requires Viability Proof.

**Chancellorship**

- Reserve candidate's Chancellor.
- Lock 40 Gold as court budget.
- Still requires Viability Proof.

**Protection**

- Lock 100 troops in Eastvale for 7 days.
- Counts as collateral and Proof.

Commitment trigger: successful defense of Eastvale while Pledged, or two other voluntary public supporters followed by Ysabel's public 40-Gold financing Intent.

### Oswin

**Abbey Endowment**

- Pay 60 Gold on acceptance.
- Acceptance itself creates Patronage.
- Candidate must have Plausible Claim.

**Church Immunities**

- Future Raise Taxes proceeds ×0.80.
- Complete Patronize Church for 50 Gold.
- No additional cash charge.
- Candidate must have Plausible Claim.

Commitment trigger: Church Endorses candidate while Oswin is Pledged.

### Mara

**Greyfen Charter**

- Greyfen passive income ×0.75.
- Greyfen levy recovery ×0.75.
- -4 Edric relationship; -3 Oswin relationship.

**Denounce Central Rule**

- -15 Renard relationship.
- +4 Mara relationship.
- -3 Oswin relationship.
- Future Capital-seizure Church penalty worsens by 1.
- Creates/strengthens Leaning only.

**Provincial Aid**

- Lock 100 troops for 5 days or liberate Westmarch.
- Can enable Pledge.

Commitment trigger: full Charter plus a public anti-central act, or liberation of Westmarch while Pledged.

## 11. Coercion thresholds

Military coercion compares attacker effective power with target defensive effective power, including Fortification.

- Ysabel: ≥1.25× while adjacent; occupation always qualifies.
- Mara: ≥1.50×; occupation qualifies but support breaks when occupation ends.
- Edric: ≥2.00×; occupation qualifies only while his available army is below 250.
- Oswin: military threat can force neutrality/withdrawal, not an Under Duress Pledge. A devastating secret can coerce his vote, but makes the Church hostile to coercer.
- Renard: separate withdrawal rule.

Threat relationship effects:

- target -20;
- cautious/pious observers -5;
- normal derived threat.

A valid Commitment cannot be overwritten by ordinary coercion. A secret can power one successful blackmail agreement and then becomes spent for blackmail, though still exposable.

## 12. Spy checks

Values snapshot when Find Dirt begins.

`spyPower = 50 + floor(actorInfluence / 5) + modifiers`

`defense = 50 + floor(targetInfluence / 5) + modifiers`

Add stored seeded factor -15…+15 to spyPower.

- `spyPower ≥ defense + 10`: discover secret; no detection.
- `spyPower ≥ defense`: discover secret; base 25% stored detection chance.
- `spyPower ≥ defense - 10`: no secret; reveal Intent and one reason; base 50% detection chance.
- lower: no useful result; detected.

Repeated Find Dirt on same target within 10 days:

- does not increase defense;
- adds +20 percentage points detection per repeat, capped at 100%;
- uses a stored detection draw created with the Order.

Fen Roads reduces Watch Court Gold by 5 against adjacent courts.

## 13. Claim consequences

- Research Lineage: +12 safe Claim.
- Forge Royal Descent: +25 fabricated Claim.
- Forgotten Genealogy: +4 or +6 safe Claim.
- Exposed Forgery: remove 20 fabricated Claim, -10 Prestige, Condemned, support shocks.
- Rumor-event confession: remove 12 fabricated Claim, -5 Prestige, penitent repair after 3 days.
- Post-exposure Penance: 40 Gold, 10 Influence, 3 days, -5 Prestige; removes fraud Condemnation to at most Skeptical; no Claim restoration.
- Clamp Claim 0–100.

## 14. Canonical secret consequences

Every secret is discoverable, exposable once and usable for one successful blackmail agreement.

### Renard — Questioned Paternity

- Claim -20.
- Prestige -5.
- Remove Royal Favorite presumption.
- Church conduct -1 and recalculate stance.
- Oswin Pledge shock 15 if backing Renard.
- Ysabel Pledge shock 8 if backing Renard.

### Renard — Foreign Concession

- Prestige -8.
- Remove Royal Favorite presumption.
- Edric relationship toward Renard -25.
- Mara relationship toward Renard -15.
- Edric Pledge shock 20 if backing Renard.
- Renard gains public flag Compromised Sovereignty.

### Renard — Bought Royal Testament

- Claim -15.
- Prestige -8.
- Remove Royal Favorite presumption.
- Church conduct -1.
- All voluntary Renard Pledges take 10 shock; Oswin takes 15.

Exactly one of these three exists every run.

### Edric — Border Massacre

- Prestige -8.
- If Edric is candidate, Church case -2.
- Mara relationship toward Edric -25.
- Oswin relationship toward Edric -15.
- Voluntary Pledges to candidate Edric take 10 shock.

### Ysabel — Royal Tax Embezzlement

- Lose up to 40 current Gold.
- Prestige -8.
- Renard relationship toward Ysabel -20.
- Any Opportunistic Pledge held by Ysabel takes 10 shock because her leverage and safety collapse.
- Counts as devastating financial blackmail.

### Oswin — Simony

- Prestige -10.
- His Church influence becomes +1 when Pledged and +2 when Committed for the remainder of the run.
- Church stance recalculates immediately.
- Relationship with every pious/legitimacy-minded lord -10.

### Mara — Smuggler Compact

- Prestige -6.
- Lose up to 30 current Gold to confiscation.
- Oswin relationship toward Mara -15.
- Free Companies discount is disabled for 7 days.
- Counts as devastating blackmail because exposure threatens the network.

### Player — Forgery Evidence

Uses the Claim consequences in Section 13 and activates Oswin's fraud Red Line until repaired.

## 15. Battle values

Commander:

- ordinary: ×1.00;
- Edric: ×1.10.

Fortification:

- level 0 ×1.00;
- level 1 ×1.10;
- level 2 ×1.20;
- level 3 ×1.30.

Fortune: stored uniform factor 0.92–1.08 per side.

Garrison:

- hereditary seat: 75;
- Capital: 200.

Mercenary band:

- 150 troops;
- 50 Gold / 7 days;
- renewal 20 Gold / 7 days;
- max two bands;
- Mara controlling Westmarch pays 40 initial Gold.

Capital:

- Gravely royal garrison 450;
- Deathbed royal garrison 300;
- minimum attack 250;
- hold after victory 200;
- victory with fewer than 200 survivors makes Capital Uncontrolled.

AI Yield:

- attacker known effective power at least 1.75× defender;
- no allied relief;
- personality may raise, never lower, threshold.

## 16. Prestige values

| Cause | Prestige |
|---|---:|
| Declare with None Claim | -5 + Laughable Pretender |
| Declare with Dubious Claim | 0 |
| Declare with Plausible Claim | +3 |
| Declare with Strong+ Claim | +5 |
| Major battle victory | +8 |
| Minor battle victory | +4 |
| Lose major attack | -6 |
| Lose major defense | -4 |
| Yield seat | -5 |
| Occupy Capital | +8 |
| Lose Capital | -8 |
| Become dispossessed | -8 once |
| First Hold Court | +8 |
| Break Agreement | -8 |
| Loan default | -8 |
| Exposed Forgery | -10 |
| Penance | -5 |

Clamp 0–100.

## 17. Threat calculation

Per observer:

- +20 if candidate's available military >1.25× observer defense.
- +15 if candidate occupies adjacent seat.
- +10 per occupied hereditary seat.
- +15 Capital control.
- +10 at least two public Pledges/Commitments.
- +10 after second offensive war.
- +10 per coerced Pledge.
- -10 if observer voluntarily Committed.

Bands: Low <20; Concern 20–39; Serious 40–59; Existential 60+.

## 18. Council and acclamation

- Six legal lords retain votes.
- Four votes wins any ballot.
- Candidate votes self.
- Valid Pledges/Commitments bind vote.
- Under Duress revalidates leverage at death.
- Lowest candidate eliminated until two remain.
- Sole eligible candidate receives required 6–0 acclamation.
- Final 3–3: Church Endorsement → Capital control → more Commitments → exact Claim → Prestige → earlier declaration.

Military Acclamation requires:

- declared candidacy;
- Capital control;
- physical control of three non-Capital seats;
- 200 troops in Capital.

Minimum physical example: Greyfen + Westmarch occupation 75 + Abbeylands occupation 75 + Capital 200. The route locks at least 350 troops before casualties.

## 19. Opening packages

### Fractured Court

- Renard–Ysabel -10 from baseline.
- Edric Prestige +5.
- Player–Mara +5.

### Border Crisis

- Edric levies -60.
- Mara levies -60.
- Edric–Mara -10 further.
- First Intents border-weighted.

### Holy Anxiety

- Renard Church conduct -2 at Ailing, baseline case 3 / Neutral.
- Oswin Gold +15.
- Oswin levies -30.
- First Intent legitimacy investigation.

### Favorite Ascendant

- Renard begins with Ysabel bargain progress and first Ailing Request.
- Ysabel Gold +20.
- One Renard vulnerability still guaranteed.

## 20. Route feasibility budgets

### Coalition

Three kingmakers require at minimum:

- Declaration 15 Influence.
- Three bargains 24 Influence.
- Three Requests 24 Influence.
- Total 63 Influence before other political actions.

The player starts 35 and gains one daily, so the route is feasible but consumes most political capacity. Collateral such as Charter, 150 troops and 40–80 Gold is additional.

### Legitimacy

- Research 35 Gold / 12 Influence / 6 days.
- Forge 50 Gold / 25 Influence / 8 days.
- Declaration 15 Influence.
- Patronize 50 Gold or Endowment 60 Gold.
- Oswin bargain/request 16 Influence.

This is fundable through time and taxation but leaves little flexibility and creates Forgery risk.

### Military

Minimum Acclamation locks:

- two hereditary garrisons 150;
- Capital garrison 200;
- expected casualties 80–200+;
- one or two mercenary bands 50–100 Gold plus renewals.

It requires several successful campaigns and active contract management.

## 21. Tuning invariants

Preserve these relationships even when values move:

1. Future promises are cheaper than collateral and never Pledge alone.
2. Three preferred kingmaker packages cost more than the starting stockpile.
3. Research + Forge + one viable Oswin route can reach Endorsement without event dependence.
4. One battle cannot normally satisfy Military Acclamation.
5. Two occupations plus Capital require more troops than the player's starting available levies after expected casualties.
6. Mercenary-assisted conquest remains possible.
7. Repeated taxes worsen before becoming optimal spam.
8. A late declaration cannot mature multiple new voluntary Pledges from scratch before every possible death date.
9. Renard starts favored but not automatically crowned.
10. Every decisive number is visible in preview or reconstructible in the ending.