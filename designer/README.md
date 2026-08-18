# The Petty Lord — Canonical Design Package

**Status:** Design locked after four hostile paperplay passes  
**Target:** Desktop browser  
**Run length:** 49–56 live minutes at 1×, plus paused decisions  
**Genre:** Real-time-with-pause political strategy / succession crisis simulator

> The King is dying. You are a minor lord with eight weeks to manufacture a reason the kingdom should accept you as its next ruler.

This directory is the implementation contract. Where a prototype, conversation or code comment conflicts with these files, this package wins. The exact amendments found through hostile testing are recorded in [`paperplay/final-amendments.md`](./paperplay/final-amendments.md).

## Canonical files

1. [`game-rules.md`](./game-rules.md) — clock, health phases, resources, economy, Orders and actions.
2. [`world-and-actors.md`](./world-and-actors.md) — fixed map, territories, rivals, bargains, openings and secrets.
3. [`candidate-evaluation.md`](./candidate-evaluation.md) — exact per-lord political evaluation, Proof, Fear and Red Lines.
4. [`politics-and-succession.md`](./politics-and-succession.md) — support, collateral, coercion, Church and Council constitution.
5. [`war-and-occupation.md`](./war-and-occupation.md) — Royal Authority, battles, casualties, occupation, threat and Capital.
6. [`ai-information-events.md`](./ai-information-events.md) — one-Intent rival AI, knowledge limits, deterministic randomness and events.
7. [`interface-content-and-production.md`](./interface-content-and-production.md) — UI, onboarding, endings, architecture, QA and four-day production contract.
8. [`balance-sheet.md`](./balance-sheet.md) — all starting values, costs, thresholds, formulas and exact consequences.
9. [`paperplay/`](./paperplay/) — exploit matrix, complete runs, edge cases, final consistency pass and amendment ledger.

## High concept

The crisis begins with 56 days on the calendar. One in-game day equals one real minute. Pause and 2× speed are available. The King's exact death dawn is seeded between elapsed Days 49 and 56 and is communicated only through worsening physician reports.

The player controls Greyfen, the least consequential of six great lordships. Renard begins as the presumed heir. The player must prepare, publicly declare, construct support, become dangerous, survive the reaction and keep their position intact until death.

## Core loop

**Prepare → Declare → Build support → Become dangerous → Survive the counterattack → Hold until the King dies.**

The player has two simultaneous Orders. Each NPC has one major Intent plus reactions. Every meaningful gain changes multiple systems.

Taking Westmarch can provide victory Prestige, strategic adjacency, denial of Mara's resources and coercive leverage. It also costs casualties and a 75-troop garrison, creates severe hostility and makes neighboring lords calculate the player as a threat. The occupier receives only 25% income, no levy recovery and no Free Companies trait.

## The political game

Support is not collectible.

- **Leaning:** private and fluid.
- **Pledged:** public and sticky.
- **Committed:** tied to shared risk and hard to break.
- **Under Duress:** lasts only while coercive leverage remains.

Future promises create interest. A voluntary Pledge requires continuous Leaning, personal Proof and material present collateral. Examples include locked Gold, committed troops, Church concessions and permanent weakening of Greyfen.

Relationships, Support, Legitimacy and Power remain separate. Exact Edric/Ysabel/Oswin/Mara evaluation is authored rather than generated from arbitrary AI weights.

## The constitutional ending

There is no KING SCORE.

### Military Acclamation

Before Council, a declared claimant wins by the sword only by controlling:

- the Capital;
- three non-Capital seats;
- at least 200 troops in the Capital.

### Council of Six

Every legal lord retains one vote, even while dispossessed.

- Four of six wins any ballot.
- With three candidates and no majority, eliminate the lowest.
- Final 3–3 tie: sole Church Endorsement → Capital → more Commitments → exact Claim → Prestige → earlier declaration.
- If the player is eliminated or never declared, they manually cast Greyfen's historical vote but cannot recover the Crown.

Claim shapes legal credibility. The Church validates it. The Capital breaks a specific deadlock and enables military override. None is a generic additive score.

## Map and cast

Seven territories:

- Greyfen — balanced minor homeland;
- Northkeep — Edric's fortified military seat;
- Westmarch — Mara's mercenary border region;
- Eastvale — Ysabel's wealth;
- Abbeylands — Oswin and Church influence;
- Southmere — Renard's old blood;
- Capital — royal government and coronation apparatus.

Five rivals:

- Edric, the Hawk — respects strength until it becomes existential.
- Ysabel, the Spider — wealthy kingmaker seeking the viable winner and costly protection.
- Renard, the Favorite — principal claimant with Excellent Claim.
- Oswin, the Pious — lawful kingmaker and strongest individual Church voice.
- Mara, the Rebel — demands concrete decentralization and resists central conquest.

## Actions and resources

Headline values: Gold, Levies, Prestige, Claim and Influence.

Eleven base action families:

- Gift;
- Offer Bargain;
- Request Declaration;
- Threaten;
- Watch Court / Find Dirt;
- Research / Forge Claim;
- Expose Secret;
- Invade;
- Raise Taxes;
- Hold Court;
- Patronize Church.

Contextual actions include Declare Candidacy, March on Capital, Break Agreement, Withdraw Occupation, Confess and Seek Penance and Cast Greyfen's Vote.

## Royal-health pressure

- **Stable:** succession campaigning locked; war is near-treason.
- **Ailing:** candidates and public Pledges open.
- **Gravely Ill:** succession dominates; private war normalizes; Capital opens.
- **Deathbed:** long preparation locks, short actions accelerate, alliances harden and death becomes uncertain.

The timer is therefore a progressive collapse of the rules, not a cosmetic countdown.

## Information and AI

AI operates with one Intent, actual resources and observer-limited knowledge. It cannot read hidden player Orders, exact hidden armies, secrets or future RNG.

Public military/occupation coercion is visible Under Duress. Secret blackmail appears voluntary to uninformed institutions. The succession forecast uses only the player's knowledge projection and timestamps stale intelligence.

One seed determines opening package, secrets, event selection, battle fortune, Spy outcomes, AI near-ties and death. Refresh cannot reroll history.

## Launch scope

- one kingdom;
- seven territories;
- six great lords including player;
- normally two or three candidates;
- two player Orders / one NPC Intent;
- four phases;
- one abstract battle model;
- one occupation model;
- one Council constitution;
- sixteen authored events, seeded subset per run;
- onboarding, autosave, forecast, chronicle and ending report.

Explicitly excluded:

- tactical combat;
- free army movement;
- buildings/technology;
- family trees, heirs and character death;
- assassination;
- title inheritance or legal annexation;
- post-coronation play;
- procedural maps;
- multiplayer/accounts/cloud saves;
- meta-progression;
- mobile-first layout.

## Non-negotiable release tests

1. Every vote is explainable from the ending.
2. Late declaration is risky because Leanings and Pledges require time.
3. Future promises alone cannot win a coalition.
4. Conquest never absorbs a full economy.
5. Losing Greyfen is disastrous but not automatic game over.
6. Pause gives thought, not omniscience or free cancellation.
7. Deathbed contains more urgent decisions, not fewer.
8. Coalition, legitimacy/intrigue and military routes can win under the same constitution.
9. NPCs are capacity- and knowledge-bounded.
10. Refresh preserves death, events, Spy and battle outcomes.
11. Private blackmail remains private to uninformed actors.
12. Every simultaneous event resolves deterministically by sequenceId.

## Paperplay result

Four hostile passes found and repaired real holes in Influence arithmetic, late bursts, Church pricing, intrigue availability, fraud repair, Yield, collateral timing, Pledge defection, Capital control, scheduler order, shock expiry, AI knowledge, private blackmail, debt default and exact candidate evaluation.

No new major system is required. Remaining questions are tuning questions: win rates, demand frequency, casualty pressure, event cadence and Deathbed action density.

## Change control

During the four-day build, change a locked rule only after:

- an impossible implementation dependency;
- automated invariant failure;
- complete paper/human run showing a route cannot work;
- usability test showing the rule cannot be understood;
- balance evidence showing dominance or nonviability.

Any such change must update its canonical file and the amendment ledger.