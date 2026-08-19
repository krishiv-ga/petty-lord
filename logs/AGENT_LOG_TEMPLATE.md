# Agent Log — <WP-###> — <role/name>

- **Packet:** `<WP-### packet title>`
- **Role:** Implementer | Critic | Integrator | Auditor | Tuner
- **Git target:** `main`
- **Starting revision:** `<main sha>`
- **Ending revision:** `<main sha or pending>`
- **Status:** In progress | Blocked | Ready for critic | Ready for integration | Complete

## Scope

Owned paths:

- `<path>`

Explicitly out of scope:

- `<path or concern>`

## Work performed

- `<factual change>`
- `<factual change>`

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| `<item>` | `<why>` | `<packet/contract affected>` |

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| `<command>` | Pass/Fail/Not run | `<summary, CI URL, trace, screenshot>` |

## Critic findings and resolution

| Severity | Finding | Resolution/status |
|---|---|---|
| P0/P1/P2/P3 | `<finding>` | Fixed/Accepted/Rejected with evidence/Deferred to `<WP>` |

Use `None yet — critic pending` before review. Critics use this section for findings; implementers update disposition before integration.

## Design, balance, or schema impact

- Canonical design changed: Yes/No
- Design amendment: `<link or none>`
- Balance values changed: `<list or none>`
- Save/schema impact: `<version/migration or none>`
- Wiki pages updated: `<paths or pending>`

## Risks and deferred work

- `<specific risk or deferred item>`

## Integration notes

- Shared contracts touched: `<list or none>`
- Reconciliation/order constraints on `main`: `<details or none>`
- Follow-up packets: `<IDs or none>`
- Integration-ready: Yes/No
