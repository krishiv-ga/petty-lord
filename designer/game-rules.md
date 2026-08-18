# Core Game Rules

## 1. Session structure

A run represents a single royal succession crisis.

- The simulation begins with **56 days on the crisis calendar**.
- At normal speed, **24 in-game hours equal 60 real seconds**.
- The player may pause at any time.
- A 2× speed is available while no mandatory decision is open.
- Mandatory decisions automatically pause the game.
- Paused time never advances Orders, AI Intents, income, events or the King's condition.

The King's exact death is seeded at run creation and occurs at a dawn between elapsed Day 49 and Day 56. The player is told that the King has roughly eight weeks, not the exact hidden day.

This gives a normal-speed run a live duration of 49–56 minutes plus paused decision time.

## 2. Simulation clock and resolution order

The simulation tracks hours, but most costs and durations are expressed in half-days or whole days.

At each dawn, resolve in this order:

1. Player and AI Orders completing at that dawn.
2. Battles, occupations and public fallout caused by those Orders.
3. Agreement, support and Church-state changes caused by completed actions.
4. Daily Gold income, levy recovery and timed-condition decay.
5. King's-health phase transition, if due.
6. King's-death check, if inside the seeded death window.
7. If the King survives, eligible ambient event check.
8. AI reaction checks and selection of new Intents for idle lords.
9. Autosave and chronicle entry generation.

If an Order completes at the same dawn the King dies, the Order resolves first. The succession then uses the resulting state. This is consistent, learnable and fair.

A mandatory decision freezes the clock before any later scheduled item resolves. The game never kills the King, completes another battle or advances an ultimatum while a decision modal is awaiting input.

## 3. Royal-health phases

### Stable — Days 56–43 remaining

The King is still governing.

- Formal candidacy and public succession Pledges are locked.
- Diplomacy, gifts, spying, court activity and Claim preparation are available.
- Offensive war is possible only by openly defying the King's Peace and accepting severe sanctions.
- The Capital cannot be marched upon.
- AI priorities remain mixed between personal interests, rivalries and preparation.

### Ailing — Days 42–29 remaining

The succession question becomes public.

- Renard declares automatically at phase start.
- The player may Declare Candidacy.
- Edric may begin considering candidacy but cannot yet declare under normal conditions.
- Public Pledges and succession bargains unlock.
- Offensive war is permitted but still violates the weakened King's Peace.
- The Capital remains protected by the royal government.

### Gravely Ill — Days 28–15 remaining

Succession becomes the dominant political question.

- AI succession Intents receive their highest normal priority.
- Pledges become harder to reverse.
- Normal offensive wars no longer suffer a King's-Peace Prestige penalty.
- Declared claimants may March on the Capital.
- Edric may declare if his candidacy conditions are met.
- Diplomacy and public attacks on legitimacy resolve faster.

### Deathbed — Days 14–0 remaining

The royal government is collapsing.

- New long preparatory schemes are locked: deep Spy operations and Claim projects cannot be started.
- Existing long schemes may finish normally.
- Diplomacy, threats, declarations, exposures and military actions take one fewer day, to a minimum of one day.
- Pledges have maximum inertia, but fear, betrayal and catastrophic shocks can still break them.
- The Capital's royal garrison is weakened.
- AI claimants prioritize the Capital, wavering votes and immediate threats.
- Physician reports become qualitative: “perhaps a week,” then “days,” then “any hour.”

The final phase must increase decision density rather than becoming a waiting period.

## 4. Headline resources and ratings

The top bar contains only five headline values.

### Gold

Spendable wealth used for gifts, court activity, schemes, patronage, escrow, mercenaries and emergency responses.

- Held hereditary territory produces automatic daily income.
- Occupied enemy territory produces only 25% of its normal income.
- Escrowed Gold is removed from the spendable pool until released.
- Gold has no hard maximum.

### Levies

Finite military manpower attached to a lord's hereditary seat.

- Levies recover slowly toward capacity while the seat is unoccupied.
- Troops committed to an Order or garrison are unavailable elsewhere.
- Battle casualties are persistent.
- Occupied territories do not recruit for the occupier.
- Mercenaries are tracked separately but displayed in the military breakdown.

### Prestige

A 0–100 public rating of importance, courage and standing.

Prestige is not spent. It affects candidacy credibility, intimidation, AI respect, political viability and tie-breaking only where explicitly stated.

### Claim

A 0–100 public rating of legal and dynastic credibility.

Claim is not spent and cannot be repeatedly farmed. It changes how lords and the Church interpret the player's candidacy and serves as a late constitutional tie-break, not a generic victory score.

Claim bands:

- 0–9: None
- 10–24: Dubious
- 25–44: Plausible
- 45–64: Strong
- 65–84: Excellent
- 85–100: Overwhelming

### Influence

Spendable political capacity used for negotiations, public declarations, threats, intrigue and elite maneuvering.

Influence is scarce but not permanently exhaustible. The player gains one point every two days, plus discrete rewards from political successes, court actions and events.

## 5. Baseline economy

Each legally held, unoccupied territory produces daily Gold equal to its Wealth rating.

- Greyfen therefore produces 2 Gold per day before conditions.
- Occupation reduces income to 25% for the occupier and zero for the legal lord.
- Tax Strain, Unrest and public concessions can further modify income.

Levy recovery per dawn is:

`floor(levyCapacity × 0.005)`, with a minimum of 1 troop while recovery is allowed.

- Tax Strain halves recovery.
- Unrest or occupation stops recovery.
- Troops committed to campaigns, aid or garrisons still count against capacity.

## 6. Order capacity

The player has exactly **two active Order slots**.

An Order represents a sustained initiative such as negotiation, spying, claim-building, court activity or military preparation.

Rules:

- Costs are paid when an Order begins unless its definition says otherwise.
- Cancelling an Order never refunds time.
- Gold and Influence refunds are action-specific and normally zero.
- Troops committed to a cancelled military Order return if battle has not begun, but logistical Gold is lost.
- Every Order validates both when started and when resolved.
- If external events make the original result impossible, the Order follows its documented fallback rather than silently failing or crashing.

### Reactions

Reactions do not consume Order slots.

Examples:

- choosing how to defend an invasion;
- answering an ultimatum;
- accepting or refusing a bargain;
- resolving an event choice;
- breaking an agreement;
- deciding whether to maintain a mercenary contract;
- withdrawing an occupation.

The player must never be unable to defend Greyfen merely because both Order slots contain political schemes.

## 7. Player action families

The first release uses eleven base action families. Contextual variants share the same underlying rules and UI.

### 7.1 Send Gift

**Target:** A lord  
**Duration:** 1 day  
**Cost:** Choose 20, 40 or 80 Gold

Effects:

- Improves personal relationship.
- May make negotiation thresholds easier.
- Never directly creates a Pledge.
- Gifts to the same target within 14 days have sharply diminishing relationship effects.
- A third gift inside 14 days is refused and the Gold is not spent.

### 7.2 Offer Bargain

**Target:** A declared kingmaker lord  
**Duration:** 2 days  
**Cost:** 10 Influence plus any selected immediate collateral

The player selects or responds to one of the target's valid bargain terms. Bargains can reserve unique offices, lock Gold, commit troops, impose public policy or demand a hostile act against another candidate.

A future reward alone can create or strengthen a Leaning. A Pledge requires that the target's proof and meaningful present collateral are satisfied.

### 7.3 Request Declaration

**Target:** A lord currently Leaning toward the player  
**Duration:** 2 days; 1 in Deathbed  
**Cost:** 12 Influence

Attempts to convert a Leaning into a public Pledge.

- If proof and bargain conditions are met, the target Pledges.
- If the request is premature, it fails, damages trust slightly and applies a 7-day refusal cooldown.
- A major political shock can clear the cooldown.

### 7.4 Threaten

**Target:** A lord or, contextually, a rival claimant  
**Duration:** 2 days; 1 in Deathbed  
**Cost:** 12 Influence

Requires credible leverage: overwhelming adjacent force, occupation of the target's seat or a devastating secret.

Possible outcomes:

- Pledge Under Duress;
- withdrawal from a war or candidacy;
- payment or concession;
- refusal and counter-mobilization.

Coerced support lasts only while the threat remains credible, can never become Committed, and increases containment behavior among other lords.

### 7.5 Spy

Two modes share one action family.

**Watch Court**  
Duration 3 days; cost 20 Gold and 8 Influence. Always reveals the target's current Intent, private Leaning and exact known military availability. Political-intent intelligence becomes stale after seven days.

**Find Dirt**  
Duration 5 days; cost 30 Gold and 12 Influence. Uses a deterministic contested check with seeded variance. Success discovers one available secret; partial failure returns lesser intelligence; detected failure damages the relationship and alerts the target.

Deep Spy cannot begin during Deathbed.

### 7.6 Build Claim

Two once-per-run projects share one action family.

**Research Lineage**  
Duration 6 days; cost 35 Gold and 12 Influence; grants +12 Claim with no fraud secret.

**Forge Royal Descent**  
Duration 8 days; cost 50 Gold and 25 Influence; grants +25 Claim and creates discoverable Forgery Evidence against the player.

Neither project may begin during Deathbed. Claim gains are capped at 100.

### 7.7 Expose Secret

**Target:** Holder of a discovered secret  
**Duration:** 2 days; 1 in Deathbed  
**Cost:** 10 Influence

Publishes the secret and applies its authored consequences to Claim, Prestige, Church standing, relationships, support shocks or military behavior.

A discovered secret can be exposed once. Exposure is public and normally makes the target permanently hostile.

### 7.8 Invade Territory

**Target:** An adjacent hereditary seat or occupied territory  
**Duration:** 3 days; 2 in Deathbed  
**Cost:** 10 Gold logistics plus committed troops and optional mercenary contract

The defender receives an immediate reaction when the campaign becomes public. The battle resolves at Order completion. Winning occupies the target only if the attacker can supply the required garrison.

Detailed battle and occupation rules are in `war-and-occupation.md`.

### 7.9 Raise Taxes

**Target:** Greyfen  
**Duration:** 1 day

Immediately receives 14 days of Greyfen's current gross income and applies Tax Strain for 21 days.

If Greyfen is already under Tax Strain:

- receives only 7 days of gross income;
- upgrades the territory to Unrest for 21 days;
- cannot be used again until Unrest ends.

Tax Strain reduces income and levy recovery by 50%. Unrest reduces income by 75%, stops levy recovery and weakens Fortification by one.

The action is unavailable while Greyfen is occupied.

### 7.10 Hold Court

**Duration:** 3 days; 2 in Deathbed  
**Cost:** 60 Gold  
**Invitees:** Up to two lords

Effects:

- +8 Prestige;
- +10 Influence;
- relationship improvement with invitees;
- may create a contextual political opportunity.

A second Court within 21 days grants half Prestige and Influence. A third is unavailable until the cooldown ends.

During Deathbed the presentation becomes an emergency council rather than a feast.

### 7.11 Patronize the Church

**Duration:** 4 days; 3 in Deathbed  
**Cost:** 50 Gold

Effects:

- records public Church Patronage;
- improves Oswin's relationship;
- advances the player's Church consideration by one state where legally eligible;
- may satisfy part of Oswin's bargain.

The full institutional benefit can occur only once. Repetition grants only a small relationship improvement and is unavailable within 21 days.

## 8. Contextual actions

These do not count as additional base systems.

### Declare Candidacy

Available from Ailing onward.

- Duration: 1 day.
- Cost: 20 Influence.
- Irreversible.
- Unlocks Pledges, public succession bargaining and the Capital action.
- Renard immediately treats the player as a rival.
- Claim below 10 produces the public condition **Laughable Pretender**, reducing initial viability and Church standing.

The player cannot win without declaring, except through no hidden alternative.

### March on the Capital

A specialized invasion available to declared claimants from Gravely Ill onward. It follows military rules but fights the royal or occupying garrison and creates usurpation consequences.

### Break Agreement

Immediate reaction.

- Ends the agreement and releases locked resources where its terms permit.
- Usually collapses the associated support.
- Applies authored relationship loss, Prestige loss and the Oathbreaker history flag.

### Withdraw Occupation

Immediate reaction if no battle is pending.

- Releases the garrison after one travel day.
- Restores physical control to the legal lord.
- Does not undo casualties, threat history or relationship damage.

## 9. Anti-spam rules

Anti-spam is expressed through consequences and target cooldowns rather than a universal artificial cooldown layer.

- Gifts diminish for 14 days.
- Failed support requests lock the same target for 7 days.
- Taxes escalate from Strain to Unrest.
- Court activity diminishes for 21 days.
- Church patronage has one full institutional benefit.
- Each Claim project is once per run.
- Repeated spying on the same target within 10 days increases detection by one band.
- Threaten may target the same lord only once per royal-health phase unless a new leverage source is acquired.
- Offensive wars accumulate threat and political history even after occupations end.

## 10. Game-end trigger

The instant the King dies:

1. All new Orders and reactions lock.
2. Any effects already resolved at that dawn remain.
3. The game checks military acclamation.
4. If no claimant qualifies, the Council succession procedure runs.
5. The ending report explains the route, every vote, every tie-break, outstanding obligations, wars, casualties and decisive political shocks.

No post-coronation simulation occurs in the first release.