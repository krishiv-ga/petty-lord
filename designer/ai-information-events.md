# Rival AI, Information and Events

## 1. AI goal

Rivals must appear purposeful, bounded and readable. Each pursues one meaningful plan, spends real resources, reacts to shocks and knows only permitted information.

## 2. Capacity and fairness

Each NPC has exactly **one major Intent**.

Intent stores action, target, start/completion, sequenceId, costs, committed troops, visibility, resolution fallback and all seeded factors.

Reactions do not consume the Intent: defense, bargaining response, mercenary renewal, Red Line break, ultimatum and event choice.

AI uses player action costs/durations unless authored advantage explicitly changes them. It cannot spend locked resources.

## 3. Knowledge

### Public to all

- candidates;
- public Pledges/Commitments/bargains/policies;
- Claim and Church stance;
- territory control and campaigns;
- approximate army bands;
- Prestige and conduct.

### Private to actor

- own exact state/Intent;
- bargains addressed to actor;
- discovered secrets;
- Spy results;
- communicated Leanings;
- exact incoming force once campaign public.

### Forbidden unless discovered

- player Order target;
- exact player Gold/Influence;
- hidden Leanings/negotiations;
- Forgery Evidence;
- future RNG/death;
- UI/pause behavior.

## 4. Army information

- Broken: 0–149
- Modest: 150–299
- Strong: 300–499
- Formidable: 500+

Fresh Watch Court reveals exact breakdown for7 days; afterward marked stale.

## 5. Intent visibility

- Hidden: private preparation.
- Suspected: visible clues.
- Public: army march, public courtship, Patronage, exposure, Pledge request.

Campaign public after12 hours. Fresh Watch Court may reveal at start.

## 6. Decision cycle

When idle at dawn or after major shock:

1. remove illegal/unaffordable/impossible actions;
2. insert mandatory Red Line/defense/obligation responses;
3. score Intent families by phase, Desire, Fear, support and threat;
4. target using actor knowledge only;
5. apply ±5% seeded near-tie noise;
6. commit resources and snapshot all contested values/random factors.

Noise cannot violate Red Lines or affordability.

## 7. Intent vocabulary

- relationship cultivation;
- bargain/obligation;
- Request Declaration;
- Threaten;
- Watch Court/Find Dirt;
- build/defend Claim;
- Expose Secret;
- raise funds;
- Hold Court;
- Patronize Church;
- prepare/launch war;
- liberate seat;
- March Capital;
- fulfill Commitment;
- undermine most relevant rival.

Personality restricts use. Oswin does not military-threaten; Ysabel rarely attacks without direct fear; Edric does not spam gifts.

## 8. Phase priorities

### Stable

economy, spying, grievances, relationships, Claim, rare rebellion.

### Ailing

Renard seeks Pledge/Church; kingmakers assess candidates; bargains open.

### Gravely

succession primary; undermine rivals; war/Capital consideration; Edric may declare.

### Deathbed

immediate votes, Capital, defense, exposures, coercion, rescue of wavering support. No new long preparation.

## 9. Personality priorities

### Renard

legitimacy → Oswin/Ysabel → contain plausible rival → protect Southmere → force when politics insufficient.

### Edric

military threat/opportunity → preserve decisive army → bargain with strong candidate → declare if favorite collapses → Capital.

### Ysabel

preserve Eastvale/Gold → identify winner → extract collateral → fund coalition → temporary submission under overwhelming force.

### Oswin

defend Church → investigate legitimacy → lawful candidate → expose fraud/impiety → resist coercion.

### Mara

weaken Crown → defend Westmarch → exploit Edric/Renard conflict → support concrete autonomy → resist conqueror.

## 10. Player threat targeting

AI does not merely attack vote leader. A player becomes relevant through two supporters, rapid Claim, Church status, Capital, major victory, Serious military threat, occupation or visible bargaining momentum.

Each lord notices different evidence. This prevents safe second-place hoarding without eliminating risky late coups.

## 11. NPC bargaining

Same agreement/support rules as player:

- one succession target;
- per-candidate office uniqueness;
- collateral removed only on acceptance;
- real resources;
- normal maturation/inertia;
- no Commitment override by ordinary bargain/coercion.

## 12. Deterministic randomness

One stored64-bit seed determines opening package, guaranteed Renard vulnerability, two other secrets, relationship variation, near-tie AI choices, events, battle fortune, Spy checks and death dawn.

- draw once/store result;
- preserve RNG state in save;
- refresh never rerolls;
- ending displays seed;
- same build+seed+choices reproduces run.

Every scheduled item also stores sequenceId for same-time resolution.

## 13. Event cadence

Mandatory phase events plus at most six ambient choice events.

Seeded windows around elapsed days:

- 6–10
- 14–18
- 22–26
- 30–34
- 38–42
- 45–49

Choose one eligible unused event. Defer one day if a major decision/battle occurred. Max one choice interruption per24h. Every event has a zero-Gold option.

## 14. Authored events

### E01 Prognosis

Run start; mandatory. Explains eight weeks, pause, Orders and forecast.

### E02 King Takes to Bed

Ailing; mandatory. Renard declares; candidacy/Pledges unlock.

### E03 Last Council

Gravely; mandatory. King's Peace collapse and Capital unlock.

### E04 Deathbed

Deathbed; mandatory. Long-scheme lock, action acceleration and uncertain prognosis.

### E05 Failed Harvest

Greyfen unoccupied/no Unrest.

- Buy grain:30 Gold, +3 Prestige.
- Open granaries: lose7 days Greyfen income, +5 Mara relationship, +2 Prestige.
- Let villages bear: Tax Strain14 days, -4 Prestige.

### E06 Northern Raiders

Stable/Ailing; Edric/Mara hold seats.

- send100 levies3 days, 0–20 stored casualties, +6 Edric, military Proof;
- pay25 Gold, +3 Edric/+3 Mara;
- stay out, Edric–Mara -5 and border Intent weight.

### E07 Forgotten Genealogy

Player has not completed both Claim projects.

- pay35 Gold: +6 safe Claim;
- spend10 Influence: +4 Claim, only+2 if Oswin Cold;
- sell to Ysabel: +25 Gold/+5 relationship.

Never required for Claim route.

### E08 Saint's Hand

Abbeylands unoccupied.

- sponsor25 Gold: +1 Church conduct/+5 Oswin;
- attend: +2 Oswin;
- dismiss: +3 Mara/-1 Church conduct.

### E09 Unpaid Capital Guard

Before/at Gravely; Capital royal.

- pay50: Capital Guard Favor, future royal garrison -75 for player;
- tell Renard: +6 relation, he may fund;
- ignore: stored 25–50 garrison loss possibility at Deathbed.

### E10 Renard's Progress

Ailing; Southmere held.

- attend: +4 Renard/-2 Mara, exact public Claim case;
- spies15 Gold: one-use +10 Find Dirt against Renard, detection risk;
- mock: +3 Prestige if Prestige≥25 else -3; Renard -10.

### E11 Provincial Liberties

No Greyfen Charter.

- support: lighter10% income reduction, +8 Mara, -4 Edric/-3 Oswin;
- defend Crown: +5 Edric/+4 Renard/-10 Mara;
- avoid: Mara next bargain +10 Influence difficulty.

Does not replace full Charter Proof.

### E12 Hawk's Tournament

Edric holds Northkeep; not Deathbed.

- sponsor30: stored contest, +5 Prestige/+6 Edric or +2 Prestige;
- send75 levies2 days: +5 Edric/Proof;
- decline: -2 Edric.

### E13 Merchant Loan

**Eligibility:** Stable or Ailing only, elapsed Day≤27, Gold<80, Ysabel not Hostile.

- borrow80; repay105 in14 days; default -8 Prestige/-15 Ysabel and leverage;
- political access: +45 Gold, Ysabel bargain one tier harder;
- refuse.

Due date always precedes earliest death.

### E14 Rumor of False Blood

Player has Forgery Evidence.

- suppress35 Gold/12 Influence; future Find Dirt detection risk rises;
- blame Renard: -15 relationship and stored belief outcome;
- confess embellishment: lose12 fabricated Claim, penitent state, cheaper than post-exposure Penance.

### E15 Dispossessed Retinue

NPC dispossessed; player holds Greyfen.

- sanctuary: lock50 levies5 days, +12 relation/basing;
- fund30 Gold, +8 relation;
- refuse: -10 lord/+3 occupier.

### E16 Funeral Preparations

Deathbed; player declared.

- fund40: +4 Prestige/+1 Church conduct;
- demand Great Council12 Influence: reveal current Leaning of every unpledged lord at that moment only; timestamped, no Intent/secret/bargain;
- prepare troops: +25 temporary Capital-only readiness3 days/-1 Church conduct.

## 15. Systemic notifications

Interrupt only direct attack/defense, addressed bargain/ultimatum, Pledge/Commitment change, declaration/withdrawal, major scandal, occupation/Capital change, phase, choice event and death.

Routine AI gifts/taxes/spy completions go to chronicle.

## 16. Invalid AI Intent

Use same fallback as player action, release resources accordingly, log reason, remain idle until next decision cycle. No instant free replacement except phase-transition invalidation.

## 17. Forecast information safety

The succession forecast receives a `PlayerKnowledgeProjection`, never authoritative lords/support/secrets. Tests must fail if unknown Leaning, secret or Intent is read.

## 18. Difficulty

One difficulty only. Tune core before modes.