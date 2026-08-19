---
name: bugfix
description: Fix a concrete Petty Lord technical defect with a reproducible failure, smallest root-cause patch, regression test, relevant full gates, and mandatory bugfix logging. Not for gameplay tuning or speculative refactors.
---

# Direct Bugfix

## Reproduce first

Record:

- build SHA/version;
- seed/save/replay or exact browser steps;
- expected and actual behavior;
- frequency;
- user/system impact;
- owning packet/path.

Create a failing automated test or deterministic fixture before or with the patch. When automation is genuinely impossible, preserve a Playwright trace/screenshot and explain why.

Do not use this skill for “the military route feels weak” or another gameplay judgment; use `$hunt`/`$tune`.

## Diagnose

- Trace the first incorrect authoritative transition or UI contract violation, not only the final symptom.
- Check scheduler order, save/load, observer knowledge, duplicate effects, stale projections and browser lifecycle before adding guards.
- Confirm whether the canonical rule is clear. Invoke `$design-guard` only when the rule itself is defective.
- Inspect related logs/known issues to avoid reintroducing a prior bug.

## Patch

- Make the smallest coherent root-cause fix.
- Preserve deterministic state and source-authority boundaries.
- Do not add unseeded randomness, wall-clock gameplay, retries that can double-dispatch, silent catches or broad dependency churn.
- Do not refactor unrelated modules “while here.”
- For UI bugs, retain raster-only assets and accessibility.
- For save/schema changes, add explicit migration/compatibility tests and document impact.

## Verify

Run:

1. the new regression test;
2. nearby subsystem tests;
3. determinism/save scenarios when authoritative state is touched;
4. browser/visual/accessibility tests when UI is touched;
5. the packet’s standard gates.

Re-run the original reproduction from the same seed/save/artifact.

## Log and review

Create/update `logs/agents/<packet-id>/implementer-<name>.md` with cause, patch and tests. Significant fixes—scheduler, saves, succession, AI knowledge, build/release or major UI flows—require an independent `$critic`.

State whether the bug affected released saves/builds, whether a migration/workaround exists, and any follow-up packet.
