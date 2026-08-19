# Deterministic simulation

The WP-010 kernel is pure TypeScript under `src/sim`. It has no React, DOM, browser storage, timer,
animation, network or wall-clock dependency. A transition receives a state and a typed command and
returns either a new state with structured effects, or a structured error with the original state.
No failure path mutates the caller's state.

## Public modules

- `src/sim/state/index.ts` creates and types the canonical envelope.
- `src/sim/kernel/index.ts` exposes commands, scheduling, registration and named dawn priorities.
- `src/sim/random/index.ts` is the only project API over `pure-rand`.
- `src/sim/serialization/index.ts` exports/imports stable JSON and checkpoint pairs.
- `src/sim/testing/index.ts` exposes invariants, round-trip assertions and normalized hashes.

There is deliberately no shared `src/sim/index.ts` barrel in Wave 1. WP-019 owns that cross-packet
seam and freezes imports after reconciling WP-010 with canonical content schemas.

## State and extension points

`GameState<E>` is `KernelState` plus a generic `DomainExtensions` contract. The envelope owns schema
and build versions, seed and serialized PRNG state, monotonic `nextSequenceId`, status, simulation
hours, requested speed, scheduler queue, decision queue, chronicle, flags, deterministic metadata and
bounded diagnostics. Conservative top-level extension fields exist for king, player, lords,
territories, relationships, support, Church, agreements, Orders, AI Intents, secrets, knowledge and
ending. They hold JSON-compatible values until WP-019 freezes types supplied by WP-011 and later
system packets.

The initial kernel schema version is `1`. `createGameState` creates empty domain extensions and never
invents economy, politics, war, AI, event or succession data.

## Command protocol

`applyCommand` accepts:

- `START_INITIATIVE` and `CANCEL_INITIATIVE` through registered domain handlers;
- `CHOOSE_DECISION` for the first mandatory decision only;
- `SET_REQUESTED_SPEED` for pause, 1× and 2× UI pacing requests;
- `ADVANCE_TIME` with simulation hours and `paced` or explicit headless `instant` mode;
- `IMPORT_STATE` and `EXPORT_STATE`;
- registered `DEBUG` commands only when debug use is explicitly enabled.

Requested 1× and 2× do not multiply simulation hours; wall-time pacing belongs to the application.
Any advancement request while paused is a no-op, including instant/headless requests. A mandatory
decision rejects nonzero speed until it is resolved. Instant mode skips wall pacing only while the
simulation is running and does not alter ordering or outcomes.

## Domain registration

`createKernelRegistry` combines independent `DomainModule` registrations. A module may register
scheduled resolvers, initiative starters/cancellers, decision resolvers and debug handlers. Duplicate
module IDs or handler keys fail immediately. Resolvers return explicit scheduling, cancellation,
decision, chronicle and consumer-effect outputs; they cannot replace kernel-owned time, scheduler,
sequence, PRNG, diagnostic or version fields.

The fake module at `src/sim/testing/fake-domain.ts` proves this seam without implementing game rules.
WP-020–WP-023 should register real domains behind it rather than adding alternate clocks or direct
resolution paths.

## Serialization and validation

`exportState` emits recursively key-sorted, normalized JSON. Import parses into a new value, validates
required kernel fields, finite/canonical time, scheduler order and IDs, complete decision and bounded
diagnostic shapes, game status and every serialized PRNG state, then optionally calls a domain
validator. An invalid import returns an error code plus paths and does not modify current state.
Explicit one-way migration hooks and an external-validator interface are ready for WP-019 to connect
to Zod schemas.

`checkpointState` creates a `{ current, previous }` data shape only. IndexedDB orchestration remains a
later application packet.

## Verification

The headless simulation suite proves repeated replay equality, save/reload continuation, 1-hour versus
24-hour versus instant advancement, mandatory-decision stopping, recursively scheduled same-time
work, PRNG snapshots, corrupt-import atomicity and fake-domain registration. Invariant helpers check
time, JSON compatibility, finite numbers, queue order, decision pause and unique monotonic scheduled
sequence IDs.
