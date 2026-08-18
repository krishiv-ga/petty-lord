# The Petty Lord — Canonical Design Package

**Status:** Design locked for first complete release  
**Target:** Desktop browser  
**Run length:** 49–56 minutes at normal speed, plus paused decision time  
**Genre:** Real-time-with-pause political strategy / succession crisis simulator

> The King is dying. You are a minor lord with eight weeks to manufacture a reason the kingdom should accept you as its next ruler.

This directory is the implementation contract for the game. Code, content, balancing and generated art should follow these documents. Where an older conversation, prototype or code comment conflicts with this package, this package wins.

## Canonical files

1. [`game-rules.md`](./game-rules.md) — clock, phases, resources, economy, orders and player actions.
2. [`world-and-actors.md`](./world-and-actors.md) — map, territories, rivals, relationships and opening packages.
3. [`politics-and-succession.md`](./politics-and-succession.md) — support, bargains, Claim, Church, Capital and exact succession procedure.
4. [`war-and-occupation.md`](./war-and-occupation.md) — Royal Authority, battles, occupations, threat and dispossession.
5. [`ai-information-events.md`](./ai-information-events.md) — rival capacity, knowledge limits, AI intent selection, events and deterministic randomness.
6. [`interface-content-and-production.md`](./interface-content-and-production.md) — UI, onboarding, endings, art, technical architecture, QA and production boundaries.
7. [`balance-sheet.md`](./balance-sheet.md) — first-pass numbers for starting state, action costs, durations, thresholds and formulas.
8. [`paperplay/`](./paperplay/) — hostile paperplay records and the amendments incorporated after them.

## High concept

The old King is expected to die in roughly eight weeks. Time moves continuously at one in-game day per real minute, with pause and optional 2× speed. The player owns Greyfen, the least consequential of six great lordships. They begin with a mediocre army, little Prestige and only a dubious connection to the royal bloodline.

When the King dies, the Council of Six resolves the succession. The player can win by assembling a coalition, becoming the Church-backed legitimate heir, destroying the credibility of the favorite, coercing enough votes, or physically dominating the Capital and the kingdom. These are not separate minigames or score tracks. They are different ways of manipulating one constitutional succession system.

## Core loop

**Prepare → Declare → Build support → Become dangerous → Survive the reaction → Hold the position until the King dies.**

The player uses two simultaneous Order slots to conduct diplomacy, intrigue, military campaigns and realm actions. Rival lords each pursue one major Intent at a time and react immediately to threats and events. Every important gain has an accompanying cost or political consequence.

Examples:

- Occupying Westmarch grants Prestige, strategic reach and denies Mara its income, but costs battle casualties and garrison troops while making neighboring lords fear the occupier.
- Fabricating royal ancestry increases Claim, but creates evidence that can collapse both Claim and Church standing if exposed.
- Mara's support requires a real decentralizing concession that weakens the player's own economy.
- Ysabel may accept Gold as escrow, removing that Gold from the player's use until the succession is over.
- A coerced pledge lasts only while the threat remains credible and makes other nobles more likely to contain the player.

## Design pillars

### Power is relational
No major action changes only one number. Territory, military strength, legitimacy, fear, obligations and relationships must feed back into one another.

### Support is not collectible
A lord can back one claimant at a time. Leanings are private and fluid; Pledges are public and sticky; Commitments require shared risk and break only under major shocks. Future promises create interest but cannot purchase loyalty alone.

### The opposition is active
Renard and the other lords are not waiting to be solved. They court supporters, undermine rivals, fight wars, react to threats and make emergency moves as the King's health fails.

### The rules decay with the King
The health phases are changes to Royal Authority, not just labels on a timer. Early aggression is treasonous. Formal candidacy opens later. Private war becomes normalized. The Capital becomes contestable only as government collapses.

### The ending is institutional
There is no hidden KING SCORE. The great lords cast votes. Claim determines legal credibility. The Church validates legitimacy. The Capital breaks specific deadlocks and enables a narrow military override.

### Complete means polished, not broad
The first release is one deeply specified 50–60 minute scenario with an ending, tutorial, readable AI, autosave, deterministic replay, feedback and multiple viable strategies. It is not a prototype for a larger grand-strategy game.

## Locked launch scope

- One kingdom and one succession crisis.
- Seven territories: six hereditary seats plus the Capital.
- Six great lords including the player.
- Three possible claimants in normal play: the player, Renard and conditionally Edric.
- Five headline resources/ratings: Gold, Levies, Prestige, Claim and Influence.
- Two player Orders; one major Intent per NPC.
- Four royal-health phases over a 56-day crisis horizon.
- Approximately eleven base action families plus contextual reactions.
- One abstract battle system and one occupation model.
- One exact Council succession procedure plus one difficult military-acclamation override.
- Sixteen authored events, of which a seeded subset appears in each run, plus systemic notifications.
- One integrated onboarding sequence, autosave/resume and a detailed ending report.

## Explicit exclusions

Do not add the following during the four-day build:

- tactical combat;
- free movement of army pieces;
- buildings or technology trees;
- family trees, heirs or generational simulation;
- assassination or character death;
- legal annexation and title inheritance;
- post-coronation simulation;
- procedural maps;
- multiplayer, accounts or cloud saves;
- meta-progression;
- mobile-first layout;
- a generic relationship-to-vote conversion;
- a generic aggregate succession score.

## Non-negotiable experience tests

The release is not complete unless all are true:

1. A player can explain why every lord voted as they did from the ending screen.
2. Waiting to declare is risky because rival support hardens over time.
3. Promising every lord a future reward does not produce a winning coalition.
4. Conquest does not create exponential economic growth.
5. Losing Greyfen is disastrous but does not automatically end the run.
6. Pause grants thinking time, not perfect information or free cancellation.
7. The final ten minutes contain more urgent decisions, not fewer.
8. At least four recognizably different routes can win under the same rules.
9. Every AI lord appears bounded by capacity and knowledge rather than cheating.
10. Refreshing the browser cannot reroll the King's death or event outcomes.

## Change control

During implementation, a rule may be changed only when one of the following is recorded:

- an impossible implementation dependency;
- a failed paperplay or automated simulation;
- a usability test showing the rule cannot be understood;
- a balance result showing a dominant or nonviable strategy.

Any change to succession, support, war, Royal Authority or the clock must be reflected in the relevant design document and in `paperplay/final-amendments.md`.