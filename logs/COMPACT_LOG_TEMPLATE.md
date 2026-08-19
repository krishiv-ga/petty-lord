# Compacted Log — Wave <number/name>

- **Integration packet:** `<WP-###>`
- **Integrated revision:** `<sha>`
- **Release/tag:** `<tag or none>`
- **Fan-out gate:** Open | Closed
- **Next legal packets:** `<IDs>`

## Repository capability now

One short paragraph describing what can be run, played, inspected, or released at this revision.

## Integrated packets

| Packet | Outcome | Critic status | Important evidence |
|---|---|---|---|
| `<WP-###>` | `<result>` | Clear / findings resolved / blocked | `<tests, trace, log links>` |

## Contracts frozen or changed

- `<state/API/schema/UI/release contract>`

## Validation summary

- Formatting/lint: `<result>`
- Typecheck: `<result>`
- Unit/scenario/simulation: `<result>`
- Build: `<result>`
- Browser/visual/accessibility: `<result or not applicable>`
- Deterministic reload/save: `<result or not applicable>`

## Important decisions

- `<decision and reason>`

## Unresolved risks

1. `<specific risk, severity, owning packet>`

## Handoff

- Agents may now fan out: `<packet list>`
- Do not begin: `<packet list or later wave>`
- Shared files only the next integrator may change: `<paths>`
- Latest canonical design amendment: `<link or none>`
