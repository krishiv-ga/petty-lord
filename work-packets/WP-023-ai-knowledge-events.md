# WP-023 — Rival AI, Observer Knowledge, Secrets, Openings and Events

- **Status:** Ready
- **Wave:** 2
- **Execution:** Parallel-safe within Wave 2
- **Depends on:** WP-019
- **May run with:** WP-020, WP-021, WP-022
- **Must not run with:** WP-029 or any Wave 3 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$critic`, `$hunt` for AI/gameplay-behavior review
- **Critic:** Required
- **Integrator:** WP-029
- **Release impact:** Headless checkpoint candidate

## Objective

Implement the living-world layer without cheating: one major Intent per NPC, actual resource/capacity use, deterministic personality-driven selection, observer-specific knowledge and stale intelligence, Spy and secrets, seeded opening packages, authored events/decisions, notification classification, and knowledge-safe succession/realm projections.

## Canonical inputs

- [`designer/ai-information-events.md`](../designer/ai-information-events.md)
- [`designer/world-and-actors.md`](../designer/world-and-actors.md)
- [`designer/game-rules.md`](../designer/game-rules.md)
- [`designer/candidate-evaluation.md`](../designer/candidate-evaluation.md)
- [`designer/balance-sheet.md`](../designer/balance-sheet.md)
- relevant paperplay amendments concerning hidden information, guaranteed intrigue, stale shocks and event order
- contracts/content frozen by WP-019

## Owned paths

Expected ownership:

- `src/sim/systems/ai/**`
- `src/sim/systems/knowledge/**`
- `src/sim/systems/intelligence/**`
- `src/sim/systems/secrets/**`
- `src/sim/systems/openings/**`
- `src/sim/systems/events/**`
- Spy action handlers under `src/sim/systems/actions/intelligence/**`
- `src/sim/projections/knowledge/**`
- `tests/sim/ai/**`
- `tests/sim/knowledge/**`
- `tests/sim/events/**`
- `wiki-site/game-systems/ai-knowledge-events.md`
- `logs/agents/WP-023/**`

Do not implement political support transitions, battle resolution, baseline economy/time, UI, storage adapters or shared contracts.

## Deliverables

### 1. One-Intent AI lifecycle

Implement one major active Intent per NPC plus reactions.

An Intent must use the same underlying legality, duration, resource and scheduler contracts as player initiatives wherever applicable.

Lifecycle:

- observe through that lord’s knowledge state;
- enumerate legal candidate Intent definitions;
- discard unaffordable/invalid options;
- score through authored personality/objective rules;
- resolve deterministic near-ties through seeded stored draw or canonical stable tie policy;
- start exactly one Intent;
- pay/lock actual resources;
- revalidate and resolve/fallback like a player Order;
- choose again only when idle and scheduler rules allow.

The AI may react to direct attacks, ultimatums and mandatory decisions without consuming its one Intent.

### 2. Personality and phase priorities

Implement authored behavior for:

- Renard consolidating legitimacy, Church and early support, then containing threats;
- Edric pursuing strength/war and possible candidacy;
- Ysabel pursuing wealth, safety, bargaining and viable winners;
- Oswin pursuing lawful legitimacy, Church and stability;
- Mara pursuing decentralization, resistance to Renard and survival.

Phase priorities must shift from mixed interests in Stable to succession-dominant behavior later.

The AI should be legible but not scripted into the same opener. It must not evaluate every possible action tree or pretend to be a human-equivalent agent.

### 3. Observer-specific knowledge

Implement knowledge separately for each lord and the player.

Represent:

- source, subject, field/category, observed value or band, confidence/freshness and observed timestamp;
- public facts immediately available to everyone;
- private Leanings, Intent, exact military availability and secret negotiations only when learned;
- stale intelligence after canonical windows;
- loss/invalidity when a fact changes, without retroactively granting omniscience;
- exact self-owned resources and agreements;
- public versus private blackmail/coercion visibility;
- legal projections that can answer “what this observer believes” without reading hidden state.

Do not copy the whole authoritative state into each knowledge record. Store observations/facts, not shadow games.

### 4. Watch Court and Find Dirt

Implement Spy modes:

**Watch Court**

- 3 days, canonical cost;
- reveals target Intent, private Leaning and exact known military availability;
- timestamps observations and staleness;
- always succeeds when legal.

**Find Dirt**

- 5 days, canonical cost;
- deterministic contested outcome with stored seeded variance;
- success discovers one available secret;
- partial failure returns lesser intelligence;
- detected failure damages relationship through an emitted effect and alerts target;
- repeated spying increases detection as designed;
- cannot start during Deathbed.

Outcome must not reroll after save/load, cancellation/rescheduling or refresh.

### 5. Secrets and blackmail facts

Implement:

- secret existence/target/source/evidence state;
- discoverability and one-time discovery/exposure rules;
- private possession and who knows what;
- blackmail use as a private leverage fact where authored;
- public exposure handoff to WP-021 political effects;
- release of secretly coerced support when evidence is exposed/invalidated;
- target alert/hostility hooks;
- guaranteed legal Renard vulnerability in every opening package.

Do not implement political Claim/Church/Pledge deltas here; emit exact typed consequences to WP-021.

### 6. Seeded opening packages

Implement run initialization selection and application for the canonical opening packages.

Each package may vary:

- relationships/rivalries within allowed bounds;
- initial Intent or strategic pressure;
- army depletion/resources where authored;
- Ysabel collateral preference;
- Renard vulnerability/secret;
- event eligibility;
- modest player opportunity shape.

Requirements:

- identities remain stable;
- package is fully determined by seed and stored;
- every package passes viability invariants;
- no package starts the player already winning or Renard inevitably above target;
- same seed recreates package exactly.

### 7. Authored event system

Implement the complete validated event set from WP-011.

Event engine must support:

- eligibility windows/conditions;
- deterministic weighted selection using stored draw;
- cooldown and once-per-run rules;
- mandatory versus ambient classification;
- choice queues through the common reaction/decision contract;
- direct targets and observer visibility;
- structured effects for domain systems;
- safe fallback when conditions change before resolution;
- event/choice/result serialization;
- chronicle and interrupt/feed classification.

Ambient events must never fire after the death check on the same dawn if the King dies.

### 8. Notification classification

Produce structured presentation priority, not UI modals:

Interrupt only for canonical cases such as:

- direct attack/defense;
- direct demand or expiring bargain/debt;
- major public Pledge/territorial change/scandal;
- phase/death;
- mandatory choice.

Routine AI gifts, taxes, harmless court activity and lesser actions belong in the chronicle/feed.

### 9. Knowledge-safe projections

Provide observer-projection functions for:

- public succession alignment;
- known private Leaning with age;
- candidate public Claim/Church/candidacy;
- exact/banded/unknown military information;
- known agreements/secrets/Intent;
- Capital/occupation/public-war facts;
- forecast inputs that explicitly mark unknown and conditional fields.

A test must fail if the player projection reads an undiscovered Leaning, secret, exact army, private bargain or future death/event draw.

### 10. Hostile AI and information tests

Use `$hunt` or equivalent scenarios for:

- AI performing simultaneous hidden extra actions;
- spending resources it does not own;
- knowing player Orders/secrets/exact troops without intelligence;
- always attacking current vote leader while ignoring latent threat;
- second-place hoarding exploit;
- support pinball caused by AI near-ties;
- deterministic script repeating every seed;
- modal/notification overload;
- stale intelligence presented as current;
- refresh rerolling Spy/event/opening;
- event softlocks and impossible choices;
- no Renard vulnerability in a legal opening.

Record balance findings for WP-040 rather than silently changing canonical values.

## Implementation contract

- One AI Intent, actual resources, same scheduler.
- AI chooses from observer knowledge; authoritative state is used only when resolving reality, not deciding what the AI believes.
- Every random choice is seeded, stored where required and traceable.
- Events and secrets emit typed cross-domain effects.
- No free-form LLM calls, network requests or runtime procedural prose.
- AI explanations expose high-level reasons without leaking hidden facts.

## Acceptance tests

- [ ] Every NPC can hold at most one active Intent and still react legally.
- [ ] AI cannot start unaffordable/illegal Intents and pays/locks actual resources.
- [ ] Same seed produces the same opening, AI near-ties, Spy outcomes and event sequence.
- [ ] Different approved seeds produce meaningful but bounded opening/Intent variation.
- [ ] Player/AI knowledge projections never expose undiscovered or future facts.
- [ ] Stale intelligence is timestamped and not treated as exact current truth.
- [ ] Every opening contains a valid Renard intrigue vulnerability and passes viability checks.
- [ ] Death check suppresses same-dawn ambient event after death.
- [ ] Notification classification prevents routine AI modal spam.
- [ ] Find Dirt cannot reroll and has correct partial/detected outcomes.
- [ ] Hostile AI/information pass has no unresolved P0/P1 cheating or softlock finding.
- [ ] Standard gates, critic and wiki sync pass.

## Required evidence

- per-lord knowledge snapshots showing different beliefs about one state;
- AI Intent traces with resource charges;
- same/different-seed opening comparison;
- Spy outcome/reload proof;
- event chronology around death/mandatory decisions;
- notification-volume sample run;
- hostile report;
- implementer and critic logs.

## Agent topology

One lead owns AI/knowledge boundaries. Disjoint sub-agents may implement event fixtures and Spy tests, but nobody may bypass the lead’s observer-projection contract.

The critic should inspect decisions from each actor’s known state and search for any accidental read of authoritative hidden data. A gameplay hunter should run whole-seed traces and attack predictability, cheating, overload and intrigue availability.

WP-029 connects AI Intents to real domain actions and political/military consequences.

## Logging

Create:

- `logs/agents/WP-023/implementer-<name>.md`
- `logs/agents/WP-023/hunter-<name>.md`
- `logs/agents/WP-023/critic-<name>.md`

## Completion handoff

Document AI Intent API, knowledge projection schema, event/secret effect hooks, opening coverage, notification priorities, hostile findings and integration risks. State integration readiness.
