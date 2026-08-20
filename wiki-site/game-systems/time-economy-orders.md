# Time, economy and Orders

WP-020 implements the temporal and material backbone behind the frozen Wave 2 `time` namespace. The
canonical rules remain
[Core Game Rules](https://github.com/krishiv-ga/petty-lord/blob/main/designer/game-rules.md) and the
[balance contract](https://github.com/krishiv-ga/petty-lord/blob/main/designer/balance-sheet.md); this
page explains the implemented contracts and their verification.

## Authoritative state

`createWp020GameState` initializes a fresh foundation state and places all packet-owned authority under
`systems.time`. This avoids colliding with the parallel politics, war and knowledge namespaces. The
payload contains:

- the stored royal death dawn, current health phase, prognosis and phase/report traces;
- per-lord Gold, locked Gold, Influence, Prestige, Claim and committed troops;
- per-territory physical control, available levies, fixed-point recovery and timed conditions;
- active and historical Orders, action-use timestamps, reactions, policies and structured resource
  deltas.

The payload is JSON-only and survives the foundation serializer exactly. `importWp020GameState`
validates the complete nested shape, timestamp bounds, authored territory identity, exact Order and
reaction scheduler links, and every remaining canonical dawn/health/death backbone item. Current phase
and prognosis traces are derived from the canonical events already consumed. Missing dawns,
self-consistent forged phases, corrupt negative resources and overcommitment all fail import rather
than being clamped or deferred to a later resolver failure.

## Clock and royal health

Time is stored in exact simulation hours. Initialization selects one weighted death dawn from elapsed
Day 49 through Day 56 with the seeded kernel PRNG, stores the result, and schedules the complete
56-dawn backbone.

| Elapsed dawn | Remaining days | Phase/report |
|---:|---:|---|
| 0 | 56 | Stable; “roughly eight weeks” |
| 14 | 42 | Ailing |
| 28 | 28 | Gravely Ill |
| 42 | 14 | Deathbed; “perhaps a fortnight” |
| 49 | 7 | “unlikely to survive week,” if alive |
| 53 | 3 | “days,” if alive |
| 55 | 1 | “any hour,” if alive |

Same-time work uses the kernel's frozen dawn priorities:

| Stage | Priority contract |
|---|---:|
| Player Order completion | `PLAYER_ORDERS_AND_AI_INTENTS` (100) |
| Condition expiry, income, levy recovery and Influence | `EXPIRY_DECAY_INCOME_AND_RECOVERY` (400) |
| Health transition and prognosis | `HEALTH_PHASE_TRANSITION` (500) |
| Stored King's-death dawn | `KINGS_DEATH_CHECK` (600) |

Consequently an Order due on the death dawn completes first, while any later Order remains unresolved.
Death changes kernel status to `succession`; the kernel then stops later scheduled work. A mandatory
reaction opened before a later item automatically pauses at its exact timestamp.

## Fixed-point economy

Gold fractions and levy recovery use integer millionths. No floating-point remainder is authoritative,
so hourly/day-sized advancement and save/reload produce the same state.

Legal daily Gold is territory Wealth plus a legal-controller trait bonus, followed by explicit
multipliers. Occupation gives the legal lord zero, gives the physical occupier the authored 25% rate,
and grants neither levy recovery nor the legal trait. Recovery is:

```text
levy capacity × 0.005 × active modifiers
```

Whole levies enter availability only when the fixed-point accumulator crosses one, never through a
minimum-one rule. Recovery stops at capacity after accounting for committed troops. Timed conditions
expire before that dawn's income/recovery calculation.

| Condition/policy | Gold | Levy recovery |
|---|---:|---:|
| Tax Strain | ×0.50 | ×0.50 |
| Unrest | ×0.25 | 0 |
| Occupation (legal lord) | 0 | 0 |
| Occupation (occupier) | ×0.25 Wealth | 0 |
| Greyfen Charter | ×0.75 | ×0.75 |
| Provincial Liberties | ×0.90 | unchanged |
| Defaulted Debtor | ×0.50 | unchanged |

Influence gains one per dawn unless `disgraced`, capped at 100. Prestige and Claim adjustments are
bounded ratings, not spendable pools. Invalid negative costs fail. Escrow remains part of current Gold
but is excluded from available Gold; committed troops are likewise unavailable until explicitly
released. Every material adjustment records a machine-readable reason, timestamp, optional territory
and optional chronicle key.

## Order lifecycle

Common actions register one kernel initiative kind per action, for example
`time.action.send-gift`. The reusable lifecycle is:

1. preview and validate the content definition, target, repeat policy, resources and free slot;
2. pay start costs once, snapshot duration/consequences and reserve slot 0 or 1;
3. schedule completion at the stored timestamp with Order priority;
4. on cancellation, keep the documented losses and free the slot immediately;
5. at completion, revalidate state and execute the action's explicit success or fallback;
6. retain the inspectable historical record as resolved, failed or cancelled.

Progress is derived from `startedAtHours`, `completedAtHours` and current simulation time. It is never
stored from an animation. Saving mid-Order retains the exact scheduled `sequenceId`, slot, snapshot,
cancellation loss and fallback.

## Reactions and mandatory decisions

`queueReaction` creates a timestamped scheduler item with caller-supplied priority and the kernel's
monotonic `sequenceId`. A reaction stores legal choices, deadline, payload, outcome and the requested
speed captured immediately before it opens. When opened it becomes the kernel's mandatory decision,
consumes no Order slot, and sets speed to pause. No later dawn, death, battle or event resolves until the
current choice is selected. The selected choice/payload and exact opening time remain serialized; the
resolver emits the captured resume speed so the application can issue the explicit speed request from
the same simulation timestamp.

## Common actions and anti-spam

- **Send Gift:** one day; 20/40/80 Gold paid at start; relationship-effect intents of +4/+8/+12.
  The second start against the same target inside 14 days snapshots half effect. A third is refused
  before payment. Target loss uses the authored failure fallback.
- **Raise Taxes:** one day and Greyfen must remain unoccupied. Resolution grants 14 days of current
  gross Greyfen income and applies 21 days of Tax Strain. Repeating during Strain grants seven days and
  replaces Strain with 21 days of Unrest. Active Unrest locks the action. Church Immunities reduce only
  the advance as authored.
- **Hold Court / Emergency Council:** three days normally, two in Deathbed, 60 Gold at start, up to two
  invitees. The first use gives +8 Prestige/+10 Influence/+6 invitee relationship intent; the second
  inside 21 days gives half; a third is locked. Invitees who become unavailable are removed at
  resolution without invalidating the whole Court.

The shared primitives also expose target cooldown, once-per-phase, once-per-run, diminishing history,
condition escalation and expiry queries. Uses are timestamped at start, preventing concurrent Orders or
save/reload from evading repeat rules.

## Projection and semantic handoff

`projectPlayerResources` exposes only player-owned exact resources: current/available/committed Gold and
troops, daily income/recovery reasons, active conditions, ratings, health/time, Order progress and the
common action preview. Later observer-limited projections remain WP-023 territory.

Every action preview includes availability, disabled reasons, phase-aware name/duration, start cost,
acceptance collateral, troop locks, visibility, known consequences, cancellation loss, fallback,
intentional unknowns, warnings, irreversibility and semantic intent/severity. A normal offer that is
“sealed” remains `commit`, not `danger`; destructive intent is reserved for genuinely hostile,
irreversible-loss or critical actions. No field encodes a literal button or wax-seal color.

## WP-029 integration seam

WP-020 deliberately emits WP-019 `FoundationEffect<'time'>` values with `type: 'effect'`,
`domain: 'time'` and a `time.*` kind instead of importing parallel domains. WP-029 should register
consumers for:

- `time.relationship-effect-intent` from Gift and Court;
- `time.health-phase-changed`, `time.prognosis-reported` and `time.king-died`;
- `time.dawn-completed` hooks;
- `time.reaction-opened`, `time.reaction-selected` and `time.reaction-expired`;
- `time.condition-changed` and Order lifecycle effects.

WP-029 must preserve the 100 → 400 → 500 → 600 same-dawn ordering when politics, war, AI, events and
succession are assembled.

## Verification

The focused packet suite is:

```sh
pnpm exec vitest run --config vitest.sim.config.ts \
  tests/sim/time tests/sim/economy tests/sim/orders tests/sim/actions/common
```

It contains the weighted phase/death replay, alternate chunking and save/reload, missing-backbone and
forged-trace import rejection, same-dawn Order-before-death case, 56-day hand-calculated economy table,
multiplicative fractional fixture, occupation denial, exact-expiry projections and recovery reasons,
resource locks, future reaction speed capture, two-slot/reaction pause, cancellation/invalidation
matrix, Gift/Court/Tax anti-spam and normal-commit-versus-danger semantic fixture.
