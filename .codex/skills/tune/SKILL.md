---
name: tune
description: Tune Petty Lord gameplay values after a reproduced hunt finding, using deterministic before/after evidence, controlled value changes, scenario regressions, and synchronized balance documentation.
---

# Tune Gameplay Values

## Preconditions

Do not begin from intuition alone. Require:

- a reproduced `$hunt` finding or explicit tuning hypothesis;
- seed/replay/policy and baseline revision;
- target metric or observed counterplay failure;
- confirmation that the cause is not a technical bug, hidden-information/UI problem or locked-rule defect.

Only one tuner edits shared balance data at a time.

## Baseline

- Run the exact reproduction and relevant canonical scenarios.
- Run a small controlled batch across multiple openings/seeds/policies.
- Record current values and outcome distribution with limitations.
- Identify the smallest value/policy surface plausibly responsible.

## Change

- Prefer content/data changes to code when the rule is sound.
- Change one coherent hypothesis batch at a time.
- Avoid broad global buffs/nerfs and offsetting changes that obscure causality.
- Preserve asymmetric lord identities and distinct route fantasies.
- Keep previews, content schemas and design values synchronized.
- Never alter support collateral, occupation principles, constitution, knowledge limits or another locked rule without `$design-guard`.

## Verify

After each batch:

1. Rerun the exact reproduction.
2. Rerun nearby route/counterplay scenarios.
3. Rerun deterministic and canonical regression suites.
4. Run a controlled multi-seed comparison.
5. Spot-check browser previews and player-facing reasons.
6. Check for route substitution: the fix may create a new dominant strategy.

Revert changes that merely move the exploit or make a route nonviable.

## Documentation

Update:

- canonical balance data;
- `designer/balance-sheet.md` when values are accepted;
- balance/paperplay wiki page;
- tuner log with before/after tables, exact diff and uncertainty.

Do not claim statistical confidence unsupported by the sample/policies.

## Critic handoff

Provide an independent critic:

- baseline and tuned revisions;
- reproduction seeds/replays;
- exact value changes and hypothesis;
- before/after batch results;
- routes most likely to regress.

The packet is complete only when severe route-substitution findings are resolved or explicitly block integration.
