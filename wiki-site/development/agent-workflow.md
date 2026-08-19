# Agent workflow

Read `AGENTS.md`, the assigned packet, named canonical sources, `TECH_STACK.md`, triggered local skills,
the root wiki entry and latest compacted log. Record scope, decisions, tests and risks under
`logs/agents/<packet-id>/`.

Parallel packets use separate worktrees and disjoint ownership. The wave integrator owns shared seams,
combined verification and the next gate.

Wave 2 packets begin only from the integrated WP-019 revision. Their frozen shared imports live under
`src/contracts`; proposed changes to those seams are integration notes for WP-029, not four parallel
edits. WP-020–WP-023 own their respective system modules and wiki pages while root configuration,
shared contract barrels, status/index and compacted logs remain serialized integration paths.
