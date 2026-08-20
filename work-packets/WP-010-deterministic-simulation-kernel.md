# WP-010 — Deterministic Simulation Kernel

- **Status:** Integrated by WP-019
- **Wave:** 1
- **Execution:** Parallel-safe within Wave 1
- **Depends on:** WP-000
- **May run with:** WP-011, WP-012
- **Must not run with:** WP-019 or any Wave 2 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$critic`
- **Critic:** Required
- **Integrator:** WP-019
- **Release impact:** Foundation checkpoint candidate

## Objective

Build the pure, data-agnostic deterministic simulation kernel that later game systems can plug into: canonical state envelope, scheduler, command/result protocol, seeded PRNG adapter, serialization, invariants, and instant headless advancement.

This packet does not implement the game’s economy, politics, war, AI, events, or succession rules.

## Canonical inputs

- [`designer/game-rules.md`](../designer/game-rules.md), especially clock and dawn ordering
- [`designer/ai-information-events.md`](../designer/ai-information-events.md), especially deterministic randomness and same-time order
- [`designer/interface-content-and-production.md`](../designer/interface-content-and-production.md), especially canonical serializable state, scheduler, saves and tests
- [`TECH_STACK.md`](../TECH_STACK.md)
- contracts and tooling integrated by WP-000

## Owned paths

Expected ownership:

- `src/sim/kernel/**`
- `src/sim/state/**` for the initial generic state envelope only
- `src/sim/random/**`
- `src/sim/serialization/**`
- `src/sim/testing/**`
- `tests/sim/kernel/**`
- `tests/sim/determinism/**`
- `wiki-site/architecture/deterministic-sim.md`
- `wiki-site/architecture/scheduler-and-rng.md`
- `wiki-site/reference/state-schema.md` sections owned by this kernel
- `logs/agents/WP-010/**`

Use actual paths established by WP-000, but do not widen ownership into content, UI, system-specific rules, root configuration or shared wiki navigation.

## Forbidden/shared paths

Do not modify:

- package/lock/tooling files;
- `src/content/**`;
- `src/ui/**`;
- game-system modules owned by Wave 2;
- root barrel files or shared contract files frozen by WP-000 without recording a proposed integrator change;
- `work-packets/INDEX.md`, `logs/STATUS.md`, or compacted logs.

## Deliverables

### 1. Canonical state envelope

Implement the design’s serializable top-level envelope with intentionally generic placeholders for later domain substate.

It must include at minimum:

- schema/build version;
- seed and serialized PRNG state;
- next `sequenceId`;
- game status;
- canonical simulation time and speed;
- scheduled items;
- pending mandatory decisions;
- chronicle/event output channel;
- deterministic flags/metadata;
- extension points for lords, territories, relationships, support, Church, agreements, Orders, AI Intents, secrets, knowledge and ending.

Do not invent canonical system shapes that WP-020–023 own. Use typed extension interfaces or conservative placeholders that WP-019 can freeze.

### 2. Deterministic scheduler

Implement an explicit scheduler that:

- advances by simulation hours, never browser time;
- finds the next due item rather than ticking every animation frame;
- resolves due items by canonical priority and then stable `sequenceId`;
- can schedule, cancel, replace and inspect items deterministically;
- stops before later work when a mandatory decision opens;
- resumes from the exact pending point after a serialized decision;
- supports normal time, pause, 2× UI requests and instant headless advancement without changing outcomes;
- exposes trace information suitable for debug UI and failing tests;
- handles items that schedule more items for the same timestamp without infinite loops or unstable order.

Encode the canonical dawn sequence as named priorities or an equivalent inspectable contract. Do not bury it in incidental array order.

### 3. Seeded PRNG adapter

Wrap the approved `pure-rand` generator behind one project API.

Provide:

- creation from a stable string seed;
- serializable generator state;
- bounded integer/float/chance helpers with documented inclusive/exclusive behavior;
- deterministic selection/shuffle helpers where justified;
- explicit draw labels or trace hooks for debugging;
- snapshot/store support for outcomes that must not reroll after rescheduling;
- tests proving same seed and command stream are identical across save/load and different advancement chunk sizes.

No other module should import `pure-rand` directly after integration. Ban `Math.random()` in simulation code through tests/lint/search.

### 4. Command and transition protocol

Create a small typed protocol through which application/UI code can ask the simulation to:

- start/cancel an initiative;
- choose a mandatory decision;
- change requested speed;
- advance time;
- import/export state;
- invoke debug-only deterministic commands.

The kernel returns the new canonical state plus structured effects/projections for consumers. It must not call React setters, browser storage, animation code, network code, or global mutable event buses.

Later packets must be able to register domain reducers/resolvers without bypassing scheduler order.

### 5. Serialization and validation seam

Provide:

- stable JSON-compatible export;
- import with schema/build metadata and error reporting;
- exact round-trip tests including scheduled items, decision queue, sequence IDs, PRNG state and fractional numbers;
- hooks for Zod validation/migrations that WP-019 can connect to WP-011 schemas;
- current/previous checkpoint data shape without implementing IndexedDB orchestration.

### 6. Invariants and test harness

Create reusable assertions for:

- unique and monotonic `sequenceId`;
- no non-finite number in state;
- no unserializable state;
- sorted/resolvable scheduler;
- no negative simulation time;
- decision pause behavior;
- no gameplay draw outside the PRNG adapter;
- save round-trip equality;
- replay equality across 1-hour, 24-hour and instant advancement chunks.

Provide a lightweight fake-domain fixture to prove registration and resolution without implementing real game rules.

### 7. Diagnostics

Expose deterministic trace output that later debug/UI packets can render:

- current and next scheduled items;
- last resolved items;
- PRNG draw trace in development/tests;
- command history or replay fixture sufficient to reproduce a failure;
- invariant failure context.

Diagnostics must be bounded or disabled in production builds so they cannot grow forever.

## Implementation contract

- `src/sim/**` remains pure TypeScript and browser-independent.
- No `Date`, `setTimeout`, `requestAnimationFrame`, `performance.now`, DOM, storage, React, Zustand, Motion, or asset imports.
- The scheduler owns ordering; domain systems may not directly jump time or resolve around it.
- State transitions are explicit and testable.
- The same starting state and command stream must yield byte-equivalent normalized JSON.
- Error states are structured and recoverable; do not silently repair corrupt authoritative state.

## Acceptance tests

- [ ] Same seed + same commands produces identical normalized state and trace across repeated runs.
- [ ] Save midway, reload, and continue matches uninterrupted execution.
- [ ] Advancing 72 hours once matches advancing 72 times by one hour.
- [ ] Mandatory decision stops all lower-priority/successive resolution until a choice is applied.
- [ ] Same-time items obey priority then `sequenceId`, including recursively scheduled items.
- [ ] Pause does not advance state; requested 1×/2× changes wall-time pacing only outside the kernel.
- [ ] PRNG state round-trips and no simulation source uses `Math.random()`.
- [ ] Invalid/corrupt import returns a structured failure and never mutates the current state.
- [ ] Fake domain resolver proves later systems can plug in without kernel modification.
- [ ] All owned tests and standard gates pass.
- [ ] Independent critic log exists and all severe findings are resolved.
- [ ] Owned wiki pages describe contracts truthfully.

## Required evidence

- deterministic hash/JSON comparisons;
- scheduler traces for same-time and mandatory-decision cases;
- save/reload comparison;
- repository search for forbidden browser/random imports;
- test results and coverage of error paths;
- implementer and critic logs.

## Agent topology

One implementer may split internal work into disjoint sub-agents for scheduler tests and serialization tests, but the kernel API must be authored by one owner.

The independent critic should attack:

- hidden nondeterminism;
- unstable sort/order;
- decision/resume edge cases;
- recursive scheduling;
- PRNG serialization;
- mutation/aliasing across saved states;
- overdesign that prematurely owns domain rules.

WP-019 performs final integration with content schemas and freezes the shared kernel API.

## Logging

Create:

- `logs/agents/WP-010/implementer-<name>.md`
- `logs/agents/WP-010/critic-<name>.md`

Do not edit shared status or packet index.

## Completion handoff

Document the exact public kernel exports, extension points, serialization version, scheduler priorities, and any proposed shared-contract changes for WP-019. State whether the branch is integration-ready.
