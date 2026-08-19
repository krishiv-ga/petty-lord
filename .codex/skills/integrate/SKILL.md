---
name: integrate
description: Integrate multiple Petty Lord packet branches at a serialized wave gate, reconcile shared contracts, run combined criticism and tests, compact logs, update status/index, and open the next fan-out gate.
---

# Integrate a Wave

## Preconditions

- Read `AGENTS.md`, the integration packet, packet index, latest compacted log and every incoming implementer/critic log.
- Every dependency must be `Ready for integration` with no unresolved P0/P1 finding.
- Freeze an integration base SHA and record it in `logs/agents/<integration-packet>/integrator-<name>.md`.
- Close the next fan-out gate until this workflow completes.

## Inspect before merging

For each branch/PR:

1. Compare changed paths with packet ownership.
2. Verify tests and evidence independently.
3. Inventory public contracts, schema/value changes and proposed shared edits.
4. Reject unrelated cleanup, hidden dependency churn, vector assets or undocumented design changes.
5. Ask the original implementer for a focused packet-local correction when possible rather than repairing everything blindly in the integration seam.

## Integrate deliberately

- Choose a merge order based on dependency direction, not PR completion time.
- Resolve semantic conflicts against canonical design and frozen contracts.
- Keep one authoritative effect/state/selector/asset path; do not preserve duplicate implementations behind aliases.
- Update shared contracts, root exports, configs and wiki only from the integration branch.
- Add cross-packet tests for every repaired seam.
- Rerun targeted gates after each major merge so the first breaking branch is knowable.

## Combined verification

Run the full integration-packet gate, including clean install/build, determinism/save/scenario tests, browser/visual/accessibility checks and release dry-run where applicable.

Assign a fresh independent `$critic` to the combined result. Resolve all P0/P1 findings and explicitly disposition lower findings.

## Compact and open the gate

Only after the integrated revision is frozen:

1. Write `logs/compacted/WAVE-XX.md` from source logs using the compact template.
2. Update `logs/STATUS.md` with exact SHA/release and legal next packets.
3. Update `work-packets/INDEX.md`: dependencies Integrated, integration packet Integrated, next fan-out packets Ready.
4. Synchronize root/shared wiki pages through `$wiki-sync`.
5. Use `$release` when the integration packet owns a checkpoint.
6. Commit status/index/log changes last so they describe the exact integrated revision.

## Completion report

State:

- branches/commits integrated;
- contracts frozen/changed;
- combined tests and critic verdict;
- release tag/artifacts when any;
- unresolved risks and owning future packets;
- exact packets that may now fan out;
- exact packets still forbidden.

Never open a fan-out gate provisionally.
