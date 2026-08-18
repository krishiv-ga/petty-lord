# World, Map and Actors

## 1. Kingdom

One fixed kingdom: six hereditary great lordships plus the royal Capital. Legal ownership of hereditary seats never changes during the crisis; armies can occupy them.

```text
                         NORTHKEEP
                        /    |    \
               WESTMARCH — CAPITAL — EASTVALE
                   |        /   \        |
                 GREYFEN — ABBEYLANDS — SOUTHMERE
```

Adjacency:

- Northkeep: Westmarch, Capital, Eastvale
- Westmarch: Northkeep, Capital, Greyfen
- Capital: every hereditary seat
- Eastvale: Northkeep, Capital, Southmere
- Greyfen: Westmarch, Capital, Abbeylands
- Abbeylands: Greyfen, Capital, Southmere
- Southmere: Eastvale, Capital, Abbeylands

## 2. Territory state

Store:

- legal lord;
- physical occupier;
- Wealth;
- levy capacity/available/recovery accumulator;
- Fortification;
- special trait;
- temporary conditions;
- occupation garrison.

Public Order is not a permanent stat. Conditions include Tax Strain, Unrest, Occupied and event flags.

## 3. Territories

### Greyfen — player

- Wealth2
- Levy cap420
- Fort1
- **Fen Roads:** Watch Court against adjacent courts costs 5 less Gold.

Mediocre, not crippled.

### Northkeep — Edric

- Wealth2
- Levy cap720
- Fort3
- **Iron Hills:** Edric's Northkeep defenders +10% effective power.

### Westmarch — Mara

- Wealth2
- Levy cap500
- Fort1
- **Free Companies:** Mara pays 40 rather than 50 Gold for a band while she legally and physically controls Westmarch.

Occupier denies but does not gain trait.

### Eastvale — Ysabel

- Wealth5
- Levy cap300
- Fort1
- **Golden Vale:** legal/physical controller gains +1 Gold/day.

### Abbeylands — Oswin

- Wealth3
- Levy cap260
- Fort2
- **Holy Seat:** unjustified violence creates extra Church penalty; legal control strengthens Oswin's Church position.

### Southmere — Renard

- Wealth4
- Levy cap520
- Fort2
- **Old Blood:** Renard begins with Excellent Claim; occupation alone grants no Claim.

### Capital

- Wealth4 while royal; occupier receives1 Gold/day
- Fort3
- phase garrison
- **Seat of Crown:** explicit tie-break and Military Acclamation gate, never a generic vote.

Capital can be Royal, Occupied or Uncontrolled.

## 4. Actor contract

Each lord has:

- legal seat;
- pairwise relationships;
- Gold, Prestige, Claim, Influence and military state;
- personality weights;
- Desire, Fear, Proof, Red Line;
- support record;
- one AI Intent;
- public/private knowledge;
- history flags;
- special advantage.

Relationship and Support are separate.

## 5. Player — Lord of Greyfen

Starts minor, low Prestige, Dubious Claim, no faction.

- chooses name and heraldry only;
- two Orders;
- cannot Declare before Ailing;
- declaration irreversible;
- can continue and win while dispossessed.

## 6. Edric — The Hawk

**Seat:** Northkeep  
**Role:** military power; conditional claimant

- Desire: strong ruler, military authority, secure border.
- Fear: weak monarchy or conqueror able to absorb Northkeep.
- Proof: meaningful victory, comparable public military position, material war aid or stable Capital control.
- Red Line: cowardice/abandonment during shared military obligation.
- Advantage: Veteran Command ×1.10.

Moderate strength earns respect; dominance triggers resistance. Bribery alone fails.

### Declaration

From Gravely Ill, Edric may declare only if:

1. Renard has at most one Pledged/Committed supporter;
2. Edric has at least500 available/contracted troops;
3. Prestige at least50;
4. Edric has **no valid Pledge of any basis**, including Under Duress.

If coercion later breaks, check next dawn.

## 7. Ysabel — The Spider

**Seat:** Eastvale  
**Role:** rich kingmaker

- Desire: influence and protection of financial network.
- Fear: losing side or conquest.
- Proof: another public Pledge, credible Claim+Church, Capital, rival defeat, or costly escrow/protection.
- Red Line: reckless collapse after she has taken risk.
- Advantage: Web of Credit, high Gold and financial bargains.

Strongest momentum response; may submit temporarily to force. Does not normally declare.

## 8. Renard — The Favorite

**Seat:** Southmere  
**Role:** principal claimant

- Desire: Crown.
- Fear: humiliation and destroyed legitimacy.
- Advantage: Excellent Claim, favorable court relationships, automatic Ailing legitimacy Intent.

Declares automatically. Prioritizes Church and an early Pledge, then containment.

### Forced withdrawal

Only if all:

1. zero Pledged/Committed supporters;
2. Southmere occupied or available military below150;
3. demanding claimant controls Capital;
4. successful Threaten uses that leverage.

Withdrawal does not create support for the player.

## 9. Oswin — The Pious

**Seat:** Abbeylands  
**Role:** voter and strongest individual Church voice

- Desire: lawful stable monarchy protecting Church.
- Fear: impiety, civil collapse, fabricated legitimacy.
- Proof: at least Plausible Claim plus Patronage, credible genealogy/conduct, or rival impiety.
- Red Line: attack Abbeylands, unconfessed exposed fraud, seizure of Church wealth or incompatible impious bargain.
- Advantage: Voice of Synod; Pledge/Commitment materially changes Church case.

Influences but does not equal the Church. Does not declare.

## 10. Mara — The Rebel

**Seat:** Westmarch  
**Role:** anti-centralist kingmaker/spoiler

- Desire: limits on royal tax, levies and interference.
- Fear: centralized monarch or betrayal.
- Proof: concrete pre-death concession or material anti-central act.
- Red Line: revocation, centralizing policy, hostile occupation of Westmarch or expanded royal taxation.
- Advantage: March Liberties and mercenary discount.

Opposes Renard but does not automatically support player. Resists existential conquest. Does not normally declare.

## 11. Bargain families

Run seed selects first offered primary demand; identity remains stable.

### Edric

- **Marshal:** reserve candidate's Marshal office plus military Proof.
- **Border Aid:** lock150 levies for7 days; Pledge if Leaning when fulfilled.
- **Joint Campaign:** each side commits at least100; victory can Commit existing Pledge.

### Ysabel

- **Escrow:** lock80 Gold; still needs Viability Proof.
- **Chancellorship:** reserve candidate's Chancellor and lock40 Gold; needs Viability Proof.
- **Protection:** lock100 troops in Eastvale7 days; collateral and Proof.

### Oswin

- **Abbey Endowment:** pay60 Gold; acceptance itself creates Patronage; requires Plausible Claim.
- **Church Immunities:** enact20% reduction to future Raise Taxes proceeds and complete Patronize Church; no second cash charge; requires Plausible Claim.
- **Renunciation:** break a named impious agreement/publicly condemn act.

### Mara

- **Greyfen Charter:** Greyfen income/recovery ×0.75 remainder; centralist relationship costs.
- **Denounce Central Rule:** harms Renard/centralists; Leaning only.
- **Provincial Aid:** lock100 troops5 days or liberate Westmarch; can enable Pledge.

Future reward alone never Pledges. Office uniqueness is stored per candidate government.

## 12. Relationship scale

- -100…-40 Hostile
- -39…-15 Cold
- -14…+14 Neutral
- +15…+39 Cordial
- +40…+69 Warm
- +70…+100 Trusted

Baseline pairs:

- Edric–Renard -20
- Edric–Ysabel +5
- Edric–Oswin +10
- Edric–Mara -20
- Ysabel–Renard +20
- Ysabel–Oswin +5
- Ysabel–Mara 0
- Renard–Oswin +15
- Renard–Mara -30
- Oswin–Mara -10

Player: Edric0, Ysabel+5, Renard-10, Oswin0, Mara+10.

Opening package adjusts at most three pairs by5–10.

## 13. Opening packages

### Fractured Court

Renard–Ysabel -10; Edric Prestige +5; Player–Mara +5.

### Border Crisis

Edric and Mara -60 starting levies; relationship -10 further; first Intents border-weighted.

### Holy Anxiety

Renard Church conduct -2 at Ailing; Oswin +15 Gold/-30 levies; first Intent investigates legitimacy.

### Favorite Ascendant

Renard begins with Ysabel bargain progress and first Ailing Request; Ysabel +20 Gold; damaging Renard vulnerability still guaranteed.

Packages change pressure, not rules. Each must remain viable for at least three targeted routes.

## 14. Secrets

Every run contains:

- exactly one Renard vulnerability selected from his authored pool;
- two additional NPC secrets selected from Edric, Ysabel, Oswin and Mara;
- optional player Forgery Evidence only if forged.

Renard is guaranteed because intrigue against the presumed heir must always be a real strategic family. Exact consequences are canonical in `balance-sheet.md`.

There is no generic Dirt currency.

## 15. Dispossession

Dispossessed lord retains:

- vote/title/Claim;
- Prestige after one-time penalty;
- Gold held;
- relationships/support/agreements/secrets;
- AI Intent capacity;
- surviving retinue.

Loses:

- income/recovery/trait;
- normal campaigning without allied base.

A yielded or defeated retinue can operate from a Pledged/Committed ally's unoccupied seat when basing rights are granted. Same rules for player and NPC.