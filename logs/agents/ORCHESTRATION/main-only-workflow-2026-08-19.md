# Agent Log — ORCHESTRATION — main-only workflow migration

- **Packet:** Repository workflow policy update requested by project owner
- **Role:** Integrator / workflow maintenance
- **Git target:** `main`
- **Starting revision:** `f294ad9aa81f5e3822bd87b61dfdc6cd0ddce532`
- **Ending revision:** commit containing this log and preceding main-only documentation commits
- **Status:** Complete

## Scope

Owned/changed paths:

- `AGENTS.md`
- `SKILLS.md`
- `.codex/skills/packet/SKILL.md`
- `.codex/skills/integrate/SKILL.md`
- `work-packets/INDEX.md`
- `work-packets/TEMPLATE.md`
- `work-packets/WP-019-foundation-integration.md`
- `work-packets/WP-029-headless-game-integration.md`
- `work-packets/WP-039-playable-game-integration.md`
- `work-packets/WP-049-final-integration-and-release.md`
- `wiki-site/development/agent-workflow.md`
- `wiki-site/development/work-packets.md`
- `logs/AGENT_LOG_TEMPLATE.md`

Explicitly out of scope:

- gameplay implementation;
- packet readiness/status transitions;
- `logs/STATUS.md` and compacted wave logs;
- release/tag changes;
- branch deletion of any pre-existing remote refs.

## Work performed

- Replaced the packet-branch/worktree model with a repository-wide `main`-only Git policy.
- Defined `main` as the only working/push branch for agents and prohibited packet, feature, integration and PR branches.
- Preserved parallel packet execution only for path-disjoint ownership, with synchronization/rebase rules when `origin/main` advances.
- Reframed critic review around `main` commits/diffs rather than PRs.
- Reframed wave integration as serial reconciliation/verification of packet results already on `main`, not branch merging.
- Updated current/future integration packets and the packet template/index to use the same model.
- Synchronized repository-local `$packet`/`$integrate` skills, skill index, workflow wiki, and agent-log template.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| `main` is the sole agent branch | Explicit project-owner instruction | All future packet execution and integration occurs on `main` |
| Parallel-safe remains valid only for disjoint paths | Keeps existing fan-out architecture while avoiding branch isolation | Agents must coordinate/sync before commits and pushes |
| PRs are not required for internal critic review | PR branches would violate the main-only policy | Critics use commit/diff/log evidence directly |
| Existing packet statuses were not changed | Request concerned Git workflow, not gate readiness | `logs/STATUS.md` remains source of truth for current gate state |

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| GitHub branch check | Pass | Repository default/working target remains `main` |
| Search for `wp/WP-###-short-slug` | Pass | No indexed result after migration |
| Search for `integration branch` | Pass | No indexed result after migration |
| Search for `branch/worktree` | Pass | No indexed result after migration |
| Code/test suite | Not run | Documentation/workflow-only change; no production/gameplay code modified |

## Critic findings and resolution

No independent critic was available through the current orchestration surface. This was a direct project-owner workflow-policy change; no production code or canonical game-design rule changed.

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Save/schema impact: none
- Wiki pages updated: `wiki-site/development/agent-workflow.md`, `wiki-site/development/work-packets.md`

## Risks and deferred work

- Existing remote non-`main` branches, if any, were not deleted by this documentation migration. The new policy forbids agents from using or creating them going forward.
- Historical logs/commit messages may still mention branches or PRs as historical facts; active workflow instructions are now main-only.

## Integration notes

- Shared contracts touched: workflow/documentation only
- Reconciliation/order constraints on `main`: synchronize with `origin/main` before work/commit/push; serialize shared seams
- Follow-up packets: all future indexed packets inherit this policy
- Integration-ready: Yes
