# Checkpoint Release Policy

GitHub Releases mark major integrated checkpoints. They are not produced for every merged packet.

Only an integration or release packet may create a tag or release.

## Planned checkpoints

| Checkpoint | Planned tag | Created by | Required state |
|---|---|---|---|
| Foundation | `v0.1.0-alpha.1` | WP-019 | Tooling, contracts, data foundation, visual language and test harness integrated. |
| Headless game | `v0.2.0-alpha.1` | WP-029 | Complete deterministic run resolves through succession without UI dependency. |
| Playable game | `v0.3.0-beta.1` | WP-039 | Full browser loop, save/resume, onboarding, forecast and ending integrated. |
| Release candidate | `v1.0.0-rc.1` | WP-049 when warranted | Hunt/tune/audit findings resolved; no release blocker. |
| Complete game | `v1.0.0` | WP-049 | Final gates green and release evidence complete. |

The integrator may omit an intermediate release when the checkpoint is not meaningful, but may not invent extra version churn merely to show activity.

## Release tooling contract

WP-000 must install a maintained, manual GitHub Actions release workflow.

Preferred behavior:

- trigger through `workflow_dispatch` with an explicit version and prerelease flag;
- refuse to release an unmerged or non-default-branch commit unless the release packet explicitly authorizes it;
- run the full checkpoint gate before tagging;
- verify the version is consistent in package/build metadata;
- build the production game and wiki;
- create archives and checksums using maintained tools;
- create an annotated tag;
- create a GitHub Release using GitHub-supported tooling and generated release notes where useful;
- attach the production build, wiki build or link, compacted log, test summary, known-issues file, and checksums;
- record the exact commit SHA and seed/build compatibility note;
- avoid bespoke release infrastructure.

The workflow must be rerunnable safely or fail clearly when the tag already exists. It must not publish npm packages; this repository ships a game, not a package library.

## Required release evidence

A release packet must provide:

1. version and exact commit SHA;
2. integrated packet range;
3. compacted ChatGPT-facing log;
4. design amendments, if any;
5. check/lint/typecheck results;
6. unit, scenario, simulation and browser results appropriate to the checkpoint;
7. deterministic same-seed reload evidence;
8. visual/accessibility evidence for playable checkpoints;
9. known issues and consciously deferred work;
10. build artifact verification;
11. rollback/recovery note for save-schema changes.

## Release notes structure

```markdown
# The Petty Lord <version>

## Checkpoint
One paragraph explaining what is now possible.

## Player-facing changes
Only changes visible or meaningful to a player.

## Systems and tooling
Simulation, save, test, wiki, agent, and build changes.

## Design amendments
Links and reasons, or “None”.

## Verification
Commands, CI run, browser targets, deterministic checks.

## Known issues
Specific and ranked. No vague “minor bugs may remain”.

## Artifacts
Game build, wiki, compacted log, checksums.
```

## Release blockers

Do not release when any of these are true:

- the relevant integration packet is incomplete;
- authoritative state can diverge after save/load;
- `Math.random()` or wall-clock timing affects gameplay;
- succession cannot reconstruct every decisive vote/tie-break;
- a required route is impossible or trivially dominant in current evidence;
- a release-critical UI flow lacks keyboard access;
- production UI contains SVG icons, icon-font dependencies, or generic placeholder vector icons;
- the game or wiki build fails;
- mandatory logs or critic evidence are missing;
- a schema migration is untested;
- the packet index and compacted status disagree with the commit being released.

## Post-release actions

After publishing:

- verify the release page, tag, artifacts, and checksums;
- run the release build from the artifact rather than only the working tree;
- update `logs/STATUS.md` and the wiki release page;
- record newly discovered issues against the released version;
- never rewrite or move a published tag.

Use `$release` for the full workflow.
