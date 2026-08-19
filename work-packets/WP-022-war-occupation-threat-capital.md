# WP-022 — War, Occupation, Threat, Dispossession and the Capital

- **Status:** Blocked by WP-019
- **Wave:** 2
- **Execution:** Parallel-safe within Wave 2
- **Depends on:** WP-019
- **May run with:** WP-020, WP-021, WP-023
- **Must not run with:** WP-029 or any Wave 3 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$critic`, `$hunt` for military exploit review
- **Critic:** Required
- **Integrator:** WP-029
- **Release impact:** Headless checkpoint candidate

## Objective

Implement the complete abstract military system and its political facts: army availability, mercenaries, invasion/defense, deterministic battles and casualties, King's Peace, occupation and garrisons, dispossession, observer-independent threat facts, Capital states, military coercion queries, and Military Acclamation eligibility.

War must create political position and resource denial without becoming Risk-like exponential conquest.

## Canonical inputs

- [`designer/war-and-occupation.md`](../designer/war-and-occupation.md)
- [`designer/game-rules.md`](../designer/game-rules.md)
- [`designer/world-and-actors.md`](../designer/world-and-actors.md)
- [`designer/balance-sheet.md`](../designer/balance-sheet.md)
- final paperplay amendments concerning Yield, pyrrhic Capital, threat and dispossession
- contracts/content frozen by WP-019

## Owned paths

Expected ownership:

- `src/sim/systems/military/**`
- `src/sim/systems/war/**`
- `src/sim/systems/occupation/**`
- `src/sim/systems/threat/**`
- `src/sim/systems/capital/**`
- military action handlers under `src/sim/systems/actions/military/**`
- `src/sim/projections/military/**`
- `tests/sim/war/**`
- `tests/sim/occupation/**`
- `tests/sim/capital/**`
- `wiki-site/game-systems/war-and-occupation.md`
- `logs/agents/WP-022/**`

Do not edit economy recovery formulas, political support transitions, AI knowledge, UI, shared contracts or packet status.

## Deliverables

### 1. Military availability and commitments

Implement exact accounting for:

- hereditary levies, current available troops and capacity;
- troops already committed to Orders, military aid, garrisons or Capital;
- mercenary contracts, cost, duration/renewal and separation from levy recovery;
- commander and territory modifiers;
- force preview with known and intentionally uncertain elements;
- no double commitment, negative troops or instant teleport between simultaneous campaigns.

Travel/return timing follows canonical action durations and must serialize exactly.

### 2. Royal Authority and King's Peace

Implement phase-specific legality/consequences:

- Stable offensive war as open defiance with royal sanction/defender support and severe political consequence hooks;
- Ailing private war permitted but still violating weakened King's Peace;
- Gravely Ill removal of normal offensive-war Prestige penalty;
- Capital march unavailable before Gravely Ill;
- Deathbed weakened royal garrison and accelerated action timing supplied through action contracts.

Do not simulate the King as a full AI lord. Royal intervention is an explicit phase rule.

### 3. Invasion and defense flow

Implement the Invade Territory and March on Capital handlers with:

- adjacency/legal-target checks;
- start logistics cost, committed troops and optional mercenaries;
- public campaign scheduling;
- immediate serializable defender reaction outside Order slots;
- defend, yield/withdraw and any canonical response options;
- battle at completion, after defender choice;
- invalidation/fallback when control, adjacency or available force changes;
- chronicle/effect outputs for politics/AI/UI.

Do not allow one-click annexation or free army movement.

### 4. Deterministic battle resolution

Implement the canonical abstract formula using:

- committed force;
- commander;
- terrain;
- Fortification;
- royal/Capital modifiers where relevant;
- a stored seeded battlefield-fortune draw created at campaign start.

Requirements:

- preview presents exact known factors and a bounded uncertainty statement;
- refresh/save/load cannot reroll fortune;
- both sides take persistent casualties under authored rules;
- victory, defeat, withdrawal/yield and pyrrhic results are explicit;
- battle result emits structured reasons/deltas;
- casualty arithmetic cannot exceed committed force or return killed troops.

### 5. Occupation and garrisons

Implement:

- legal title versus physical controller as separate facts;
- hereditary seat garrison requirement of 75 surviving troops;
- Capital requirement of 200 surviving troops;
- occupation only when sufficient survivors can be left after battle;
- 25% income hook, no levy recovery, no legal territory trait and denial to legal lord;
- garrison troops unavailable elsewhere;
- voluntary withdrawal with one-day return timing;
- liberation/recapture;
- occupation history and political/threat effect output;
- persistence if the occupier loses their own hereditary seat.

A dispossessed lord remains a legal lord with Council vote, resources/relationships/Claim, but loses normal income/recovery/security.

### 6. Capital state machine

Implement explicit states:

- Royal;
- Occupied by a legal claimant with at least 200 troops;
- Uncontrolled after a victorious force cannot supply 200 survivors;
- contested/pending only during a scheduled campaign when needed.

Rules:

- Uncontrolled grants no income, Council tie-break or Acclamation credit;
- a later claimant may enter an Uncontrolled Capital with 200 troops without a new battle, following the documented action/time cost;
- Capital control may be lost when garrison/contract validation drops below 200;
- every transition emits a reason and chronicle entry.

### 7. Threat facts and military leverage

Produce authoritative non-observer-specific facts from:

- offensive wars initiated;
- occupations and proximity;
- army/mercenary strength;
- Capital control;
- candidacy and succession viability inputs supplied later;
- recent victories/defeats;
- treaty/agreement violations.

Provide a narrow query for WP-021 Threaten:

- adjacent overwhelming force;
- occupation of target seat;
- military coercion credibility and its supporting facts;
- exact invalidation when force/garrison/adjacency changes.

WP-023 later converts facts into observer-limited beliefs. This packet must not expose hidden exact values directly to AI/UI.

### 8. Military Acclamation input

Implement a pure authoritative query that identifies legal declared claimants satisfying all three conditions at death:

- Capital controlled;
- three non-Capital seats physically controlled;
- at least 200 troops in the Capital.

Return structured checklist/reasons. Do not decide Council ballots. If multiple claimants somehow satisfy an impossible/contradictory state, fail an invariant or follow an explicitly tested deterministic resolution from the canonical design rather than inventing a score.

### 9. Hostile military paperplay tests

Use `$hunt` or equivalent adversarial scenarios for:

- Mara-first conquest every run;
- attack Renard opener;
- casualty-free Yield;
- mercenary snowball;
- occupation economy absorption;
- delete-a-voter conquest;
- garrison reuse/double counting;
- Capital pyrrhic control;
- Uncontrolled Capital free/instant capture;
- threaten-everyone with one army;
- dispossessed player softlock;
- early King's Peace irrelevance;
- refresh rerolling battle fortune.

Record balance findings for WP-040 rather than tuning canonical numbers without evidence.

## Implementation contract

- Legal ownership is immutable during the launch crisis; physical control is not.
- Battles are deterministic from state + stored draw.
- No tactical combat, free movement, supply simulation or title inheritance.
- War emits facts/effects; it does not directly assign political support.
- Threat queries identify leverage, not support outcomes.
- Military state remains serializable and pure.
- Observer-limited knowledge is WP-023’s layer.

## Acceptance tests

- [ ] Same battle seed/state yields identical result and casualties through reload and different time advancement.
- [ ] Stable/Ailing/Gravely Ill/Deathbed legality and sanctions match design.
- [ ] Defender reaction works with both player Order slots full.
- [ ] Winning with fewer than required survivors does not create an occupation.
- [ ] Occupation locks garrison, provides 25% income hook, no levies and no trait.
- [ ] Dispossessed lords remain in political/state queries.
- [ ] Capital transitions Royal/Occupied/Uncontrolled correctly, including garrison collapse.
- [ ] Military leverage invalidates when its supporting condition disappears.
- [ ] Acclamation checklist exactly matches the constitution.
- [ ] Hostile military scenarios find no P0/P1 exploit in correctness rules.
- [ ] Standard gates, independent critic and wiki sync pass.

## Required evidence

- battle-factor/casualty traces;
- King's Peace matrix;
- occupation/garrison lifecycle;
- Capital state-transition table;
- leverage and Acclamation checklist examples;
- hostile military report;
- implementer and critic logs.

## Agent topology

One lead owns military state and battle API. Disjoint sub-agents may implement Capital state tests and hostile military scenario fixtures, but battle/garrison accounting must remain under one owner.

The critic should attempt to generate troops/resources, reuse garrisons, bypass King's Peace, force invalid Capital control, eliminate voters and reroll fortune.

WP-029 integrates economy hooks, political consequences, AI knowledge and succession.

## Logging

Create:

- `logs/agents/WP-022/implementer-<name>.md`
- `logs/agents/WP-022/hunter-<name>.md`
- `logs/agents/WP-022/critic-<name>.md`

## Completion handoff

Document military public APIs, economy/politics effect hooks, observer-fact boundary, Capital/Acclamation queries, hostile findings and integration risks. State integration readiness.
