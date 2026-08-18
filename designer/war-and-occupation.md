# War, Royal Authority and Occupation

## 1. Design purpose

War is a political instrument. Every campaign changes troops, Gold, Prestige, physical control, adjacency, support viability, threat and lawful/Church judgment.

There is no tactical battlefield, free army-piece movement, siege minigame, annexation or title inheritance.

## 2. Royal Authority

### Stable

Offensive war requires **Defy the King's Peace**:

- +15 Influence beyond campaign cost;
- -10 Prestige;
- -1 Church conduct;
- -8 relationship with every non-belligerent lawful lord, except Mara -2;
- Royally Sanctioned history;
- +150 royal troops to defender.

Capital unavailable.

### Ailing

Offensive war:

- -5 Prestige;
- Broke the King's Peace history;
- normal threat;
- no royal reinforcement.

Capital unavailable.

### Gravely Ill

- no flat King's-Peace Prestige penalty;
- normal threat/relationship consequences;
- declared claimants may attack Capital;
- royal Capital garrison 450.

### Deathbed

- newly started campaigns take one fewer day;
- royal Capital garrison 300;
- AI prioritizes Capital and immediate defense.

### Abbeylands

Unjustified attack on Abbeylands always creates severe Church penalty/possible Condemnation. Defensive liberation is exempt from the special lawful penalty, not from casualties or hostility.

## 3. Military availability

Track separately:

- home levies available;
- troops committed to Orders;
- allied-aid locks;
- occupation garrisons;
- active mercenaries;
- mercenary garrisons;
- permanent casualties.

A campaign requires an operational base:

- own unoccupied seat;
- territory physically occupied by attacker;
- unoccupied seat of Pledged/Committed ally granting basing rights.

Dispossessed lord without a base can use diplomacy/intrigue but cannot campaign.

## 4. Campaign sequence

### Start

Choose:

- adjacent target;
- levy commitment in increments of 25;
- zero to two mercenary bands;
- occupation or liberation goal.

Preview known defense range, Fortification, garrison requirement, Royal Authority consequences and threatened neighbors.

Pay 10 Gold logistics and lock troops.

### Visibility

Campaign becomes public after 12 hours of mustering. Fresh Watch Court may reveal immediately.

### Defender reaction

Defender may:

- defend with available levies;
- add eligible mercenaries;
- call already-promised allied troops;
- yield;
- abandon a hostile occupation.

Reaction uses no Order slot.

### Yield

Player may yield voluntarily at any ratio.

AI may yield only if:

- known attacker effective power is at least 1.75× defender effective power;
- no allied relief is available;
- no personality rule raises the threshold.

Edric's courage may raise the threshold; no AI trait may lower it below 1.75.

A yielding army becomes a mobile dispossessed retinue. It remains intact but cannot campaign until granted allied basing rights. It may defend an ally only when an agreement explicitly permits.

### Resolution

Normal duration 3 days; Deathbed 2. Duration fixes at creation. Battle resolves at completion using stored fortune.

## 5. Effective power

`baseForce = levies + mercenaries + eligible allied troops`

`effectivePower = baseForce × commander × terrain × fortification × fortune`

### Commander

- ordinary lord/player: 1.00
- Edric: 1.10
- explicit event modifier: 0.90–1.10

### Terrain

Only explicit traits. Northkeep gives Edric defenders +10%.

### Fortification

Defender:

`1 + 0.10 × Fortification`

Unrest reduces Fortification by one, minimum zero.

### Fortune

Stored seeded factor 0.92–1.08 per side, drawn at campaign creation and shown qualitatively after battle.

### Victory

Higher effective power wins; exact tie favors defender.

## 6. Casualties

`ratio = winnerPower / loserPower`

Loser rate:

`clamp(0.28 + 0.08 × (ratio - 1), 0.28, 0.45)`

Winner rate:

`clamp(0.18 - 0.04 × (ratio - 1), 0.08, 0.18)`

Round whole casualties and distribute proportionally among levies, mercenaries and allied contingents.

- levy losses persist;
- mercenary survivors remain only while contracted;
- allied casualties belong to ally and can trigger support/bargain effects.

Major battle: at least 250 total troops or a hereditary seat changes physical control.

## 7. Prestige

- major victory: winner +8;
- losing major attacker -6;
- losing major defender -4;
- minor victory +4, loser -2;
- yield: attacker +3, defender -5;
- Capital victory +8;
- Capital loss -8.

## 8. Mercenaries

Standard band:

- 150 troops;
- 50 Gold for 7 days;
- max two active bands per lord;
- Westmarch legal controller pays 40 while physically controlling Westmarch;
- renewal 20 Gold for 7 days.

Survivors may fight again or garrison. One day before expiry, player receives renewal reaction. At expiry unpaid band leaves before King's-death check.

If departure drops hereditary garrison below 75 or Capital below 200, control ends immediately.

## 9. Hereditary occupation

Legal ownership never changes.

### Hold requirement

At least 75 surviving loyal/contracted troops assigned after victory. Without 75, attacker withdraws and legal lord retains physical control.

### Legal lord loses

- all seat income;
- levy recovery;
- special trait;
- -8 Prestige once;
- viability shock.

They retain title, vote, Claim, Gold, relationships, agreements and political agency.

### Occupier gains/costs

- 25% Wealth income through fractional accumulator;
- no levy recruitment;
- no legal trait;
- adjacency;
- resource denial;
- 75+ locked troops;
- full threat/hostility.

### End

Liberation victory, voluntary withdrawal, garrison below75 or authored restoration.

## 10. Threat

Derived per observer from public facts:

- +20 if candidate available military >1.25× observer defense;
- +15 if candidate occupies adjacent seat;
- +10 per occupied hereditary seat;
- +15 Capital control;
- +10 at least two public Pledges/Commitments;
- +10 after second offensive war;
- +10 per coerced Pledge;
- -10 if observer voluntarily Committed.

Bands:

- <20 Low
- 20–39 Concern
- 40–59 Serious
- 60+ Existential

UI shows reasons, not number.

Responses:

- Edric respects Concern strength, resists Serious/Existential.
- Ysabel seeks protection/accommodation but defects if it vanishes.
- Oswin favors containment of unlawful aggression.
- Mara tolerates anti-Renard defiance but resists central conquest.
- Renard targets any declared claimant reaching Serious threat or credible political viability.

## 11. Capital

### Attack gates

- declared claimant;
- Gravely Ill or Deathbed;
- adjacent physical base;
- at least 250 troops committed.

### Royal defense

- Gravely: 450;
- Deathbed: 300;
- Fortification3.

If occupied, current garrison defends and may be reinforced as reaction.

### Successful occupation

Requires at least 200 surviving troops assigned.

Effects:

- +8 Prestige;
- Usurper conduct;
- Church case -2;
- +15 threat;
- 1 Gold/day;
- constitutional Capital tie-break;
- potential Military Acclamation.

### Pyrrhic Capital victory

If attacker wins but cannot assign 200:

- Capital becomes **Uncontrolled**;
- royal/current garrison is destroyed;
- nobody receives income, tie-break or Acclamation credit;
- victor receives battle Prestige only, not Capital-control/Usurper effects;
- later declared claimant may complete a one-day March and assign 200 without another battle.

### Loss

Prior claimant controller loses 8 Prestige, takes 12 Pledge shock and immediately loses constitutional benefits.

## 12. Simultaneous Capital campaigns

Scheduler sequenceId determines first resolution. Later campaign revalidates against new controller or Uncontrolled state. If target fundamentally changes, later attacker receives documented withdrawal reaction where applicable.

## 13. Invalidation

### Liberation target already restored

End early; troops return after one travel day; logistics lost; no Prestige.

### Occupier changes

Continue against new hostile controller if still legal/adjacent; attacker may withdraw.

### Attacker loses all bases

Cancel before battle; troops return as retinue after two days; logistics lost.

### Defender has no force

Defender may yield; attacker still needs garrison.

Committed troops are locked at Order start. If QA finds same troops double-committed, later sequenceId Order cancels and logs validation failure.

## 14. Defensive causes

Defensive/liberation when:

- reclaiming own seat;
- helping Pledged/Committed ally reclaim under active agreement;
- responding within14 days to a lord who attacked actor.

Avoid King's-Peace penalty and reduce threat by10. All other effects remain.

## 15. Dispossessed player

Retains two Orders and can negotiate, spy, expose, request support, use existing resources, campaign from ally base and win Council.

Cannot receive Greyfen income/recovery, Raise Taxes or campaign without base.

A strategically hopeless state may remain a loss; the design guarantees no software softlock, not a guaranteed comeback.

## 16. Military-acclamation pressure

Military route is bounded by:

- persistent casualties;
- 75 troops per occupation;
- 200 Capital troops;
- mercenary contracts/renewals;
- negligible occupation income;
- threat/containment;
- requirement for Capital plus three non-Capital seats.

It is viable but cannot snowball through absorbed economies.