# WP-020 — Time, Royal Health, Economy, Orders and Common Actions

- **Status:** Blocked by WP-019
- **Wave:** 2
- **Execution:** Parallel-safe within Wave 2
- **Depends on:** WP-019
- **May run with:** WP-021, WP-022, WP-023
- **Must not run with:** WP-029 or any Wave 3 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$critic`
- **Critic:** Required
- **Integrator:** WP-029
- **Release impact:** Headless checkpoint candidate

## Objective

Implement the game’s temporal and material backbone: 56-day crisis clock, seeded death window, health phases, dawn resolution hooks, Gold/Levies/Influence/ratings plumbing, territory income and recovery, two player Order slots, reactions, cancellation/invalidation, anti-spam infrastructure, and the common realm/diplomatic actions that do not own politics, war or intelligence.

## Canonical inputs

- [`designer/game-rules.md`](../designer/game-rules.md)
- [`designer/balance-sheet.md`](../designer/balance-sheet.md)
- relevant economy/time sections of [`designer/world-and-actors.md`](../designer/world-and-actors.md)
- kernel/content/contracts frozen by WP-019

## Owned paths

Expected ownership:

- `src/sim/systems/time/**`
- `src/sim/systems/king/**`
- `src/sim/systems/economy/**`
- `src/sim/systems/orders/**`
- `src/sim/systems/actions/core/**`
- `src/sim/systems/actions/common/**`
- `src/sim/projections/resources/**`
- `tests/sim/time/**`
- `tests/sim/economy/**`
- `tests/sim/orders/**`
- `tests/sim/actions/common/**`
- `wiki-site/game-systems/time-economy-orders.md`
- `logs/agents/WP-020/**`

Do not edit politics/support/Church/succession, battle/occupation, AI/knowledge/events, UI or shared contracts.

## Deliverables

### 1. Crisis clock and health phases

Implement:

- 56-day starting calendar;
- exact simulation-hour timekeeping;
- Stable, Ailing, Gravely Ill and Deathbed boundaries;
- deterministic phase-transition scheduling and effects/hooks;
- seeded death dawn between elapsed Day 49 and Day 56;
- qualitative prognosis state derived from what the player may know;
- canonical rule that same-dawn completed Orders resolve before death;
- phase/death trace and chronicle effects;
- automatic pause through the kernel when a mandatory phase/death decision requires it.

The simulation never uses wall time. UI speed is only a request for how quickly explicit `advanceTime` commands are issued.

### 2. Baseline economy

Implement exact canonical behavior for:

- Gold income from legally held unoccupied territories;
- 25% occupied income for the occupier and zero for the legal lord;
- levy availability, commitment and slow recovery toward hereditary capacity;
- fractional recovery accumulation without rounding drift;
- Tax Strain, Unrest and occupation effects;
- Influence periodic gain and discrete adjustment hooks;
- Prestige and Claim as bounded ratings rather than spendable pools;
- escrow/locked Gold and committed troops as unavailable resources;
- resource validation, preview and structured delta reasons.

Do not grant occupied territory levy recruitment or legal traits.

### 3. Order engine

Implement two active player initiative slots and one reusable Order lifecycle:

- preview/validate;
- start and pay start costs;
- reserve slot/resources;
- schedule completion;
- cancel with action-defined losses;
- revalidate on resolution;
- resolve documented fallback if target/state changed;
- free capacity only at the correct time;
- serialize/restore exact progress;
- expose an inspectable projection for UI/debug.

Order progress is derived from simulation timestamps, not animation timers.

### 4. Reactions and mandatory decisions

Create the common mechanism for immediate decisions that do not consume Order slots:

- queue with priority and `sequenceId`;
- legal choices and expiry/deadline data;
- automatic simulation pause;
- exact resume point;
- serializable selected/stored outcome;
- no later dawn/death/battle/event while unresolved.

Domain packets register concrete reactions through frozen contracts.

### 5. Common action handlers

Implement canonical behavior for:

- **Send Gift** with 20/40/80 Gold choices, one-day duration, relationship-effect intent output and 14-day diminishing/refusal rules;
- **Raise Taxes** with immediate advance, Tax Strain, repeated-use Unrest escalation and occupation lockout;
- **Hold Court / Emergency Council** with phase-aware naming/duration, cost, Prestige/Influence deltas, invitee hooks and 21-day diminishing rules.

Where an action needs a relationship or contextual-opportunity effect owned by another packet, emit a typed domain effect for WP-029 integration rather than importing that system.

Implement the common preview fields all later actions use: availability, duration, start cost, acceptance collateral, troops locked, visibility, known consequences, cancellation loss, fallback and intentional unknowns.

### 6. Common anti-spam and cooldown primitives

Provide typed, timestamped mechanisms for:

- target-specific cooldown;
- phase-specific limit;
- diminishing-return history;
- once-per-run flag;
- condition escalation;
- shock/condition expiry hooks.

Do not hardcode every domain rule into one generic scoring engine. Let content definitions select a small explicit policy.

### 7. Resource and action projections

Expose knowledge-safe, UI-ready projections for:

- current/available/committed Gold and troops;
- daily income/recovery and reasons;
- active conditions and expiry;
- Order slots, completion and cancellation loss;
- action preview and disabled reasons;
- phase/prognosis/time.

These projections reveal only player-owned exact resources; later observer projections remain WP-023 territory.

### 8. Presentation-semantic handoff

Wave 2 owns gameplay meaning, not literal presentation colors. Action/decision projections must therefore preserve **semantic intent** without encoding CSS/color names.

Rules:

- ordinary affirmative confirmation or commitment—such as **Seal and begin the offer**—is a normal `confirm`/`commit` intent, **not** a danger intent merely because the fiction uses a red wax seal;
- destructive/danger intent is reserved for actions with genuinely destructive, hostile, irreversible-loss or critical consequences, such as abandoning a binding agreement, knowingly accepting a catastrophic loss, or an explicitly dangerous act;
- warning and irreversible metadata remain independent of the visual color chosen later;
- no projection/content field should say `redButton`, `dangerColor`, `burgundyCTA` or otherwise encode literal styling;
- the decorative/semantic identity of a wax seal is independent from the surrounding control surface;
- if the WP-019 frozen contracts lack a suitable semantic intent/severity field, document the exact proposed seam for WP-029 rather than independently editing shared contracts in this parallel packet.

Add a contract fixture proving a normal bargain/offer confirmation is not classified as destructive/danger merely because the action is “sealed.” This is a semantic handoff only; the full visual correction belongs to Wave 3 and the final WP-041 UI audit.

## Implementation contract

- All changes run through deterministic scheduler transitions.
- Every resource delta has a machine-readable reason and optional chronicle key.
- Action definitions come from validated content; handlers resolve typed effect IDs.
- No imports from UI/browser storage.
- No politics/war/AI behavior smuggled into common code.
- No silent clamping except where the canonical bounded rating rule explicitly requires it; invalid negative costs/state fail invariants.
- UI-facing projections express intent/severity semantically and never hardcode visual colors.

## Acceptance tests

- [ ] Phase transitions and death dawn are identical for the same seed across advancement chunk sizes and save/load.
- [ ] Orders completing on death dawn resolve before succession/death hook.
- [ ] Two slots block a third initiative but never block registered reactions.
- [ ] Cancel, target invalidation and fallback behavior match action definitions and serialize exactly.
- [ ] Income/recovery over 56 days matches hand-calculated fixtures with no fractional drift.
- [ ] Occupied territory yields 25%, no levies and no legal trait through common economy queries.
- [ ] Raise Taxes escalates Strain→Unrest exactly and cannot be spammed through save/reload.
- [ ] Gift and Court diminishing/refusal rules use timestamps and survive save/load.
- [ ] Action preview reports every required commitment/cancellation field.
- [ ] Normal confirm/commit actions are semantically distinct from genuine destructive/danger actions, with no literal color coupling in projections/content.
- [ ] No wall-clock/browser dependency enters owned modules.
- [ ] Standard gates and independent critic pass.
- [ ] Wiki page is synchronized.

## Required evidence

- 56-day economy table from deterministic tests;
- phase/death traces;
- same-dawn completion-before-death test;
- order cancellation/invalidation matrix;
- hand-calculated anti-spam examples;
- action semantic-intent fixture showing normal commit versus destructive action;
- implementer and critic logs.

## Agent topology

One implementer owns shared economy/Order APIs. Internal sub-agents may independently test clock/death and economy arithmetic, but must not fork the same lifecycle code.

The critic should target off-by-one dawn behavior, fractional drift, phase-boundary durations, double charging, cancellation refunds, Order slot softlocks, unresolved decisions, leakage of domain logic, and accidental presentation/color coupling in action projections.

WP-029 owns integration with relationships, war, AI and succession.

## Logging

Create:

- `logs/agents/WP-020/implementer-<name>.md`
- `logs/agents/WP-020/critic-<name>.md`

## Completion handoff

Document public handlers/effects, exact phase/death semantics, economy fixtures, Order/reaction registration APIs, action semantic-intent assumptions, and proposed WP-029 seam changes. State integration readiness.
