# Core Game Rules

## 1. Session structure

A run is one royal succession crisis.

- The simulation begins with **56 days on the crisis calendar**.
- At normal speed, **24 in-game hours equal 60 real seconds**.
- Controls are pause, 1× and 2×.
- A mandatory decision automatically pauses the game.
- Hiding/backgrounding the browser tab auto-pauses; no wall-clock catch-up occurs.

The King's exact death dawn is selected and stored at run creation between elapsed Day 49 and Day 56. The player is told that the King has roughly eight weeks, not the hidden date. A run therefore contains 49–56 live minutes at 1× plus paused thinking time.

## 2. Deterministic scheduler

The simulation tracks hours. Most actions last whole or half days.

Every scheduled item stores:

- due time;
- priority class;
- monotonically increasing `sequenceId` assigned at creation;
- all seeded random factors needed at resolution.

Resolve by due time, then priority class, then lower sequenceId. Earlier-created work therefore resolves first when timestamps match; object iteration order never decides a political outcome.

At each dawn:

1. resolve due player Orders and AI Intents;
2. resolve battles, occupations and public fallout created by them;
3. update agreements, support, Church and territory control;
4. apply contract expiry, timed-condition decay, fractional Gold income and fractional levy recovery;
5. apply health-phase transition;
6. check the stored King's-death dawn;
7. if alive, check the ambient-event window;
8. select new AI Intents for idle lords;
9. autosave and write chronicle entries.

An Order due on the death dawn resolves before death. A later Order does not. A pending mandatory decision freezes the scheduler before any later item resolves.

## 3. Royal-health phases

### Stable — Days 56–43 remaining

- Formal candidacy and public Pledges are locked.
- Gifts, spying, court activity and Claim preparation are available.
- Offensive war requires openly defying the King's Peace and severe sanctions.
- The Capital cannot be attacked.

### Ailing — Days 42–29 remaining

- Renard declares automatically.
- The player may Declare Candidacy.
- Public bargains and Pledges unlock.
- Offensive war is possible but still breaches the King's Peace.
- The Capital remains protected.

### Gravely Ill — Days 28–15 remaining

- Succession becomes the dominant AI priority.
- Pledges have greater inertia.
- Normal offensive war loses its flat King's-Peace Prestige penalty.
- Declared claimants may March on the Capital.
- Edric may declare if his conditions are met.

### Deathbed — Days 14–0 remaining

- New long preparations are locked: Find Dirt and Claim projects cannot start.
- Existing long Orders may finish on their original schedule.
- Diplomacy, Threaten, Expose and military Orders started now take one fewer day, minimum one day.
- Existing Orders do not shorten retroactively.
- Pledges have maximum inertia.
- The Capital garrison weakens.
- AI prioritizes the Capital, immediate votes, exposed secrets and emergency defense.

The final phase must contain more urgent decisions per minute, not a waiting period.

## 4. Headline resources and ratings

### Gold

Spendable wealth for court, schemes, gifts, collateral, patronage, mercenaries and reactions.

- Legal unoccupied seats produce automatic income.
- Occupied seats produce 25% of normal Wealth for the occupier and none for the legal lord.
- Escrow is removed from spendable Gold.
- Fractional income accumulates internally; a whole Gold becomes spendable when the accumulator reaches 1.
- The top bar shows whole spendable Gold; tooltips show exact daily rates.

### Levies

Finite hereditary manpower.

- Casualties persist.
- Committed troops and garrisons are unavailable elsewhere.
- Occupied seats recruit for nobody.
- Recovery uses a fractional accumulator; there is no artificial one-troop-per-day minimum.
- Mercenaries are tracked separately in the military breakdown.

### Prestige

A public 0–100 rating. It is not spent. It affects respect, intimidation, candidate viability and only the explicit constitutional tie-break where named.

### Claim

A public 0–100 legal rating. It is not spent and cannot be farmed repeatedly.

- 0–9: None
- 10–24: Dubious
- 25–44: Plausible
- 45–64: Strong
- 65–84: Excellent
- 85–100: Overwhelming

### Influence

Spendable political capacity.

- Gain **1 Influence every dawn** while not under a specific blocking condition.
- Maximum 100.
- Additional gains come from court, political success and events.

## 5. Baseline economy

Daily legal income equals territory Wealth plus trait modifiers, multiplied by conditions.

Levy recovery per dawn is added to a fractional accumulator:

`levyCapacity × 0.005 × active modifiers`

Whole troops become available when the accumulator crosses 1.

- Tax Strain: income ×0.50 and levy recovery ×0.50.
- Unrest: income ×0.25, levy recovery 0, Fortification -1.
- Occupation: legal income/recovery 0; occupier income ×0.25; no occupier recovery.
- Greyfen Charter: Greyfen income and recovery ×0.75 for the rest of the run.

## 6. Order capacity and reactions

The player has exactly **two active Order slots**. Each NPC has one major Intent.

Order rules:

- ordinary action costs are paid at start;
- every Order validates at start and resolution;
- duration is fixed at creation;
- cancellation never refunds time;
- refunds are action-specific and normally zero;
- locked campaign troops return if cancelled before battle, but logistics Gold is lost;
- invalidated Orders follow an explicit fallback and write a chronicle reason.

### Bargain exception

Offer Bargain pays only its negotiation Influence at start. Gold escrow, troop locks, policy concessions and office reservations apply only if the target accepts at resolution. If the target becomes unavailable, negotiation Influence is lost but collateral is untouched.

### Reactions

Reactions do not use Order slots:

- defend or yield;
- answer ultimatum/bargain;
- choose event response;
- renew mercenaries;
- break an agreement;
- withdraw an occupation;
- resolve a queued mandatory decision.

Once collateral is accepted, it belongs to an Agreement and cannot be cancelled as an Order. Ending it requires Break Agreement and its full consequences.

## 7. Player action families

### 7.1 Send Gift

- Target: lord
- Duration: 1 day
- Gold: 20 / 40 / 80
- Relationship: +4 / +8 / +12

A second gift to the same lord inside 14 days gives half effect. A third is refused and not charged. Gifts never directly create a Pledge.

### 7.2 Offer Bargain

- Target: kingmaker
- Duration: 2 days
- Start cost: 8 Influence

At resolution the target accepts, counters or refuses according to current state. Accepted present collateral is then applied. A future office or land promise can strengthen a Leaning but cannot create a Pledge without current Proof and collateral.

A voluntary defection bargain with a lord already Pledged elsewhere is legal only under the gates in `politics-and-succession.md`.

### 7.3 Request Declaration

- Target: lord Leaning toward the player
- Duration: 2 days; 1 in Deathbed
- Cost: 8 Influence

A voluntary Leaning must have persisted for:

- 2 full days in Ailing;
- 3 full days in Gravely Ill;
- 4 full days in Deathbed.

The current phase's requirement applies; earlier Leaning time counts. A Commitment-grade shared-risk event may waive maturation for that lord.

At resolution:

- if Leaning, Proof, collateral and maturation still pass: Pledge;
- if external events removed the Leaning after start: fail, -2 relationship, no cooldown;
- if the player began prematurely: fail, -4 relationship and 7-day refusal cooldown.

### 7.4 Threaten

- Duration: 2 days; 1 in Deathbed
- Cost: 12 Influence

Credible leverage must exist at start and resolution: overwhelming adjacent military force, occupation of the target's seat or a devastating secret.

Possible results include Pledge Under Duress, withdrawal, concession, refusal or counter-mobilization.

- Coerced support breaks when leverage breaks.
- It cannot become Committed.
- A valid Commitment cannot be replaced by ordinary coercion.
- One secret can support one successful private blackmail agreement; it may still be exposed later but cannot be reused for another Threaten success.

### 7.5 Spy

**Watch Court**

- 3 days
- 20 Gold, 8 Influence
- guaranteed current Intent, private Leaning and exact current military availability
- political intelligence becomes stale after 7 days

**Find Dirt**

- 5 days
- 30 Gold, 12 Influence
- deterministic contested result using values snapshotted at start
- success discovers one undiscovered secret
- partial failure returns lesser intelligence
- repeated attempts within 10 days increase detection risk, not discovery defense
- cannot start in Deathbed

### 7.6 Build Claim

**Research Lineage**

- 6 days
- 35 Gold, 12 Influence
- +12 safe Claim
- once per run

**Forge Royal Descent**

- 8 days
- 50 Gold, 25 Influence
- +25 Claim
- creates Forgery Evidence
- once per run

Neither can start in Deathbed.

### 7.7 Expose Secret

- 2 days; 1 in Deathbed
- 10 Influence

Publishes one discovered secret and applies its authored consequences. A secret can be exposed once.

### 7.8 Invade Territory

- 3 days; 2 in Deathbed
- 10 Gold logistics
- committed levies and optional mercenary contracts

The defender receives a mandatory reaction after the campaign becomes public. Victory occupies only when the required garrison can be assigned. See `war-and-occupation.md`.

### 7.9 Raise Taxes

- 1 day
- Greyfen must be unoccupied

First use while unstrained:

- gain 14 days of current gross Greyfen income immediately;
- apply Tax Strain for 21 days.

Use during Tax Strain:

- gain 7 days of current gross income;
- replace Strain with Unrest for 21 days;
- unavailable until Unrest ends.

### 7.10 Hold Court

- 3 days; 2 in Deathbed
- 60 Gold
- invite up to two lords
- +8 Prestige
- +10 Influence
- relationship improvement

Second use inside 21 days gives half Prestige/Influence. Third is locked until cooldown ends.

### 7.11 Patronize Church

- 4 days; 3 in Deathbed
- 50 Gold

Creates public Patronage, improves Oswin's relationship and adds the institutional Church modifier once. Repeated use inside 21 days is unavailable; later repetition gives only a small relationship effect.

## 8. Contextual actions

### Declare Candidacy

- Available from Ailing
- 1 day
- 15 Influence
- irreversible

Unlocks succession bargaining, Pledges and March on the Capital. Renard treats the player as a rival. Claim below 10 creates Laughable Pretender.

### March on the Capital

Specialized invasion from Gravely Ill onward. See military rules.

### Break Agreement

Immediate reaction. Ends obligations according to the agreement, normally collapses associated support, applies -8 Prestige, partner relationship loss and Oathbreaker history.

### Withdraw Occupation

Immediate if no battle is pending. Garrison returns after one travel day; legal lord regains physical control.

### Confess and Seek Penance

Available after exposed Forgery causes Condemnation.

- 3 days
- 40 Gold, 10 Influence
- -5 Prestige
- does not restore removed Claim
- on completion removes the fraud-based Condemnation and sets Church stance to at most Skeptical
- clears Oswin's fraud Red Line, but not relationship/support damage

## 9. Anti-spam

- gifts diminish for 14 days;
- failed premature Declaration requests lock target 7 days;
- taxes escalate to Unrest;
- Court diminishes for 21 days;
- Church Patronage gives one full institutional benefit;
- Claim projects are once per run;
- repeated Find Dirt raises detection;
- Threaten may target the same lord once per phase unless a new leverage source appears;
- a secret blackmails successfully once;
- offensive-war history continues to affect threat after withdrawal.

## 10. Game end

When the King dies:

1. lock new player/AI initiatives;
2. keep all effects resolved earlier that dawn;
3. validate occupations, garrisons, contracts, coercion and Church state;
4. check Military Acclamation;
5. otherwise run the Council procedure;
6. produce the full ending reconstruction.

There is no post-coronation simulation in the first release.