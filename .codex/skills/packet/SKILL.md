---
name: packet
description: Execute one Petty Lord work packet end to end on main with dependency checks, owned-path discipline, tests, mandatory logging, and critic handoff. Use whenever implementing an indexed WP-### packet.
---

# Execute a Work Packet

## Start

1. Read root `AGENTS.md`.
2. Read `work-packets/INDEX.md` and the assigned packet.
3. Confirm the packet is Ready, every dependency is Integrated, and the current fan-out gate permits it.
4. Read every canonical/design/technical/wiki input named by the packet.
5. Read the latest compacted log and relevant prior agent logs.
6. Switch to `main` and synchronize with latest `origin/main`. Do not create or use a packet/feature/PR branch.
7. Create `logs/agents/WP-###/implementer-<name>.md` from the template and record the starting `main` SHA.

Stop rather than implementing when the gate is closed, the packet overlaps another active owner, required assets are absent, or canonical inputs conflict materially. Record a precise blocker.

## Plan

- Restate the packet objective as one observable outcome.
- List owned and forbidden/shared paths.
- Identify acceptance tests and high-risk invariants before coding.
- Split into sub-agents only when their paths and outputs are disjoint.
- Decide whether the change is significant under `AGENTS.md`; significant work requires an independent critic.
- Do not widen scope or implement later packets.

## Implement

- Make the smallest coherent change that completes the packet.
- Preserve deterministic simulation and source-authority boundaries.
- Add tests alongside behavior.
- Use approved dependencies and primitives; do not change root tooling/lockfile unless the packet owns it.
- Record decisions, assumptions and test outcomes in the agent log as work progresses.
- For UI work, use project foundations and raster-only assets; never introduce SVG/vector icon packages.
- For a design contradiction, invoke `$design-guard` rather than inventing a rule.
- Keep parallel work path-disjoint. Shared seams remain serialized even though every agent works on `main`.

## Validate

Run the narrow tests during iteration, then every gate named by the packet. Capture concise evidence, including seeds/replays, screenshots, traces, accessibility output or save hashes where required.

Inspect the final diff for:

- changes outside owned paths;
- accidental generated files/secrets;
- stale comments/wiki;
- prohibited imports/assets;
- missing tests or unhandled failures;
- design/value drift.

Before committing or pushing, synchronize with `origin/main` again. If remote `main` advanced while local commits exist, rebase onto latest `origin/main`, rerun affected gates, and continue on `main`; never create a conflict-resolution branch.

## Critic handoff

When required:

1. Mark the implementer log `Ready for critic`.
2. Provide the critic the packet, relevant `main` commit/diff, logs and evidence—not a persuasive summary.
3. Resolve every P0/P1 finding.
4. Record explicit disposition for every P2/P3 finding.
5. Rerun affected and packet-level gates.

Self-review does not satisfy independent criticism. A PR is not required for critic review.

## Finish

- Update required wiki pages within owned paths.
- Commit focused changes directly to `main` and leave the checkout clean.
- Synchronize/rebase against latest `origin/main` if necessary, rerun affected checks, then push `main` only.
- Complete the agent log with the final `main` commit SHA and state integration readiness, shared contracts touched, risks and downstream handoff.
- Do not edit `work-packets/INDEX.md`, `logs/STATUS.md` or compacted logs unless this packet is an integration gate.
