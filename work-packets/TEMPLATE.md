# WP-### — Packet title

- **Status:** Planned | Ready | In progress | In critic | Ready for integration | Integrated | Blocked | Superseded
- **Wave:** `<wave>`
- **Execution:** Serial | Parallel-safe within wave | Integration gate
- **Depends on:** `<packet IDs>`
- **May run with:** `<packet IDs>`
- **Must not run with:** `<packet IDs or conditions>`
- **Primary skill:** `$packet`
- **Required specialist skills:** `<skills>`
- **Critic:** Required | Conditional | Optional
- **Integrator:** Required | Conditional | Not expected
- **Release impact:** None | Checkpoint candidate | Release owner

## Objective

Describe one observable outcome. Avoid listing unrelated improvements.

## Canonical inputs

- [`designer/...`](../designer/...)
- [`TECH_STACK.md`](../TECH_STACK.md)
- other frozen contracts

## Owned paths

This packet may create or modify:

- `<path>`

## Forbidden/shared paths

This packet must not modify without integrator approval:

- `<path>`

## Deliverables

1. `<deliverable>`
2. `<deliverable>`

## Implementation contract

State the important architecture, deterministic, content, UI, asset, or tooling constraints. Name the interfaces that downstream packets may rely on.

## Acceptance tests

- [ ] `<testable outcome>`
- [ ] `<testable outcome>`
- [ ] Standard packet gates pass.
- [ ] Agent log complete.
- [ ] Independent critic findings resolved when required.
- [ ] Required wiki pages synchronized.

## Required evidence

- commands/results;
- screenshots/traces/simulation output where relevant;
- deterministic or save/reload proof where relevant;
- critic log;
- PR and commit.

## Agent topology

Describe recommended implementer sub-agents, critic focus, and conditions requiring a packet-local integrator.

## Logging

Create:

- `logs/agents/WP-###/implementer-<name>.md`
- `logs/agents/WP-###/critic-<name>.md` when required
- optional packet-local integrator log

Do not edit `logs/STATUS.md`, a compacted wave log, or `work-packets/INDEX.md` unless this is an integration packet.

## Completion handoff

State:

- interfaces produced or changed;
- known risks;
- merge order;
- downstream packets unblocked;
- whether integration-ready.
