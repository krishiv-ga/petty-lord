# State schema reference

WP-010 establishes schema version `1` in `src/sim/state/types.ts`. The exact TypeScript source remains
authoritative; this page summarizes its stable integration surface.

## Kernel-owned fields

| Field | Contract |
|---|---|
| `schemaVersion` | Integer save-schema version; currently `1` |
| `buildVersion` | Build compatibility metadata supplied at state creation |
| `seed` | Stable authored/replay seed string |
| `rngState` | Versioned serialized `xoroshiro128plus` state |
| `nextSequenceId` | Positive safe integer greater than every queued ID |
| `status` | `playing`, `succession`, `won` or `lost` |
| `timeHours` | Finite non-negative simulation time normalized to one micro-hour |
| `speed` | Requested pause/1×/2× pacing (`0`, `1`, `2`) |
| `scheduledEvents` | Canonically sorted `ScheduledItem[]` |
| `pendingDecisions` | Ordered mandatory-decision queue |
| `chronicle` | JSON-compatible authored output entries |
| `flags` | Deterministic boolean/number/string flags |
| `metadata` | Kernel creation marker and deterministic JSON metadata |
| `diagnostics` | Enabled flag, limit and bounded command/resolution/draw traces |

All numbers anywhere in state must be finite. State must contain only null, booleans, strings, finite
numbers, arrays and plain objects; cyclic references, class instances, functions, symbols, bigint,
`undefined`, `NaN` and infinities are rejected.

## Scheduled item

```ts
interface ScheduledItem {
  dueTimeHours: number;
  priority: number;
  sequenceId: number;
  kind: string;
  payload: JsonValue;
  storedDraws: Record<string, JsonValue>;
}
```

The serialized array is already sorted by time, priority and sequence ID. Due times use the same
micro-hour normalization as current time. An item may remain due at
the current hour while a mandatory decision blocks it, but imported work may not be in the past.

## Mandatory decision

A pending decision has a unique `id`, registered resolver `kind`, explicit `choiceIds`, opening time,
the triggering scheduled sequence ID when applicable and a JSON payload. Any nonempty decision queue
requires `speed: 0`. Only the first decision can be chosen.

## Domain extension fields

The version-1 envelope includes conservative JSON-compatible placeholders for:

- `king`, `playerId`, `lords`, `territories`, `relationships` and `supports`;
- `church`, `agreements`, `orders` and `aiIntents`;
- `secrets`, `knowledge` and optional `ending`.

These are generic `DomainExtensions`, not invented gameplay schemas. WP-019 will reconcile and freeze
them with WP-011. WP-020–WP-023 then supply system-owned state through the frozen extension contract.

## Import and migration seam

`importState` validates the kernel structure and accepts an optional external validator compatible
with a Zod adapter. A save with a different schema version needs an explicit registered one-way
migration. Build-version matching is optional policy controlled by the application. Invalid data is
reported as `INVALID_JSON`, `INVALID_STATE`, `BUILD_MISMATCH` or `MIGRATION_MISSING`; import never
repairs or mutates the current authoritative state silently.
