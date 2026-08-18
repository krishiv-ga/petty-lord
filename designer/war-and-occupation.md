# War, Royal Authority and Occupation

## 1. Design purpose

War is a political instrument. Every campaign changes troops, Gold, Prestige, physical control, adjacency, support viability, threat and lawful/Church judgment.

There is no tactical battlefield, free army movement, siege minigame, annexation or title inheritance.

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
- Broke King's Peace history;
- normal threat;
- no royal reinforcement.

Capital unavailable.

### Gravely Ill

- no flat King's-Peace Prestige penalty;
- normal threat/relationship consequences;
- declared claimants may attack Capital;
- royal Capital garrison450.

### Deathbed

- campaigns started now one day faster;
- royal Capital garrison300;
- AI prioritizes Capital and immediate defense.

### Abbeylands

Unjustified attack always creates extra Church penalty/possible Condemnation. Defensive liberation avoids special lawful penalty, not casualties or hostility.

## 3. Military availability

Track:

- available home levies;
- troops in Orders;
- allied-aid locks;
- occupation garrisons;
- active mercenaries;
- mercenary garrisons;
- permanent casualties;
- dispossessed retinues.

Campaign base:

- own unoccupied seat;
- occupied territory physically controlled;
- unoccupied Pledged/Committed ally seat with basing rights.

Dispossessed lord without base cannot campaign.

## 4. Military knowledge

No observer may use another lord's hidden exact army for threat, support or Yield prediction.

Per observer:

- fresh Spy or directly observed public campaign: exact known value;
- public band only: use midpoint — Broken75, Modest225, Strong400, Formidable600 unless a visible committed minimum is higher;
- stale exact intelligence: halfway between old exact value and current public-band midpoint;
- own defense: exact.

Battle fortune is never known before resolution and is excluded from AI Yield and threat estimates.

## 5. Campaign sequence

### Start

Choose adjacent target, levy commitment in25 increments, zero to two bands, and occupation/liberation goal.

Preview known defense range, Fortification, garrison, Royal Authority consequences and threatened observers.

Pay10 Gold logistics and lock troops.

### Visibility

Campaign public after12 hours. Fresh Watch Court may reveal immediately.

### Defender reaction

- defend;
- add eligible mercenaries;
- call promised allies;
- yield;
- abandon hostile occupation.

### Yield

Player may yield at any ratio.

AI may yield only when its **expected known** attacker power, excluding fortune, is at least1.75× expected defender power and no allied relief exists. Personality may raise but never lower threshold.

Yielding force becomes intact dispossessed retinue requiring allied base to campaign.

### Resolution

Normal3 days; Deathbed2. Duration fixed at creation. Battle uses stored fortune.

## 6. Effective power

`baseForce = levies + mercenaries + eligible allies`

`effectivePower = baseForce × commander × terrain × fortification × fortune`

Commander: ordinary1.00, Edric1.10, event0.90–1.10.

Terrain: only explicit traits; Northkeep gives Edric defenders +10%.

Fortification defender multiplier: `1 + 0.10 × level`; Unrest level -1 minimum0.

Fortune: stored seeded0.92–1.08 each side.

Higher wins; exact tie defender.

## 7. Casualties

`ratio = winnerPower / loserPower`

Loser: `clamp(0.28 + 0.08 × (ratio - 1), 0.28, 0.45)`

Winner: `clamp(0.18 - 0.04 × (ratio - 1), 0.08, 0.18)`

Round whole and distribute proportionally. Levy losses persist; mercenary survivors require contract; allied losses belong ally.

Major battle: at least250 total troops or seat changes control.

## 8. Prestige

- major victory +8;
- losing major attacker -6;
- losing major defender -4;
- minor victory +4 / loser -2;
- yield attacker +3 / defender -5;
- Capital victory +8;
- Capital loss -8.

## 9. Mercenaries

- band150;
- 50 Gold /7 days;
- max two;
- Mara physically holding Westmarch pays40;
- renewal20 /7 days.

Survivors may fight/garrison. Warn one day before expiry. At expiry unpaid band leaves before death check. Garrison below75/200 loses control.

Temporary Funeral Preparations troops expire at their stored timestamp under the same garrison-control rule.

## 10. Hereditary occupation

Legal ownership never changes.

### Hold

75 surviving loyal/contracted troops. Without, withdraw and legal lord retains physical control.

### Legal lord loses

Income, recovery, trait, -8 Prestige once and viability shock; retains title, vote, Claim, Gold, relationships, agreements and politics.

### Occupier

- 25% Wealth through fractional accumulator;
- no recruitment/trait;
- adjacency and denial;
- 75+ locked;
- full threat/hostility.

Ends by liberation, withdrawal, garrison below75 or agreement.

## 11. Threat

Threat is calculated separately by each observer using only their military knowledge from Section4 plus public state:

- +20 if observer estimates candidate available military >1.25× observer exact defense;
- +15 if candidate occupies adjacent seat;
- +10 per occupied hereditary seat;
- +15 Capital control;
- +10 at least two public Pledges/Commitments;
- +10 after second offensive war;
- +10 per **publicly known** coerced Pledge;
- -10 if observer voluntarily Committed.

Bands: Low<20, Concern20–39, Serious40–59, Existential60+.

UI shows reasons and source age, not number.

Responses:

- Edric respects Concern, resists Serious/Existential.
- Ysabel seeks protection/accommodation but defects if it vanishes.
- Oswin favors containment of unlawful aggression.
- Mara tolerates anti-Renard defiance but resists conquest.
- Renard targets Serious threat or credible political viability.

Private blackmail does not alter third-party threat until discovered.

## 12. Capital

### Attack gates

Declared, Gravely/Deathbed, adjacent base, at least250 troops.

### Royal defense

Gravely450, Deathbed300, Fort3.

### Occupation

At least200 survivors assigned.

- +8 Prestige;
- Usurper;
- Church case -2;
- +15 threat;
- 1 Gold/day;
- tie-break/Acclamation access.

### Pyrrhic victory

Victory with fewer than200:

- Capital **Uncontrolled**;
- no income/tie-break/Acclamation;
- defeated garrison zero;
- victor gains battle Prestige but not Capital-control effects;
- later claimant can one-day March and assign200 without battle.

### Loss

Prior claimant -8 Prestige, 12 Pledge shock and immediate benefit loss.

## 13. Simultaneous Capital campaigns

sequenceId resolves first. Later revalidates against new controller or Uncontrolled state and may withdraw where documented.

## 14. Invalidation

- Liberation already complete: end, one-day return, logistics lost.
- Occupier changed: continue if hostile/adjacent; withdrawal reaction.
- Attacker loses bases: cancel, retinue returns after2 days, logistics lost.
- Defender zero: may yield; attacker still needs garrison.
- Double-committed troops: later sequenceId Order cancels and logs invariant failure.

## 15. Defensive causes

Reclaim own seat, help Pledged/Committed ally under agreement, or respond within14 days to aggressor. Avoid King's-Peace penalty and reduce threat10. Other effects remain.

## 16. Dispossessed player

Retains two Orders and can negotiate, spy, expose, request support, spend held resources, campaign from ally base and win Council.

Cannot receive Greyfen income/recovery, Raise Taxes or campaign without base.

## 17. Military-route pressure

Bounded by persistent casualties, 75 per occupation, 200 Capital, contract renewals, negligible occupation income, observer-specific threat/containment and four-territory Acclamation requirement.