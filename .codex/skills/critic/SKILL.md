---
name: critic
description: Independently and adversarially review a significant Petty Lord packet or integration diff against its contract, canonical design, invariants, tests, and user-facing evidence. Use before significant work becomes integration-ready.
---

# Independent Critic

## Independence

Do not rubber-stamp the implementer’s narrative. Read the packet and canonical inputs first, then inspect the actual diff, tests, logs and runnable behavior. Prefer a critic who did not author the change.

Create `logs/agents/<packet-id>/critic-<name>.md` before finishing.

## Review order

1. Confirm the packet was legal to run and stayed within owned paths.
2. Verify every deliverable and acceptance test against the repository, not only the log.
3. Inspect the diff for hidden scope, contract drift, missing tests and contradictions.
4. Run the highest-risk tests yourself.
5. Attempt at least one adversarial scenario the implementer did not present.
6. Review evidence at the actual release/target environment: production build for UI, save/replay for simulation, artifact for release.

## Severity

- **P0 — blocker:** data loss, nondeterminism, wrong winner/constitution, security/release corruption, unplayable critical path.
- **P1 — severe:** common incorrect outcome, hidden-information leak, major exploit/softlock, inaccessible critical interaction, broken save or shared contract.
- **P2 — material:** important edge case, misleading feedback, maintainability/parallelism risk, significant polish defect.
- **P3 — minor:** localized clarity, cleanup or low-risk follow-up.

Every finding states location, reproduction/evidence, expected behavior, impact and a concrete recommended resolution. Do not submit vague “consider improving” comments.

## Domain attack prompts

### Simulation/state

Try alternate time chunking, save/reload, same-time items, unresolved decisions, invalid targets, repeated commands, hidden mutation, unstable ordering and forbidden randomness/browser time.

### Politics/gameplay

Try promise spam, late bursts, vote/relationship conflation, support churn, coercion after leverage loss, wrong Church/Capital tie-break, landless voters and contradictory collateral.

### War/AI/knowledge

Try troop/garrison reuse, occupation snowball, pyrrhic Capital, rerolled battle, AI extra hands/resources, omniscient knowledge and stale information presented as current.

### UI

Try 1280×720, keyboard-only, reduced motion, zoom, long copy, dense Deathbed, missing raster assets, hidden information, generic dashboard composition, SVG/vector leakage and focus return.

### Tooling/release

Try clean clone, lockfile parity, local/CI command mismatch, failed artifact, wrong version/SHA, unsafe tag rerun, broken wiki links and missing logs.

## Output

Write a finding table ranked by severity, then:

- acceptance tests independently verified;
- tests/evidence run;
- design/schema/save/release impact;
- unresolved questions;
- final verdict: **Blocked**, **Needs fixes**, or **Clear for integration**.

A critic may provide a minimal patch only when explicitly assigned and ownership is safe. The implementer/integrator remains responsible for disposition and rerunning gates.
