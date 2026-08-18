# Rival AI, Information and Events

## 1. AI design goal

The rivals should appear purposeful, bounded and politically legible.

They do not need a full grand-strategy simulation. Each lord should visibly pursue one meaningful objective, react to shocks and operate with the same finite resources and time as the player.

The player should think:

> Renard is trying to secure Oswin before I can.

not:

> Five invisible scripts are changing numbers whenever they need to.

## 2. AI capacity

Each NPC has exactly **one major active Intent** at a time.

An Intent is the AI equivalent of a player Order. It has:

- action family;
- target;
- start and completion time;
- committed Gold, Influence and troops;
- visibility state;
- expected result;
- fallback result;
- deterministic random factors, if any.

NPCs may react immediately without consuming their Intent, exactly as the player does.

Examples of reactions:

- defend an invasion;
- accept or refuse a bargain;
- renew mercenaries;
- break a Pledge after a Red Line;
- answer an ultimatum;
- choose an event response.

An individual NPC cannot court one lord, spy on another and prepare war simultaneously.

## 3. AI resource fairness

AI actions use the same baseline costs, durations and rules as player actions unless an authored special advantage explicitly changes them.

Examples:

- Ysabel can afford more gifts because Eastvale is rich, not because her gifts are free.
- Edric wins more battles because of Veteran Command and Northkeep's levies, not because combat secretly favors AI.
- Mara pays the authored Westmarch mercenary discount.
- Renard starts with stronger Claim and relationships but still spends Influence to negotiate.

AI cannot spend resources already committed to another Intent, agreement or garrison.

## 4. AI knowledge model

Each actor has a knowledge set.

### Public knowledge available to every lord

- declared candidacies;
- public Pledges and Commitments;
- public bargains and policies;
- Claim bands and exact public Claim;
- Church stance;
- territory control and occupations;
- wars and campaign announcements;
- approximate military bands;
- Prestige;
- public conduct flags;
- relationship history involving that actor.

### Private knowledge

A lord knows:

- their own exact resources and Intent;
- bargains offered directly to them;
- secrets they personally possess or discover;
- Spy results they obtained;
- private Leanings communicated to them;
- exact troops committed against them once a campaign becomes public.

### Forbidden AI knowledge

Unless discovered, AI cannot read:

- the player's current Order target;
- exact player Gold or Influence;
- the player's private Leanings with other lords;
- undiscovered Forgery Evidence;
- another actor's secret bargain;
- future event or death RNG;
- the player's cursor, selected panel or pause behavior.

## 5. Public military information

Without fresh Spy intelligence, military availability appears in bands:

- **Broken:** 0–149
- **Modest:** 150–299
- **Strong:** 300–499
- **Formidable:** 500+

Occupations and visible campaign commitments may narrow the estimate.

Watch Court reveals the exact current breakdown for seven days. The value remains historically visible afterward but is marked stale.

## 6. Intent visibility

Intent visibility has three states:

### Hidden

Early private preparation, known only to the actor and successful spies.

### Suspected

Public behavior gives a clue without exact target or completion.

Example:

> Edric is gathering captains at Northkeep.

### Public

The action necessarily becomes visible.

Examples:

- army marching;
- public courtship;
- Church patronage;
- declared bargain;
- exposed scandal;
- Pledge request.

A campaign becomes public after 12 hours. Most diplomatic Intents become Suspected halfway through and public only on resolution unless the action itself is public.

## 7. AI decision cycle

An idle AI lord chooses a new Intent at dawn or immediately after a phase transition/major shock.

Decision sequence:

1. Remove actions that are illegal, unaffordable or impossible.
2. Add mandatory personality responses to Red Lines, invasion or bargain obligations.
3. Score remaining Intent families using phase, Desire, Fear, current support, threat and candidacy.
4. Select a target using only the actor's knowledge.
5. Apply small seeded preference noise of ±5% to avoid identical openings.
6. Commit resources and store all random factors at Intent creation.

The noise can change which of two near-equal plans is selected; it cannot make a lord violate a Red Line or choose an obviously unaffordable action.

## 8. Intent families

NPCs draw from a limited vocabulary:

- improve relationship;
- offer or fulfill a bargain;
- request a public Pledge;
- threaten;
- Watch Court;
- Find Dirt;
- build or defend Claim;
- expose a secret;
- raise emergency funds;
- hold court;
- patronize Church;
- prepare and launch war;
- liberate a seat;
- March on the Capital;
- fortify a current political position by fulfilling Commitment;
- undermine the current frontrunner.

Not every lord uses every family. Ysabel rarely launches an offensive war without direct fear. Edric rarely spends his sole Intent on repeated gifts. Oswin will not threaten military force.

## 9. Phase priorities

### Stable

- personal economy and recovery;
- spying;
- unresolved territorial grievances;
- relationship cultivation;
- legitimacy preparation;
- only exceptional early rebellion.

### Ailing

- Renard seeks one public Pledge and Church advantage;
- kingmakers assess declared candidates;
- player candidacy becomes a recognized threat;
- bargains and public declarations grow in priority.

### Gravely Ill

- succession is the primary objective;
- AI attacks rival support and legitimacy;
- Edric may declare;
- wars against strategically important seats become common;
- claimants consider the Capital.

### Deathbed

- no new long preparation;
- complete or break immediate bargains;
- seize/defend Capital;
- coerce exposed weak lords;
- expose held secrets;
- rescue wavering Pledges;
- attack the candidate most likely to beat the actor's objective.

## 10. Personality priority summaries

### Renard

1. retain lawful legitimacy;
2. secure Oswin or Ysabel;
3. undermine the most plausible rival claimant;
4. protect Southmere;
5. use force only when political containment is insufficient.

### Edric

1. answer military threats and border opportunities;
2. preserve enough force to matter at succession;
3. support a strong candidate on favorable terms;
4. declare when the favorite collapses;
5. seize the Capital if he becomes a credible claimant.

### Ysabel

1. preserve Eastvale and liquid wealth;
2. identify the likely winner;
3. extract costly collateral;
4. fund or join a credible coalition;
5. submit temporarily when faced with overwhelming coercion.

### Oswin

1. defend Abbeylands and Church authority;
2. investigate legitimacy;
3. favor a lawful candidate;
4. expose impiety or fraud;
5. resist coercive rulers.

### Mara

1. weaken central authority;
2. defend Westmarch;
3. exploit conflict between Edric and Renard;
4. support a claimant who makes a concrete provincial concession;
5. resist any claimant who becomes an existential conqueror.

## 11. Targeting the player

AI does not simply attack the public vote leader.

A declared player becomes strategically relevant through any combination of:

- two public supporters;
- Plausible or better Claim rising quickly;
- Church Favorable/Endorsed status;
- control of the Capital;
- a major victory over a rival;
- Serious/Existential military threat;
- occupation of a strategically adjacent seat;
- visible wealth-backed bargaining.

Renard notices political plausibility. Edric notices army strength. Ysabel notices momentum and liquidity. Oswin notices Claim and conduct. Mara notices centralization and aggression.

This prevents “stay second, hoard everything, burst in the last three days” from being reliably safe while preserving late coups as a risky strategy.

## 12. Bargaining between NPCs

NPC claimants and kingmakers use the same bargain records as the player.

- A kingmaker can have only one succession Pledge.
- Unique offices cannot be reserved twice.
- Immediate collateral is removed from the claimant's resources.
- AI can refuse demands it cannot afford.
- AI can break a bargain only under the same Red Line, shock or strategic-collapse rules.
- Public bargains appear in the chronicle; private negotiations require intelligence.

Renard's initial advantages therefore consume actual resources and political promises rather than being free scripted votes.

## 13. Deterministic randomness

A run receives one 64-bit seed at creation.

The seeded generator determines:

- opening package;
- secret distribution;
- minor relationship variation;
- initial AI near-tie choices;
- event schedule and eligible event selection;
- battle fortune factors;
- Spy contested checks;
- the King's exact death dawn.

Rules:

- Every random draw is made once and stored with the resulting object when practical.
- Save/load preserves generator state.
- Refreshing cannot reroll outcomes.
- The ending report displays the seed.
- The same build, version and seed should reproduce the same world when player choices are repeated.

## 14. Event cadence

Events are divided into:

- mandatory royal-health events;
- ambient choice events;
- systemic notifications generated by actions and state.

### Mandatory events

One at the beginning of each phase. They explain the rule change and update the King's portrait/health presentation.

### Ambient events

A run presents at most six ambient choice events.

Six seeded windows occur around elapsed Days:

- 6–10;
- 14–18;
- 22–26;
- 30–34;
- 38–42;
- 45–49.

Within each window, choose one eligible unused event. If no event is eligible, skip the window. If a major mandatory decision or battle already occurred that dawn, defer the ambient event by one day.

No more than one choice event may interrupt the player in a 24-hour period.

Every ambient event has at least one zero-Gold option. The zero-cost option may be politically painful, but the player is never blocked from continuing because a modal demands unavailable resources.

## 15. Authored event set

Numbers below are canonical first-pass values and may be tuned without changing event structure.

### E01 — A Physician's Prognosis

**Trigger:** Run start.  
**Type:** Mandatory, no choice.

Explains the roughly eight-week horizon, continuous clock, pause, Orders and the initial succession forecast.

### E02 — The King Takes to His Bed

**Trigger:** Ailing begins.  
**Type:** Mandatory, no choice.

Unlocks candidacy and Pledges. Renard declares.

### E03 — The Last Council

**Trigger:** Gravely Ill begins.  
**Type:** Mandatory, no choice.

Explains that the King's Peace has effectively failed and the Capital can be contested.

### E04 — The Deathbed

**Trigger:** Deathbed begins.  
**Type:** Mandatory, no choice.

Locks new long schemes, accelerates short actions and introduces uncertain death reports.

### E05 — Failed Harvest in Greyfen

**Eligibility:** Greyfen unoccupied; no current Unrest.

Choices:

- **Buy grain:** pay 30 Gold; +3 Prestige; no condition.
- **Open the granaries:** lose the next seven days of Greyfen income; +5 relationship with Mara; +2 Prestige.
- **Let the villages bear it:** apply Tax Strain for 14 days; -4 Prestige.

### E06 — Raiders on the Northern Road

**Eligibility:** Stable or Ailing; Edric and Mara both hold their seats.

Choices:

- **Send 100 levies for three days:** possible casualties of 0–20; +6 Edric relationship; military Proof progress.
- **Fund local defense:** pay 25 Gold; +3 Edric and +3 Mara relationship.
- **Stay out:** no resource cost; the Edric–Mara relationship worsens by 5 and one gains a border-war Intent weight.

### E07 — The Forgotten Genealogy

**Eligibility:** Player has not completed both Claim projects.

Choices:

- **Buy the records:** pay 35 Gold; +6 safe Claim.
- **Ask Oswin to authenticate them:** spend 10 Influence; +4 Claim; if Oswin relationship is Cold or worse, gain only +2.
- **Sell them to Ysabel:** gain 25 Gold; +5 Ysabel relationship; no Claim.

This event improves a route but is never required for Claim viability.

### E08 — Procession of the Saint's Hand

**Eligibility:** Abbeylands unoccupied.

Choices:

- **Sponsor the procession:** pay 25 Gold; +1 Church conduct; +5 Oswin relationship.
- **Attend without gift:** consume no Order; +2 Oswin relationship.
- **Dismiss the spectacle:** +3 Mara relationship; -1 Church conduct.

### E09 — The Capital Guard Is Unpaid

**Eligibility:** Gravely Ill or earlier; Capital still royal.

Choices:

- **Advance their wages:** pay 50 Gold; record Capital Guard Favor. A future March on the Capital reduces royal garrison by 75 for the player.
- **Tell Renard:** +6 Renard relationship; Renard may fund them.
- **Ignore it:** no immediate effect; seeded chance the royal garrison loses 25–50 troops at Deathbed, stored now.

### E10 — Renard's Royal Progress

**Eligibility:** Ailing; Renard holds Southmere.

Choices:

- **Attend publicly:** +4 Renard relationship; -2 Mara relationship; gain exact view of Renard's public Claim case.
- **Send spies among the retinue:** pay 15 Gold; gain a one-use +10% Find Dirt modifier against Renard; detection can cost 5 relationship.
- **Mock the performance:** +3 Prestige if player Prestige is at least 25, otherwise -3; Renard relationship -10.

### E11 — Petition of Provincial Liberties

**Eligibility:** Player has not issued Greyfen Charter.

Choices:

- **Support the petition:** applies a lighter 10% Greyfen income reduction; +8 Mara relationship; -4 Edric and -3 Oswin relationship.
- **Defend royal authority:** +5 Edric and +4 Renard relationship; -10 Mara relationship.
- **Avoid the issue:** no immediate modifier; Mara's next bargain demand becomes 10 Influence harder.

This does not replace Mara's full Charter Proof.

### E12 — The Hawk's Tournament

**Eligibility:** Edric holds Northkeep; not during Deathbed.

Choices:

- **Sponsor a champion:** pay 30 Gold; seeded contest grants either +5 Prestige/+6 Edric relationship or +2 Prestige.
- **Send Greyfen levies to compete:** lock 75 levies for two days; +5 Edric relationship and military Proof progress.
- **Decline:** no cost; -2 Edric relationship.

### E13 — The Merchant Syndicate's Loan

**Eligibility:** Player Gold below 80; Ysabel not Hostile.

Choices:

- **Borrow 80 Gold:** repayment of 105 Gold due in 14 days. Default causes -8 Prestige, -15 Ysabel relationship and transfers 20 Influence to Ysabel's leverage record.
- **Offer political access instead:** gain 45 Gold and increase the value of Ysabel's future bargain by one tier.
- **Refuse:** no effect.

Debt is due before the succession can normally end, so it is a present cost rather than postgame fiction.

### E14 — Rumor of False Blood

**Eligibility:** Player has Forgery Evidence.

Choices:

- **Suppress the rumor:** pay 35 Gold and 12 Influence; Forgery remains hidden; future Find Dirt against the player gains +10%.
- **Blame Renard's agents:** Renard relationship -15; 50% seeded public-belief outcome stored at event creation; failure costs 5 Prestige.
- **Confess embellishment:** lose 12 fabricated Claim instead of 20, Church conduct improves from severe fraud to penitent, Oswin Red Line can later be repaired.

### E15 — A Dispossessed Retinue

**Eligibility:** Any NPC lord is dispossessed; player holds Greyfen.

Choices:

- **Offer sanctuary:** lock 50 levies as security for five days; +12 relationship with dispossessed lord; grants them basing rights.
- **Fund their household:** pay 30 Gold; +8 relationship.
- **Turn them away:** -10 relationship; +3 relationship with their occupier.

### E16 — Funeral Preparations

**Eligibility:** Deathbed; player declared.

Choices:

- **Fund a royal funeral:** pay 40 Gold; +4 Prestige; +1 Church conduct.
- **Demand a Great Council be ready:** spend 12 Influence; exact private Leaning intelligence for all lords becomes one day fresher, without revealing secrets.
- **Prepare your troops instead:** lock no resources; +25 troops count as ready only for Capital defense or attack for three days; -1 Church conduct.

## 16. Systemic notifications

Systemic actions generate chronicle entries but normally do not interrupt.

Interrupt only for:

- direct attack or required defense;
- bargain offer or ultimatum addressed to the player;
- public Pledge/Commitment change;
- candidate declaration or withdrawal;
- major scandal exposure;
- territory occupation/liberation;
- Capital control change;
- royal-health phase transition;
- event requiring a choice;
- King's death.

Routine AI gifts, taxes, completed Spy attempts and relationship changes belong in the feed unless they directly affect the player.

## 17. AI failure behavior

If an AI Intent becomes invalid:

- apply the same documented fallback as the equivalent player Order;
- release unspent/locked resources according to that action;
- log the reason;
- leave the lord idle until the next decision cycle.

AI may not receive an instant replacement Intent in the same moment unless the invalidation was caused by a mandatory phase transition. This prevents hidden extra actions.

## 18. Difficulty and tuning

The first release has one difficulty.

Do not create Easy/Normal/Hard before the base simulation is balanced. Difficulty changes would obscure whether the core political rules are sound.

Balance targets are defined in `interface-content-and-production.md` and `balance-sheet.md`.