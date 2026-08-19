# Scheduler and RNG

## Queue contract

Every scheduled item contains `dueTimeHours`, numeric `priority`, monotonic `sequenceId`, `kind`, a
JSON payload and a `storedDraws` object. The queue comparator is always:

1. earlier simulation time;
2. lower explicit priority;
3. lower `sequenceId`.

The scheduler jumps to the next due item rather than ticking frames. `scheduleItem`,
`cancelScheduledItem`, `replaceScheduledItem` and `inspectScheduler` are pure operations. Replacing an
item assigns a fresh sequence ID; IDs are never reused.

## Named dawn priorities

`DAWN_PRIORITY` makes the canonical order inspectable rather than relying on array or object order:

| Value | Stage |
|---:|---|
| 100 | Player Orders and AI Intents |
| 200 | Battles, occupations and public fallout |
| 300 | Agreements, support, Church and control |
| 400 | Expiry, decay, income and recovery |
| 500 | Health-phase transition |
| 600 | King's-death check |
| 700 | Ambient-event window |
| 800 | AI Intent selection |
| 900 | Autosave and chronicle |

An Order due on the death dawn therefore resolves before the death check. Later packets may use
additional explicit integer priorities only when their place in this ordering is deliberate and
tested.

## Decisions and recursive work

When a resolver opens a mandatory decision, the kernel removes the triggering item, leaves all later
work queued at the exact current timestamp, forces requested speed to pause and returns immediately.
After the first decision is resolved, the next advance continues from that timestamp.

A resolver may schedule more work for the current time. The scheduler re-sorts by the same comparator,
so recursive work remains deterministic. A configurable resolution ceiling (10,000 by default)
turns an accidental same-time infinite loop into an atomic structured failure instead of hanging or
returning a partially advanced state.

## PRNG contract

Only `src/sim/random/random.ts` imports `pure-rand`. It wraps `xoroshiro128plus` with a stable UTF-16
string-seed hash and a versioned serialized generator state. The project helpers define:

- integer: both minimum and maximum are inclusive safe integers;
- float: `0` inclusive and `1` exclusive;
- chance: probability is between `0` and `1` inclusive and succeeds when the half-open draw is lower;
- selection: a uniformly selected collection index;
- shuffle: deterministic Fisher–Yates using inclusive integer draws.

Each draw requires a label and can emit its result and post-draw state into bounded diagnostics.
`drawOrUseSnapshot` stores a JSON-compatible outcome under an authored key. Reusing that key returns
the stored result without advancing the PRNG, which prevents rescheduling or reload from rerolling a
battle, event or Spy outcome.

Diagnostics are disabled by default. When enabled, resolved-item, draw and command traces are bounded
by the serialized diagnostic limit, capped at 1,024 entries.
