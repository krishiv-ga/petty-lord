# WP-040 — Hostile Gameplay Hunt Followed by Evidence-Based Tuning

- **Status:** Blocked by WP-039
- **Wave:** 4
- **Execution:** Parallel Wave 4 packet with **serialized internal phases**
- **Depends on:** WP-039
- **May run with:** WP-041, WP-042, WP-043
- **Must not run with:** WP-049
- **Primary skill:** `$hunt`, then `$tune`
- **Required specialist skills:** `$critic`, `$design-guard` only for a proven locked-rule defect
- **Critic:** Required
- **Integrator:** WP-049
- **Release impact:** Final release candidate

## Objective

Hostile-test the complete playable game for gameplay—not technical—failure modes, then tune only reproduced problems through the smallest data/rule-value changes supported by deterministic evidence.

This is one packet because hunting and tuning the same shared balance data cannot safely run as independent parallel write streams.

## Internal execution order

### Phase A — parallel read-only hunting

Multiple hunters may attack independent strategic families in parallel, but they do not modify production balance/rule files.

Recommended lanes:

- coalition/promise/collateral/late-declaration;
- Claim/Church/intrigue/secret exposure;
- war/occupation/mercenary/Capital;
- AI/opening/event/Deathbed pressure;
- economy/repeat-action conversion and degenerate waiting;
- new-player versus knowledgeable-player route viability.

Each hunter records seeds, exact commands/choices, outcome, severity and suspected cause.

### Phase B — triage and reproduction

One lead reproduces findings against the same integrated revision and classifies:

- gameplay design/balance defect;
- technical bug → hand to WP-042;
- comprehension/UI defect → hand to WP-041 or WP-043;
- intentional harshness/valid counterplay;
- unreproducible/noise.

Do not tune anecdotes that cannot be reproduced.

### Phase C — serialized tuning

One tuner changes shared values/policies in controlled batches, reruns targeted and broad simulations, and records before/after evidence. Do not allow multiple agents to edit the same balance tables simultaneously.

### Phase D — critic and regression hunt

An independent critic attempts to invalidate the tuned conclusions and searches for route substitution: fixing one dominant chain may create another.

## Canonical inputs

- complete beta build and WAVE-03 known issues;
- [`designer/balance-sheet.md`](../designer/balance-sheet.md)
- canonical paperplay tests;
- headless batch runner and browser build;
- [`designer/interface-content-and-production.md`](../designer/interface-content-and-production.md) balance targets.

## Owned paths

Expected write ownership after triage:

- canonical balance/value data under `src/content/**` as designated by WP-039;
- gameplay policy fixtures under `tests/simulation/**` or established batch-runner paths;
- balance/scenario tests;
- `designer/balance-sheet.md` only for accepted canonical value updates;
- `designer/paperplay/final-amendments.md` only through `$design-guard` when a locked rule changes;
- `wiki-site/development/balance-and-paperplay.md`;
- `logs/agents/WP-040/**`.

Do not edit UI layout/copy, app/persistence/technical code, production art, package config, shared packet status or release files.

## Hunt targets

Actively search for:

- late declaration becoming strictly optimal or strictly impossible;
- promise spam, collateral loopholes or unique-office duplication;
- support buying in the final days faster than counterplay can respond;
- relationship or Gift/Feast loops replacing politics;
- repeated tax/court/spy/claim conversion engines;
- one universal supporter or first target;
- mandatory Oswin/Church route or Oswin double value;
- Mara-first/attack-Renard-first universal warfare;
- military snowball despite occupation/garrison rules;
- Threaten replacing voluntary diplomacy;
- second-place hoarding or frontrunner manipulation;
- Pledge pinball, inert Commitment or coercion that never breaks;
- AI that always wins, always loses, or repeats the same opener;
- opening package with no realistic player route or free win;
- Deathbed with no meaningful actions or only a forced move;
- king-death uncertainty feeling arbitrary rather than pressuring;
- dominant event choice, dead event, modal overload or event drought;
- one route substantially safer, faster and more flexible than all others;
- restart/save/replay interaction enabling a gameplay reroll;
- soft loss long before death with no interesting recovery;
- successful run that never requires trade-offs or creates vulnerabilities.

## Evidence requirements

For each accepted finding record:

- version/SHA and seed;
- route/policy and key choice chronology;
- expected counterplay;
- actual outcome and measurable impact;
- frequency across controlled repeats/seeds;
- severity: blocker, dominant, nonviable, misleading, low-variety or polish;
- root cause hypothesis;
- smallest plausible intervention;
- metrics to detect regression.

A “win rate” without policy/seed assumptions is not sufficient evidence.

## Tuning principles

- Change data before code when the rule is sound.
- Prefer one or two values that target the cause over global buffs/nerfs.
- Preserve distinct fantasies and asymmetric personalities.
- Do not equalize routes into identical difficulty or pacing.
- Keep support proof/collateral, occupation cost, one-Intent AI, exact constitution and information limits intact unless `$design-guard` proves a rule defect.
- Tune toward meaningful counterplay, not arbitrary 50% outcomes.
- Keep values readable and previews truthful.
- Re-run fixed canonical scenarios after every batch.

## Target evaluation

Use the design targets as diagnostics, not blind quotas:

- no legal opening produces Renard wins above 75% against varied competent policies without clear player mistakes/counterplay;
- Coalition, legitimacy/intrigue and military targeted policies each demonstrate viable wins across multiple seeds;
- no deterministic skilled opener across the opening packages;
- typical run contains roughly 12–20 player initiatives, 0–3 wars and 4–8 direct decisions, with exceptions allowed for route identity;
- Deathbed nonterminal states expose at least three high-value legal actions or explain why the player has strategically foreclosed them;
- a new player can understand why they lost;
- a strong player cannot remove all risk through one early script.

## Deliverables

1. Severity-ranked hunt report with reproductions and handoffs.
2. Baseline batch/simulation results by opening and policy.
3. Minimal tuning commits grouped by hypothesis.
4. Updated balance sheet and tests.
5. Before/after comparison including unintended-route checks.
6. Residual known gameplay risks for WP-049.

## Acceptance tests

- [ ] Hunters cover all recommended lanes and write independent logs.
- [ ] Every tuned issue has a deterministic reproduction and before/after evidence.
- [ ] Technical/UI/copy defects are handed off rather than “fixed” in balance data.
- [ ] No shared balance file is concurrently edited by multiple tuners.
- [ ] Canonical scenario and determinism suites remain green after each accepted batch.
- [ ] At least three strategic families demonstrate viable wins across multiple openings/seeds.
- [ ] No accepted P0/P1 dominant/unwinnable gameplay defect remains.
- [ ] Values/previews/wiki/design balance sheet remain synchronized.
- [ ] Independent critic/regression hunt clears severe route-substitution issues.
- [ ] Standard gates pass.

## Required evidence

- all hunter logs and seed/replay artifacts;
- finding triage matrix with packet handoffs;
- before/after simulation tables and confidence limitations;
- exact value diffs with rationale;
- browser spot-checks for preview truth;
- critic log.

## Agent topology

Parallelize only read-only hunting. One hunt lead triages; one tuner serially edits shared values; one independent critic attacks the tuned build. Use an integrator inside the packet only if tuning spans distinct data modules and scenario fixtures with merge risk.

## Logging

Create as applicable:

- `logs/agents/WP-040/hunter-coalition-<name>.md`
- `logs/agents/WP-040/hunter-legitimacy-<name>.md`
- `logs/agents/WP-040/hunter-military-<name>.md`
- `logs/agents/WP-040/hunter-ai-pressure-<name>.md`
- `logs/agents/WP-040/tuner-<name>.md`
- `logs/agents/WP-040/critic-<name>.md`

## Completion handoff

Provide accepted/rejected/deferred finding matrix, exact value changes, representative seeds/replays, remaining uncertainties and integration readiness for WP-049.
