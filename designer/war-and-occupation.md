# War, Royal Authority and Occupation

## 1. Purpose of the military system

War is a political instrument, not a second game layered beside succession.

A campaign must simultaneously affect:

- available Levies and Gold;
- Prestige;
- physical control and adjacency;
- the target's economy;
- support viability;
- neighboring lords' perception of threat;
- Church and lawful-conduct judgments;
- occupation garrison requirements.

Winning a battle is therefore useful without automatically producing an economic snowball.

There is no tactical battlefield, army-piece movement, siege minigame or legal annexation in the first release.

## 2. Royal Authority

The King's health determines what force is politically possible.

### Stable

The King's Peace is still enforceable.

Starting an offensive war requires an explicit **Defy the King's Peace** confirmation and applies:

- 15 Influence cost in addition to campaign costs;
- -10 Prestige immediately;
- -1 Church-conduct step;
- -8 relationship with every non-belligerent lawful lord, except Mara receives only -2;
- the public history flag **Royally Sanctioned**;
- 150 royal troops added to the defender for that campaign.

March on the Capital is unavailable.

A Stable-phase war is not forbidden because radical early rebellion should remain possible, but it is deliberately costly.

### Ailing

The Crown can condemn private war but can rarely intervene.

Starting an offensive war applies:

- -5 Prestige;
- the public history flag **Broke the King's Peace**;
- normal threat consequences;
- no royal reinforcement.

March on the Capital remains unavailable.

### Gravely Ill

Private war no longer has a flat legitimacy penalty.

- normal threat and relationship consequences still apply;
- declared claimants may March on the Capital;
- the royal Capital garrison is 450 troops.

### Deathbed

Royal government is barely functioning.

- campaign duration is reduced by one day;
- the royal Capital garrison falls to 300 troops;
- AI claimants weight Capital control and emergency coercion heavily;
- no flat King's-Peace penalty remains.

### Abbeylands exception

An offensive attack against Abbeylands without a recognized defensive or liberation cause always applies an additional severe Church-conduct penalty and may produce Condemnation, regardless of phase.

## 3. Military availability

A lord's military breakdown contains:

- home levies available;
- levies committed to current Orders;
- levies locked in allied aid;
- levies locked in occupation garrisons;
- active mercenary troops;
- mercenaries locked in garrisons;
- casualties awaiting no automatic return.

Only available troops can be committed to a new campaign or threat.

A lord must have an operational base to invade:

- their own unoccupied hereditary seat; or
- an occupied territory they physically control; or
- an unoccupied seat belonging to a Pledged or Committed ally who grants basing rights.

A dispossessed lord with no allied base may still conduct diplomacy and intrigue but cannot start a campaign.

## 4. Campaign sequence

### 4.1 Start

The attacker chooses:

- adjacent target;
- levy commitment in increments of 25;
- zero, one or two mercenary bands;
- whether the goal is occupation or liberation.

The UI previews:

- known defender strength range;
- Fortification modifier;
- required occupation garrison;
- projected political consequences;
- which neighboring lords will treat the attack as threatening.

The attacker pays 10 Gold logistics and locks the selected troops.

### 4.2 Warning and reaction

The campaign is publicly revealed after 12 in-game hours of mustering. A current Watch Court intelligence result may reveal it immediately.

The defender receives a mandatory reaction and may:

- defend with available levies;
- add an eligible mercenary band;
- call troops already committed through an alliance bargain;
- yield the seat without battle;
- abandon an occupation and restore the legal lord.

A reaction uses no Order slot.

### 4.3 Resolution

The battle resolves when the Invade Order completes.

Normal duration is 3 days. Deathbed duration is 2 days.

If the target changes hands or the war becomes impossible before resolution, use the invalidation rules in Section 12 rather than resolving against a nonexistent state.

## 5. Effective battle power

For each side:

`baseForce = committedLevies + committedMercenaries + eligibleAlliedTroops`

`effectivePower = baseForce × commanderModifier × terrainModifier × fortificationModifier × fortuneModifier`

### Commander modifier

- ordinary lord/player: 1.00
- Edric: 1.10
- authored event modifier: 0.90–1.10

### Terrain modifier

Only explicit territory traits apply. Northkeep gives Edric's defending force +10%. Other launch territories have no generic terrain bonus.

### Fortification modifier

Defender only:

`1 + (0.10 × Fortification)`

Examples:

- Fortification 1: 1.10
- Fortification 2: 1.20
- Fortification 3: 1.30

Unrest reduces Fortification by one, minimum zero.

### Fortune modifier

Each side receives a deterministic seeded factor between 0.92 and 1.08.

The factor is drawn once when the campaign begins, stored in the Order and never rerolled by refresh. The result report describes it qualitatively as poor, ordinary or favorable battlefield fortune.

### Victory

The side with greater effective power wins. Exact ties favor the defender.

The game shows a full post-battle breakdown; combat cannot feel arbitrary.

## 6. Casualties

Let:

`powerRatio = winnerEffectivePower / loserEffectivePower`

Loser casualty rate:

`clamp(0.28 + 0.08 × (powerRatio - 1), 0.28, 0.45)`

Winner casualty rate:

`clamp(0.18 - 0.04 × (powerRatio - 1), 0.08, 0.18)`

Round casualties to the nearest whole troop and distribute proportionally between levies, mercenaries and allied contingents.

Consequences:

- levy casualties are permanent except for slow normal recovery;
- mercenary casualties reduce the active contract's surviving force;
- allied casualties belong to the ally and can trigger bargain or support effects;
- a lord never loses more troops than were committed.

A **major battle** is one where at least 250 total troops fought or a hereditary seat changed physical control. Major battles create support shocks and larger Prestige changes.

## 7. Prestige and political effects of battle

### Major victory

- winner: +8 Prestige;
- losing attacker: -6 Prestige;
- losing defender: -4 Prestige;
- occupation or liberation event is public;
- relevant support viability and shock checks occur.

### Minor victory

- winner: +4 Prestige;
- loser: -2 Prestige.

### Yield without battle

- attacker: +3 Prestige;
- defender: -5 Prestige;
- no casualties;
- occupation and threat consequences still occur.

Edric may respect a military victory while simultaneously becoming alarmed by excessive expansion. These are separate evaluation reasons.

## 8. Mercenaries

Mercenaries are hired contextually when beginning an invasion, defending or maintaining a threatened garrison.

### Standard band

- 150 troops;
- 50 Gold for a seven-day contract;
- maximum two active bands per lord;
- Westmarch's legal controller pays 40 Gold while physically controlling Westmarch.

### Contract behavior

- surviving mercenaries remain available until contract expiry;
- they may fight again or serve in a garrison;
- renewing a surviving band costs 20 Gold for seven more days;
- the player receives a mandatory renewal reaction one day before expiry;
- if unpaid, the band leaves at dawn;
- if departure reduces a garrison below its minimum, the occupation or Capital control ends immediately after a warning.

Mercenaries do not replenish and do not become permanent levies.

## 9. Occupation

Legal lordship never changes during the crisis. A victory may create physical occupation.

### Hereditary-seat occupation requirements

- at least 75 surviving loyal or contracted troops assigned as garrison;
- garrison is locked and unavailable elsewhere;
- if the attacker cannot assign 75 after casualties, the army withdraws and no occupation is established.

### Effects on legal lord

- zero territory income;
- zero levy recovery;
- loss of special trait;
- one-time -8 Prestige for dispossession;
- viability shock;
- remains a voter and political actor.

### Effects on occupier

- receives 25% of the territory's normal Gold income;
- receives no levy recruitment;
- does not gain the legal lord's special trait;
- gains adjacency from the occupied seat;
- denies the legal lord the territory's resources;
- locks the garrison;
- generates threat and hostility.

### End of occupation

Occupation ends when:

- the legal lord or ally wins a liberation campaign;
- the occupier voluntarily withdraws;
- the garrison falls below 75;
- an authored agreement restores the seat.

Ending occupation does not restore casualties or erase Aggressor history.

## 10. Threat perception

Threat is a derived per-observer judgment, not a sixth headline resource.

For implementation, calculate an internal threat value from public facts:

- +20 if candidate's available military exceeds 1.25× the observer's defensive availability;
- +15 if candidate occupies a seat adjacent to the observer;
- +10 per occupied hereditary seat;
- +15 if candidate controls the Capital;
- +10 if candidate has at least two public Pledges/Commitments;
- +10 after the candidate's second offensive war;
- +10 per current coerced Pledge;
- -10 if observer is voluntarily Committed to the candidate.

Bands:

- below 20: Low
- 20–39: Concern
- 40–59: Serious Threat
- 60+: Existential Threat

The UI shows reasons, not the numeric total.

### Personality response

- **Edric:** respects Concern-level strength; resists Serious or Existential dominance.
- **Ysabel:** seeks protection or temporary accommodation at Concern/Serious; defects if protection collapses.
- **Oswin:** treats unlawful aggression as instability and favors containment.
- **Mara:** tolerates anti-Renard defiance but resists centralizing conquest.
- **Renard:** prioritizes any declared claimant who reaches Serious Threat or credible succession viability.

### Example: taking Westmarch

A successful occupation of Westmarch gives the player:

- victory Prestige;
- adjacency to Northkeep and the Capital;
- denial of Mara's Gold, levies and mercenary discount;
- a possible coercive lever over Mara.

It also causes:

- battle casualties;
- 75 troops locked in occupation;
- severe hostility from Mara;
- threat increase for Edric, Oswin and the Capital-aligned court;
- possible Church/lawful-conduct consequences depending on phase and cause;
- no Westmarch levy growth or special trait for the player.

## 11. March on the Capital

The Capital uses the same battle system with special gates.

### Availability

- declared claimant only;
- Gravely Ill or Deathbed phase;
- attacker physically controls an adjacent territory;
- attacker commits at least 250 troops;
- no existing unresolved campaign against the Capital by that same lord.

### Defender

If the Capital is royal:

- Gravely Ill garrison: 450;
- Deathbed garrison: 300;
- Fortification: 3.

If occupied, the current Capital garrison defends. The occupier may reinforce as a reaction.

### Victory effects

- requires at least 200 surviving troops assigned to the Capital garrison;
- +8 Prestige;
- public **Usurper** conduct flag;
- -2 Church-case conduct;
- +15 threat for Capital control;
- 1 Gold per day from the disrupted royal administration;
- access to the Capital constitutional tie-break and possible Military Acclamation.

If fewer than 200 troops survive, the attack is a military victory but the claimant cannot hold the Capital; the royal administration or prior occupier retains control after the army withdraws.

### Losing the Capital

Loss produces:

- -8 Prestige for the prior claimant controller;
- a 12-point Pledge shock;
- immediate removal of Capital tie-break and Military Acclamation eligibility.

## 12. Order invalidation

Every campaign revalidates before battle.

### Target already restored or vacated

If the target has no hostile occupier and the declared goal was liberation, the Order ends early. Troops return after one travel day; logistics Gold is lost; no Prestige change.

### Target changes occupier

The campaign continues against the new physical controller if still hostile and adjacent. The player receives a reaction allowing withdrawal before battle.

### Attacker loses all operational bases

The campaign is cancelled before battle. Troops already marching return as a dispossessed retinue after two days; logistics Gold is lost.

### Attacker's available force falls below committed force

Committed troops are locked at campaign start, so unrelated events cannot spend them. Casualties from an earlier same-dawn battle resolve first; if this creates an impossible second commitment, the later-started Order is cancelled and the inconsistency is logged as a validation failure for QA.

### Defender has no troops

The defender may yield or the attacker wins automatically, but still needs the occupation garrison.

## 13. Defensive causes and liberation

A campaign counts as defensive/liberating when:

- reclaiming one's own hereditary seat;
- helping a Pledged or Committed ally reclaim their seat under an active agreement;
- responding to an aggressor who attacked the lord within the previous 14 days.

Defensive causes avoid King's-Peace penalties and reduce threat consequences by 10, but normal casualties, occupation and relationships still apply.

## 14. Dispossessed-player behavior

Losing Greyfen is not immediate defeat.

The player retains both Order slots and can:

- negotiate;
- spy;
- expose secrets;
- request support;
- use existing Gold and Influence;
- conduct a campaign from a willing ally's seat;
- win the Council vote while landless.

The player cannot:

- receive Greyfen income;
- recover Greyfen levies;
- Raise Taxes;
- launch a campaign without an allied or occupied base.

This creates severe pressure without deleting the political story.

## 15. No military spam edge

The military route is constrained by simultaneous costs:

- every battle creates persistent casualties;
- occupations lock 75 troops each;
- the Capital locks 200;
- mercenaries require large Gold outlays and contract renewals;
- occupation income is negligible;
- repeated aggression raises threat and containment;
- military acclamation requires four physical territories including the Capital.

The intended conqueror path is possible, but it is not “win one war, absorb the economy, repeat.”