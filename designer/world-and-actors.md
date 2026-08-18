# World, Map and Actors

## 1. The kingdom

The entire game takes place in one deliberately small kingdom. There are six hereditary great lordships and one royal Capital. Legal ownership of the six hereditary seats never changes during the crisis; armies can occupy them, but there is no annexation or title-transfer simulation.

The map is a fixed SVG graph rather than a tactical grid.

```text
                         NORTHKEEP
                        /    |    \
               WESTMARCH — CAPITAL — EASTVALE
                   |        /   \        |
                   |       /     \       |
                 GREYFEN — ABBEYLANDS — SOUTHMERE
```

### Canonical adjacency

- **Northkeep:** Westmarch, Capital, Eastvale
- **Westmarch:** Northkeep, Capital, Greyfen
- **Capital:** Northkeep, Westmarch, Eastvale, Greyfen, Abbeylands, Southmere
- **Eastvale:** Northkeep, Capital, Southmere
- **Greyfen:** Westmarch, Capital, Abbeylands
- **Abbeylands:** Greyfen, Capital, Southmere
- **Southmere:** Eastvale, Capital, Abbeylands

A military target must be adjacent to any territory physically controlled by the attacker. The Capital is adjacent to every hereditary seat to preserve its strategic centrality.

## 2. Territory model

Each territory stores only:

- legal lord;
- physical occupier, if any;
- Wealth rating;
- levy capacity;
- current available levies;
- Fortification rating;
- one special trait;
- temporary conditions;
- occupation garrison, if any.

Temporary conditions include Tax Strain, Unrest, Occupied, Under Siege and event-specific flags. Public Order is not a permanent number.

## 3. Territories

### Greyfen — the player's seat

A wet, overlooked border county with no obvious strategic advantage.

- Wealth: 2
- Levy capacity: 420
- Fortification: 1
- Trait: **Fen Roads** — Watch Court Spy actions targeting an adjacent lord cost 5 less Gold.

Greyfen is intentionally mediocre rather than actively bad. Its trait supports information play without determining a strategy.

### Northkeep — Edric's seat

A fortified iron-producing northern march.

- Wealth: 2
- Levy capacity: 720
- Fortification: 3
- Trait: **Iron Hills** — Northkeep levies gain +10% effective strength when defending or fighting for Edric.

### Westmarch — Mara's seat

A loosely governed border region full of smugglers, free companies and autonomous barons.

- Wealth: 2
- Levy capacity: 500
- Fortification: 1
- Trait: **Free Companies** — mercenary contracts initiated from Westmarch cost 20% less while Mara physically controls it.

An occupier denies Mara the trait but does not gain it; occupation does not grant legal access to local networks.

### Eastvale — Ysabel's seat

The richest agricultural and banking territory in the realm.

- Wealth: 5
- Levy capacity: 300
- Fortification: 1
- Trait: **Golden Vale** — Eastvale's legal lord begins with additional Gold and gains +1 Gold per day while the seat is unoccupied.

### Abbeylands — Oswin's seat

A dense network of monasteries, shrines and ecclesiastical estates.

- Wealth: 3
- Levy capacity: 260
- Fortification: 2
- Trait: **Holy Seat** — physical violence against Abbeylands applies an additional Church penalty; legal control strengthens Oswin's influence over Church deliberation.

### Southmere — Renard's seat

An old and prestigious duchy closely tied to the royal house.

- Wealth: 4
- Levy capacity: 520
- Fortification: 2
- Trait: **Old Blood** — Renard begins with an Excellent Claim. Search or event content involving Southmere can reveal limited genealogical evidence but occupation alone grants no Claim.

### The Capital — the royal seat

The royal palace, treasury, council chambers, archives and coronation cathedral.

- Wealth: 4 while the King lives
- Royal garrison: phase-dependent
- Fortification: 3
- Trait: **Seat of the Crown** — controls a defined constitutional tie-break and enables military acclamation when the wider territorial conditions are also met.

The Capital is not a seventh vote and does not add generic succession points.

## 4. Actor model

Every great lord stores:

- legal seat;
- personal relationship with every other lord;
- current Gold, Prestige, Claim, Influence and available military strength;
- personality weights;
- one Desire;
- one Fear;
- one Proof required for voluntary Pledge;
- one Red Line that can break support;
- current support state and basis;
- one active AI Intent at most;
- knowledge of public facts and discovered secrets;
- public-history flags such as Oathbreaker, Aggressor, Patron of the Church or Dispossessed;
- one authored special advantage.

Relationship and succession support are separate systems. A lord may personally like the player while supporting Renard because Renard appears lawful or likely to win.

## 5. The player — Lord of Greyfen

The player chooses a name and heraldic color at new game, but has no mechanical character creator.

### Starting political identity

- minor territorial lord;
- little public importance;
- no established faction;
- Dubious Claim at best;
- enough resources to pursue one strong opening plan, not every plan.

### Player-specific rules

- The player has two Order slots.
- The player cannot formally Declare until Ailing.
- The player cannot withdraw and redeclare.
- Losing Greyfen creates Dispossessed status but does not end the game.
- The player may still win a Council succession while dispossessed.

## 6. Lord Edric — The Hawk

**Seat:** Northkeep  
**Role:** military power and conditional rival claimant

### Desire

A strong ruler, military authority and security on the borders.

### Fear

A weak monarch who leaves the realm exposed—or a conqueror powerful enough to absorb Northkeep.

### Proof

The candidate must demonstrate strength through one of:

- winning a meaningful battle;
- maintaining military strength at least comparable to Edric's after a public challenge;
- materially aiding Edric in war;
- controlling the Capital without immediate collapse.

### Red Line

Cowardice or abandonment during a shared military commitment.

Examples:

- refusing promised aid after Edric is attacked;
- losing a decisive battle while having withheld available troops;
- breaking a military bargain;
- allowing a promised border objective to collapse without response.

### Political behavior

- Moderate strength earns respect.
- Severe dominance triggers resistance.
- Edric cannot be casually bribed into support.
- He is difficult to coerce unless his seat is occupied or a devastating secret is held.

### Candidacy trigger

From Gravely Ill onward, Edric may declare if all are true:

1. Renard has no more than one public Pledged or Committed supporter;
2. Edric has at least 500 available or contracted troops;
3. Edric's Prestige is at least 50;
4. Edric is not voluntarily Pledged or Committed to another candidate.

An opening package may lower the support condition by one, but never allows an early Stable/Ailing declaration.

### Special advantage

**Veteran Command:** +10% effective battle strength and lower AI aversion to military risk.

## 7. Lady Ysabel — The Spider

**Seat:** Eastvale  
**Role:** wealthy kingmaker

### Desire

Influence over the next court and protection of Eastvale's financial network.

### Fear

Being trapped on the losing side or conquered by a militarized claimant.

### Proof

Evidence that the candidate is viable. At least one must be true:

- the candidate has another public Pledge;
- the candidate has Plausible Claim plus Church Favorable status;
- the candidate controls the Capital;
- the candidate has defeated a rival claimant;
- the candidate provides sufficiently costly escrow or military protection.

### Red Line

Political recklessness that destroys the candidate's viability, especially losing all public support after Ysabel has taken a risk.

### Political behavior

- Strongest response to momentum and credible forecasts.
- May bandwagon toward a threatening candidate, but coerced support breaks instantly if protection disappears.
- Values Gold, unique office reservation and protection more than ideology.
- Often begins privately Leaning toward Renard, but not always publicly Pledged.

### Special advantage

**Web of Credit:** high starting Gold, better awareness of public financial distress and one additional bargain option involving escrow or loans.

Ysabel does not normally declare for the crown.

## 8. Duke Renard — The Favorite

**Seat:** Southmere  
**Role:** principal claimant and establishment favorite

### Desire

The crown.

### Fear

Public humiliation, collapse of legitimacy and proof that the King never truly intended him to inherit.

### Proof and Red Line

Renard supports himself. He is not a collectible supporter.

### Political behavior

- Automatically declares when Ailing begins.
- Prioritizes Church legitimacy and one early public Pledge.
- Attempts to contain any player who becomes a plausible challenger.
- Avoids reckless early war unless directly threatened.
- Can be weakened, discredited, coerced to withdraw under extreme conditions or defeated militarily, but not assassinated.

### Withdrawal condition

Renard can be forced to withdraw only when all are true:

1. he has zero Pledged or Committed supporters;
2. Southmere is occupied or his available military is below 150;
3. the demanding claimant controls the Capital;
4. the claimant completes a successful Threaten action using that leverage.

Withdrawal removes Renard from later ballots but does not make him support the player automatically.

### Special advantage

**Royal Favorite:** Excellent starting Claim, favorable establishment relationships and an automatic Ailing-phase legitimacy action.

## 9. Lord Oswin — The Pious

**Seat:** Abbeylands  
**Role:** noble voter and strongest individual influence on the Church

### Desire

A lawful, stable monarchy that protects the Church.

### Fear

Impiety, civil collapse, fabricated legitimacy and a ruler who treats the Church as loot.

### Proof

A candidate must possess at least a Plausible Claim and satisfy one of:

- meaningful Church Patronage;
- credible safe genealogy plus public defense of Abbeylands;
- alignment with Church policy;
- exposure of serious impiety in the rival favorite.

### Red Line

- attacking Abbeylands;
- exposed royal-lineage fraud without confession or repair;
- seizing Church wealth;
- maintaining a bargain Oswin considers openly sacrilegious.

### Political behavior

- Weighs Claim and conduct more heavily than momentum.
- May remain personally cordial while refusing support.
- His support helps the Church deliberate but does not equal Church endorsement.

### Special advantage

**Voice of the Synod:** Oswin's public Pledge counts as one of the explicit paths by which a Strong or high-Plausible claimant can receive Church endorsement.

Oswin does not declare for the crown.

## 10. Lady Mara — The Rebel

**Seat:** Westmarch  
**Role:** anti-centralist kingmaker and military spoiler

### Desire

Permanent limits on royal taxation, levies and interference in the great lordships.

### Fear

A restored centralized monarchy or a claimant who uses her support and then abandons provincial liberties.

### Proof

A concrete concession made before the King's death, such as the Greyfen Charter, or a public act that materially weakens Renard's centralizing program.

### Red Line

- revoking or contradicting the concession;
- siding publicly with a centralizing royal demand;
- occupying Westmarch except under a clearly temporary liberation agreement;
- supporting a policy that expands royal taxation.

### Political behavior

- Opposes Renard by default but does not therefore support the player.
- Respects defiance and regional autonomy more than personal warmth.
- May fight Edric over border disputes.
- Will resist an existential conqueror even when that conqueror opposes Renard.

### Special advantage

**March Liberties:** cheaper mercenaries and less Prestige loss from private war.

Mara does not normally declare for the crown.

## 11. Canonical bargain families

Each kingmaker has two or three authored bargain templates. The run seed determines which primary demand is presented first, but all remain bound by the same Desire and Red Line.

### Edric

- **Marshal's Baton:** reserve the unique Marshal office and satisfy a military Proof.
- **Border Aid:** lock 150 player levies for seven days; those troops participate if Edric is attacked.
- **Joint Campaign:** join or initiate a named war objective, creating shared risk.

### Ysabel

- **Gold Escrow:** lock 80 Gold until the succession ends.
- **Chancellorship:** reserve the unique Chancellor office and lock 40 Gold as a court budget.
- **Protection:** station 100 troops in Eastvale for seven days.

### Oswin

- **Abbey Endowment:** pay 60 Gold and complete Patronize Church.
- **Church Immunities:** accept a public policy that prevents extraordinary taxation of Church land and reduces future Raise Taxes proceeds by 20%.
- **Renunciation:** break a specifically impious agreement or publicly condemn an anti-Church act.

### Mara

- **Greyfen Charter:** immediately reduce Greyfen Gold income and levy recovery by 25% for the rest of the run.
- **Denounce Central Rule:** publicly attack Renard's centralizing program, damaging Renard's relationship and the player's standing with centralists.
- **Provincial Aid:** materially aid Westmarch during a threat or border war.

A future office or territory promise without present collateral can create only a Leaning. Unique offices cannot be promised to more than one lord in the first release.

## 12. Relationship matrix

Relationships use a -100 to +100 internal scale and a qualitative public presentation.

- -100 to -40: Hostile
- -39 to -15: Cold
- -14 to +14: Neutral
- +15 to +39: Cordial
- +40 to +69: Warm
- +70 to +100: Trusted

Support remains separately displayed.

### Baseline inter-lord relationships

Before seeded variation:

- Edric ↔ Renard: -20
- Edric ↔ Ysabel: +5
- Edric ↔ Oswin: +10
- Edric ↔ Mara: -20
- Ysabel ↔ Renard: +20
- Ysabel ↔ Oswin: +5
- Ysabel ↔ Mara: 0
- Renard ↔ Oswin: +15
- Renard ↔ Mara: -30
- Oswin ↔ Mara: -10

Player baselines:

- Player ↔ Edric: 0
- Player ↔ Ysabel: +5
- Player ↔ Renard: -10
- Player ↔ Oswin: 0
- Player ↔ Mara: +10

Each opening package may adjust at most three pairings by ±5 to ±10. Variance must never erase core identity.

## 13. Opening packages and replayability

The map and cast remain fixed. Replayability comes from a small number of coherent seeded political openings rather than procedural world generation.

At new game, select one of four packages and one secret distribution. The opening chronicle communicates the visible consequences.

### Fractured Court

- Renard and Ysabel begin less aligned.
- Edric begins at high Prestige.
- Mara is more open to early negotiation.

### Border Crisis

- Edric and Mara begin with depleted levies and an active grievance.
- Their first AI Intents focus on the border.
- Renard gains time to court the center.

### Holy Anxiety

- The Church begins only Neutral toward Renard.
- Oswin's first Intent investigates legitimacy.
- Abbeylands begins with additional Gold but lower levies.

### Favorite Ascendant

- Renard begins Ailing with a scripted early Pledge opportunity.
- Ysabel has more Gold.
- A damaging Renard secret is guaranteed to exist.

Opening packages change pressure, not rules. Every package must remain winnable through at least three strategic routes in automated simulation.

## 14. Secrets

Each non-player lord has one possible major secret. A seeded subset of three exists per run. The player gains Forgery Evidence only by using Forge Royal Descent.

Example canonical secrets:

- **Renard — Foreign Concession:** promised a border right to a foreign duke; severe with Edric and Mara.
- **Renard — Questioned Paternity:** reduces Claim and Church standing if exposed.
- **Edric — Border Massacre:** harms Church standing and Mara's relationship.
- **Ysabel — Royal Tax Embezzlement:** harms Prestige and makes her vulnerable to coercion.
- **Oswin — Simony:** weakens his personal authority over Church deliberation.
- **Mara — Smuggler Compact:** harms Prestige but can strengthen access to mercenaries.
- **Player — Forgery Evidence:** collapses a large part of fabricated Claim and strongly damages Church standing.

Secrets are discrete authored objects with explicit consequences. There is no generic Dirt currency.

## 15. Dispossession and actor persistence

A lord whose seat is occupied remains a political actor and retains:

- vote;
- legal title;
- Claim;
- Prestige after the one-time dispossession penalty;
- relationships;
- Gold already held;
- agreements and secrets;
- AI Intent capacity.

They lose:

- territory income;
- levy recovery;
- access to the seat's special trait;
- normal ability to initiate a military campaign without an allied base.

A dispossessed actor may launch military action from the unoccupied seat of a Pledged or Committed ally. Otherwise they are limited to diplomacy and intrigue until restored.

This applies equally to the player and NPCs.