---
name: release
description: Prepare, publish, and verify a Petty Lord major checkpoint GitHub Release from an integrated packet using the manual maintained workflow, complete evidence, exact versions, artifacts, checksums, and immutable tag.
---

# Publish a Checkpoint Release

## Preconditions

Read `RELEASES.md`, the owning integration packet, latest compacted log and all relevant critic evidence.

Do not release when:

- the integration packet is incomplete;
- any P0/P1 finding remains;
- local and CI gates disagree;
- version/SHA/content hash/save schema are inconsistent;
- the artifact has not been built from the candidate commit;
- release-critical raster assets are missing or production contains SVG/icon-font/prohibited icon imports;
- required logs/wiki/known issues are absent.

Only integration/release packets may tag or publish.

## Freeze the candidate

- Record exact default-branch commit SHA.
- Ensure the worktree is clean and lockfile frozen.
- Set version/build metadata through the repository’s established mechanism.
- Generate release notes, known issues and test summary from evidence—not memory.
- Run the full checkpoint gate and independent critic appropriate to the release.

## Build artifacts

Using the maintained release workflow/tooling installed by WP-000, produce and verify:

- production static game build;
- wiki build or deployment link;
- compacted log;
- test/browser/accessibility/gameplay summary appropriate to checkpoint;
- known issues;
- checksums;
- representative replay/save/screenshot artifacts where required;
- exact commit, content hash and save compatibility metadata.

Smoke-test the packaged artifact, not only the worktree.

## Publish

- Use the manual `workflow_dispatch` release workflow with explicit version and prerelease flag.
- Confirm the tag does not already exist.
- Create an annotated immutable tag and GitHub Release.
- Attach artifacts and use the structure from `RELEASES.md`.
- Never publish npm packages.
- Never move, rewrite or force-update a published tag.

## Verify after publish

Check:

- release and tag point to the intended SHA;
- every artifact downloads and checksum matches;
- deployed/static build starts and critical smoke flow works;
- release notes/version/build metadata agree;
- wiki/status links resolve;
- prerelease/final flag is correct.

Record release URL/tag/SHA/artifact list and verification in `logs/agents/<packet-id>/release-<name>.md`. Update shared status/compacted logs only through the owning integration packet.

If publication partially fails, do not silently rerun or create a new tag. Diagnose the exact durable state first and follow the workflow’s documented safe-retry behavior.
