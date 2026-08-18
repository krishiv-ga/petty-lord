# Rival AI, Information and Events

## 1. AI goal and capacity

Rivals should appear purposeful, bounded and readable. Each NPC has exactly one major Intent at a time and uses the same resource, duration and availability rules as the player unless an authored advantage says otherwise.

Reactions do not consume Intent: defense, bargain response, renewal, Red Line break, ultimatum and event choice.

## 2. Intent state

Each Intent stores:

- action/target;
- start/completion;
- sequenceId;
- costs and committed troops;
- visibility;
- invalidation fallback;
- all seeded values and snapshots.

AI cannot spend resources already locked in an Intent, agreement or garrison.

## 3. Knowledge

### Public

Candidates, public Pledges/Commitments, public Under Duress basis, public bargains/policies, Claim, Church, control, campaigns, army bands, Prestige and conduct.

### Private to actor

Own exact state, direct bargains, discovered secrets, Spy results, communicated Leanings, exact incoming force after campaign is public, and any blackmail agreement involving that actor.

### Forbidden unless discovered

Player Order target, exact player Gold/Influence, hidden Leanings/negotiations, private blackmail between others, Forgery Evidence, future RNG/death and UI/pause behavior.

A private blackmailed Pledge appears ordinary to an uninformed rival. Church and AI react only to coercion they know.

## 4. Military knowledge

Army bands:

- Broken0–149;
- Modest150–299;
- Strong300–499;
- Formidable500+.

Fresh Watch Court reveals exact for7 days. Observer-specific threat and Yield use knowledge estimates defined in `war-and-occupation.md`, never hidden true force or fortune.

## 5. Intent visibility

- Hidden: private preparation.
- Suspected: public clue.
- Public: campaign, public courtship, Patronage, exposure, Pledge request.

Campaign public after12 hours. Fresh Watch Court may reveal immediately.

## 6. Decision cycle

When idle at dawn or after major shock:

1. remove illegal/unaffordable/impossible;
2. add mandatory Red Line/defense/obligation responses;
3. evaluate candidate politics using `candidate-evaluation.md`;
4. score legal Intent families by phase, Desire, Fear, support and known threat;
5. target using actor knowledge only;
6. apply ±5% seeded near-tie noise;
7. commit resources and snapshots.

Noise cannot violate rules.

## 7. Intent priority classes

When several needs exist, use this base order before personality modifiers:

1. defend own seat / stop immediate loss: 100;
2. prevent an opponent's visible Military Acclamation: 95;
3. fulfill or answer triggered agreement: 90;
4. repair active Red Line/breach where possible: 85;
5. save own candidacy from imminent elimination: 80;
6. secure or preserve decisive Pledge: 70;
7. expose decisive held secret in Gravely/Deathbed: 65 / 85;
8. March on Capital in Gravely/Deathbed: 50 / 75;
9. undermine most relevant rival: 55;
10. strategic war/liberation: 45;
11. Spy/Claim/Church preparation: 35;
12. economy/relationship cultivation: 25.

Personality adds -20…+20. A cheaper lower class may win only when higher class is impossible, unaffordable or scores within5 after modifiers.

## 8. Personality summaries

- Renard: legitimacy → Oswin/Ysabel → contain rival → Southmere → force.
- Edric: military threats/opportunity → preserve army → strong-candidate bargain → declare → Capital.
- Ysabel: Eastvale/wealth → identify winner → collateral → coalition → temporary submission.
- Oswin: Church defense → legitimacy → lawful candidate → expose fraud → resist coercion.
- Mara: weaken Crown → Westmarch → exploit rival conflict → concrete autonomy → resist conqueror.

## 9. Player relevance

AI does not target only vote leader. Player becomes relevant through public supporters, rapid Claim, Church status, Capital, victory, Serious threat, occupation or bargaining momentum. Each lord notices only their thematic evidence and current knowledge.

## 10. NPC bargains

Use player agreement rules:

- one support target;
- per-candidate office uniqueness;
- collateral only on acceptance;
- maturation/inertia;
- no ordinary override of Commitment;
- private blackmail visible only to parties/discoverers.

## 11. Deterministic randomness

One stored64-bit seed determines opening package, guaranteed Renard vulnerability, two other secrets, relationship variation, AI near ties, events, battle fortune, Spy checks and death.

Every scheduled item stores sequenceId. Save includes RNG state and stored draws. Refresh cannot reroll.

## 12. Event cadence

Mandatory phase events plus at most six ambient choices.

Windows around elapsed days6–10,14–18,22–26,30–34,38–42,45–49. Choose one eligible unused event. Defer if major decision/battle that dawn. Maximum one choice interruption per24h. Every event has zero-Gold option.

## 13. Authored events

### E01 Prognosis

Run start mandatory. Clock, pause, Orders, objective and forecast.

### E02 King Takes to Bed

Ailing mandatory. Renard declares; candidacy/Pledges unlock.

### E03 Last Council

Gravely mandatory. King's Peace collapse and Capital unlock.

### E04 Deathbed

Deathbed mandatory. Long-scheme lock, short-action acceleration and uncertain prognosis.

### E05 Failed Harvest

Greyfen unoccupied/no Unrest.

- Buy grain:30 Gold, +3 Prestige.
- Open granaries: lose7 days Greyfen income, +5 Mara relationship, +2 Prestige.
- Villages bear: Tax Strain14 days, -4 Prestige.

### E06 Northern Raiders

Stable/Ailing; Edric/Mara hold seats.

- send100 levies3 days; stored uniform integer0–20 casualties; +6 Edric; Proof progress;
- pay25 Gold; +3 Edric/+3 Mara;
- stay out; Edric–Mara -5 and border Intent weight.

### E07 Forgotten Genealogy

Player has not completed both Claim projects.

- pay35 Gold: +6 safe Claim;
- spend10 Influence: +4 Claim, or +2 if Oswin Cold;
- sell to Ysabel: +25 Gold/+5 relationship.

### E08 Saint's Hand

Abbeylands unoccupied.

- sponsor25: +1 Church conduct/+5 Oswin;
- attend: +2 Oswin;
- dismiss: +3 Mara/-1 Church conduct.

### E09 Unpaid Capital Guard

Before/at Gravely; Capital royal.

- pay50: Guard Favor, future royal garrison -75 for player;
- tell Renard: +6 relationship; he may fund;
- ignore: draw/store result now — 50% no change,25% -25 garrison,25% -50 at Deathbed.

### E10 Renard's Progress

Ailing; Southmere held.

- attend: +4 Renard/-2 Mara, exact public Claim case;
- spies15 Gold: one-use +10 Find Dirt against Renard; detection causes -5 Renard relationship;
- mock: +3 Prestige if current Prestige≥25, otherwise -3; Renard -10.

### E11 Provincial Liberties

No Greyfen Charter.

- support: Greyfen income ×0.90 remainder; +8 Mara/-4 Edric/-3 Oswin;
- defend Crown: +5 Edric/+4 Renard/-10 Mara;
- avoid: next Offer Bargain with Mara costs +10 Influence.

This does not satisfy full Charter Proof.

### E12 Hawk's Tournament

Edric holds Northkeep; not Deathbed.

- sponsor30: stored50% high (+5 Prestige/+6 Edric) or50% low (+2 Prestige);
- send75 levies2 days: +5 Edric and Proof progress;
- decline: -2 Edric.

### E13 Merchant Syndicate Loan

Eligibility: Stable/Ailing, elapsed Day≤27, Gold<80, Ysabel not Hostile.

- **Borrow:** +80 Gold; schedule mandatory repayment exactly14 days later.
- **Political Access:** +45 Gold and record `YsabelAccessDebt`.
- **Refuse:** none.

#### Repayment decision

- Repay105 Gold if available.
- Default if chosen or unaffordable: set spendable Gold to0, -12 Prestige, -25 Ysabel relationship, Greyfen income ×0.50 remainder, public Defaulted Debtor and one Debt Leverage use for Ysabel equivalent to devastating blackmail.

#### Access Debt

Consumed when one Ysabel bargain is accepted:

- Escrow80→100;
- Chancellorship budget40→60;
- Protection100→150 troops.

### E14 Rumor of False Blood

Player has Forgery Evidence.

- suppress35 Gold/12 Influence: remains hidden; future discovery +10 percentage points;
- blame Renard: draw/store50% result. Success keeps evidence hidden and Renard relationship -15. Failure player -5 Prestige and future discovery +20 percentage points;
- confess embellishment: remove12 fabricated Claim, -5 Prestige, penitent repair after3 days.

### E15 Dispossessed Retinue

NPC dispossessed; player holds Greyfen.

- sanctuary: lock50 levies5 days, +12 relationship/basing;
- fund30 Gold, +8;
- refuse: -10 lord/+3 occupier.

### E16 Funeral Preparations

Deathbed; player declared.

- fund40: +4 Prestige/+1 Church conduct;
- Great Council12 Influence: reveal current Leaning of every unpledged lord at that moment only, timestamped;
- prepare troops: create25 temporary Capital-only troops for3 days, -1 Church conduct. They expire absolutely; if garrison falls below200, Capital control ends.

## 14. Systemic notifications

Interrupt only direct attack/defense, addressed bargain/ultimatum, Pledge/Commitment change, declaration/withdrawal, scandal, occupation/Capital change, phase, choice event, repayment decision, Greyfen vote and death.

Routine AI actions belong in chronicle.

## 15. Invalid AI Intent

Use same fallback as player, release resources per action and log. AI waits until next decision cycle; no free replacement except phase-transition invalidation.

## 16. Forecast safety

Forecast receives `PlayerKnowledgeProjection`, never true hidden state. Tests fail on access to unknown Leaning, Intent, secret, exact army or private blackmail.

## 17. Difficulty

One difficulty until base simulation is tuned.