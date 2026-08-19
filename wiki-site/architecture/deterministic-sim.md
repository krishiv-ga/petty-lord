# Deterministic simulation

Authoritative state belongs in pure TypeScript under `src/sim`. It cannot depend on React, DOM APIs,
browser storage, timers, animation completion, network timing, wall-clock time or `Math.random()`.
Commands return explicit state and must remain serializable and replayable.

WP-010 owns the kernel. Later system packets implement rules behind its frozen contracts. Until then,
the simulation suite is a headless boundary smoke test rather than a gameplay implementation.
