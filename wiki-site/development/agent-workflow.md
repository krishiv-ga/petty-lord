# Agent workflow

Read `AGENTS.md`, the assigned packet, named canonical sources, `TECH_STACK.md`, triggered local skills,
the root wiki entry and latest compacted log. Record scope, decisions, tests and risks under
`logs/agents/<packet-id>/`.

All agent Git work happens directly on `main`. Do not create packet, feature, integration or PR branches.
Before starting, before committing and before pushing, synchronize with `origin/main` and re-check owned
and shared paths. Parallel packets are still allowed when ownership is disjoint, but branch isolation is
not: separate concurrent checkouts/clones must all remain on `main`.

The wave integrator owns shared seams, combined verification and the next gate. Integration means
reviewing packet commits/diffs already on `main`, reconciling shared contracts serially on `main`, running
the combined suite and freezing the checkpoint revision; it does not mean merging feature branches.
Independent critics review the relevant `main` commit/diff, logs and evidence without requiring a PR.

Wave 2 packets begin only from the integrated WP-019 revision. Their frozen shared imports live under
`src/contracts`; proposed changes to those seams are integration notes for WP-029, not four parallel
edits. WP-020–WP-023 own their respective system modules and wiki pages while root configuration,
shared contract barrels, status/index and compacted logs remain serialized integration paths.
