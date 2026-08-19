---
name: integrate
description: Reconcile multiple Petty Lord packet results already on main at a serialized wave gate, repair shared contracts, run combined criticism and tests, compact logs, update status/index, and open the next fan-out gate.
---

# Integrate a Wave

## Preconditions

- Read `AGENTS.md`, the integration packet, packet index, latest compacted log and every incoming implementer/critic log.
- Every dependency must be `Ready for integration` with no unresolved P0/P1 finding.
- Switch to `main`, synchronize with `origin/main`, freeze the starting `main` SHA, and record it in `logs/agents/<integration-packet>/integrator-<name>.md`.
- Close the next fan-out gate until this workflow completes.
- Do not create or use an integration branch, packet branch, feature branch, or PR branch.

## Inspect before reconciliation

For each incoming packet result on `main`:

1. Identify its commit(s)/diff and compare changed paths with packet ownership.
2. Verify tests and evidence independently.
3. Inventory public contracts, schema/value changes and proposed shared edits.
4. Reject unrelated cleanup, hidden dependency churn, vector assets or undocumented design changes.
5. Ask the original implementer for a focused packet-local correction when possible rather than repairing everything blindly in the integration seam.

## Integrate deliberately on `main`

- Choose a reconciliation order based on dependency direction, not completion time.
- Resolve semantic conflicts against canonical design and frozen contracts.
- Keep one authoritative effect/state/selector/asset path; do not preserve duplicate implementations behind aliases.
- Update shared contracts, root exports, configs and wiki only from the serialized integration packet on `main`.
- Add cross-packet tests for every repaired seam.
- Rerun targeted gates after each major seam repair so the first breaking change is knowable.
- If `origin/main` advances during the integration packet, reconcile/rebase against latest `origin/main` before continuing. Never create a merge/conflict branch.

## Combined verification

Run the full integration-packet gate, including clean install/build, determinism/save/scenario tests, browser/visual/accessibility checks and release dry-run where applicable.

Assign a fresh independent `$critic` to the combined `main` result. Resolve all P0/P1 findings and explicitly disposition lower findings. Critic review does not require a PR.

## Compact and open the gate

Only after the integrated `main` revision is frozen:

1. Write `logs/compacted/WAVE-XX.md` from source logs using the compact template.
2. Update `logs/STATUS.md` with exact SHA/release and legal next packets.
3. Update `work-packets/INDEX.md`: dependencies Integrated, integration packet Integrated, next fan-out packets Ready.
4. Synchronize root/shared wiki pages through `$wiki-sync`.
5. Use `$release` when the integration packet owns a checkpoint.
6. Commit status/index/log changes last so they describe the exact integrated revision.
7. Synchronize with latest `origin/main`, rerun any affected checks, and push `main` only.

## Completion report

State:

- packet commits/revisions reconciled on `main`;
- contracts frozen/changed;
- combined tests and critic verdict;
- release tag/artifacts when any;
- unresolved risks and owning future packets;
- exact packets that may now fan out;
- exact packets still forbidden.

Never open a fan-out gate provisionally.
