# WP-049 — Final Integration, Release Candidate and Complete-Game Release

- **Status:** Blocked
- **Wave:** 4 integration / final
- **Execution:** **Serial integration and release gate**
- **Git target:** `main` only
- **Depends on:** WP-040, WP-041, WP-042 and WP-043 ready for integration with critics complete
- **May run with:** Nothing
- **Must not run with:** Any unfinished packet
- **Primary skill:** `$integrate`
- **Required specialist skills:** `$critic`, `$hunt`, `$ui-audit`, `$wiki-sync`, `$release`
- **Critic:** Required after combined integration
- **Integrator:** This packet is the final integrator
- **Release impact:** Owns `v1.0.0-rc.1` when warranted and `v1.0.0`

## Git execution

Run WP-049 directly on `main`. Do not create or merge packet, feature, integration, release-candidate, or PR branches. Review the Wave 4 packet commits/diffs already on `main`, reconcile final seams serially on `main`, and freeze the exact release revision there. Synchronize with `origin/main` before starting, before shared fixes/versioning, and before every tag/release action.

## Objective

Integrate the final gameplay tuning, UI/accessibility polish, technical hardening and narrative/comprehension work; prove the complete game against design, determinism, usability and release requirements; publish a release candidate when useful; then publish the complete `v1.0.0` static browser game.

This is the last authority for integration order, final regression, versioning, release artifacts, deployment verification, wiki/status/index closure and residual known issues.

## Canonical inputs

- every Wave 4 commit/diff on `main`, finding matrix, seed/replay, screenshot, trace and critic log;
- all previous compacted logs and releases;
- canonical `/designer` package plus accepted amendments;
- [`AGENTS.md`](../AGENTS.md);
- [`TECH_STACK.md`](../TECH_STACK.md);
- [`RELEASES.md`](../RELEASES.md);
- [`wiki.md`](../wiki.md).

## Owned paths

WP-049 may modify all shared final integration/release seams, including:

- root/version/build/release configuration;
- shared simulation/content/UI/app contracts only to resolve proven integration defects;
- cross-packet conflict resolution;
- final tests and fixtures;
- canonical design/balance amendment ledgers when previously approved;
- root README, wiki navigation/operations/reference pages;
- deployment and release notes;
- `CHANGELOG.md` or equivalent release history created by tooling;
- `logs/agents/WP-049/**`;
- `logs/compacted/WAVE-04-FINAL.md`;
- `logs/STATUS.md`;
- `work-packets/INDEX.md` final statuses;
- final tags/releases/artifacts.

Do not add new major systems, broad dependencies, multiplayer/backend/mobile scope, post-coronation play, procedural maps or late visual framework replacements.

## Deliverables

### 1. Integrate Wave 4 from evidence

For each incoming packet result on `main`:

- inspect its exact commit/diff and owned paths;
- confirm every P0/P1 critic finding is resolved;
- inspect gameplay before/after seeds, visual captures, technical regressions and copy inventory;
- reconcile handoffs between packets rather than applying both sides blindly;
- preserve tuning/copy/UI/technical ownership distinctions;
- reject undocumented balance/rule drift;
- reconcile in a deliberate order, normally technical correctness → balance/content → copy → UI polish, rerunning targeted gates after each seam.

### 2. Final design and documentation reconciliation

Audit implementation against every canonical design file.

For each intentional difference:

- show the evidence and approving `$design-guard` amendment;
- update canonical parent file before lower-authority wiki/copy;
- update balance sheet and amendment ledger;
- ensure UI/action preview/ending text matches the actual rule.

There must be no “temporary implementation difference” hidden in comments or logs at release.

### 3. Full deterministic regression

Run and preserve evidence for:

- new-game initialization across all opening packages;
- same-seed command replay;
- uninterrupted versus save/reload versus chunked advancement;
- active Order/AI Intent/campaign/decision/event reload;
- all phase/death boundaries;
- all canonical action contracts;
- every support/Church/Claim/war/occupation/Capital edge case;
- every Council/Acclamation/tie-break scenario;
- every ending reconstruction;
- player dispossession and historical vote;
- corrupt current save/previous checkpoint recovery;
- current schema migration fixtures.

Any mismatch in gameplay outcome, final normalized state or decisive ending facts is a release blocker.

### 4. Final gameplay validation

Using fixed and fresh seeds, complete at least ten integrated runs covering:

- at least two coalition attempts;
- at least two legitimacy/Church/intrigue attempts;
- at least two military/Capital attempts;
- one dispossessed recovery attempt;
- one deliberately hostile/degenerate strategy;
- one new-player-style route;
- one expert route with late tactical adaptation.

Preserve seed/replay/outcome and summarize:

- route viability and pressure;
- dominant/dead choices;
- Deathbed action density;
- AI behavior/variation;
- king-death fairness;
- why each run won/lost;
- any residual balance uncertainty.

Use `$hunt` for a final read-only pass. Do not start a new tuning cycle unless a release-blocking exploit is reproduced.

### 5. Final visual/accessibility validation

Run `$ui-audit` on the exact release build/artifact:

- title/new/resume;
- dense main game at 1280×720 and 1440×900;
- map targeting;
- all political/support/information states;
- action preview and bargains;
- mandatory decisions;
- forecast;
- onboarding/help;
- each major ending;
- storage/error fallback;
- reduced motion;
- keyboard-only critical path;
- text/browser zoom;
- raster loading/failure.

Release blockers include generic dashboard regression, clipped critical controls, hidden-information leak, inaccessible mandatory action or poor raster readability.

Verify again:

- no authored/shipped SVG;
- no inline SVG/data URI/CSS-mask SVG;
- no icon font;
- no Heroicons/Lucide/Radix Icons/other vector icon import;
- no production placeholder in critical slots.

### 6. Final technical validation

On clean clones/build artifacts:

- install from frozen lockfile with no diff;
- run check/typecheck/unit/scenario/simulation/build/Storybook/wiki/browser gates;
- run current stable Chromium, Firefox and WebKit smoke;
- verify static base paths/deployment;
- verify IndexedDB save/resume and update path;
- verify production debug/truth/test code is not exposed;
- inspect bundle/asset sizes and unbounded logs;
- run artifact—not checkout—smoke after packaging;
- verify source/release/build versions and content hash align.

### 7. Independent final critic

Assign a critic who did not lead WP-049 and preferably did not implement the largest Wave 4 changes.

The critic receives:

- release candidate artifact;
- canonical design link;
- known-issue list;
- selected fresh seeds, not only curated winners.

They must attempt to find:

- one incorrect ending/vote explanation;
- one hidden-information leak;
- one save/determinism mismatch;
- one gameplay exploit/nonviable route;
- one inaccessible critical path;
- one generic or broken UI state;
- one release/deployment/artifact discrepancy.

All P0/P1 findings block release. P2 findings require explicit accept/fix rationale in final notes.

### 8. Release candidate decision

Publish `v1.0.0-rc.1` when any of these warrant an external artifact checkpoint:

- major save/schema migration since beta;
- material balance changes needing artifact play;
- production art replacement;
- deployment pipeline changed;
- critic wants artifact-only verification.

An RC must contain the same evidence class as final. After RC smoke/criticism, fix only blockers and rerun affected/full gates.

The integrator may skip the RC when the beta-to-final delta is small, all evidence is green and release policy permits it. Record the rationale.

### 9. Publish `v1.0.0`

Release only when every `RELEASES.md` blocker is clear.

Attach/link:

- production static game build;
- wiki build/deployment;
- checksums;
- exact source SHA;
- WAVE-04-FINAL compacted log;
- complete test summary;
- browser/accessibility/visual summary;
- gameplay run/tuning summary;
- save/schema/content-hash compatibility note;
- known issues;
- selected screenshots;
- design amendment list or “None”.

Verify the published artifact directly, then verify tag and release URLs. Never move or rewrite the published tag.

### 10. Repository closure and handoff

After release:

- update root README with play/build/wiki/design links;
- update wiki release/deployment/troubleshooting pages;
- mark every packet Integrated/Superseded/Deferred accurately;
- update `logs/STATUS.md` to Released with exact tag/SHA;
- create `logs/compacted/WAVE-04-FINAL.md` optimized for future ChatGPT context;
- record residual nonblocking issues with version and reproduction;
- preserve all agent logs and release evidence;
- state the game’s scope is complete and no background task remains.

## Acceptance tests

- [ ] All four Wave 4 packets and critic dispositions are integrated/accounted for.
- [ ] Implementation, canonical design, balance sheet, UI previews, wiki and copy agree.
- [ ] Full deterministic/save/action/succession regression suite passes.
- [ ] Ten complete runs cover required routes and no unresolved release-blocking gameplay issue remains.
- [ ] Exact release build passes keyboard, axe, reduced-motion, target-viewport and cross-browser checks.
- [ ] Production build contains no SVG/icon-font/prohibited icon library or critical placeholder.
- [ ] Clean install/build and packaged artifact smoke pass with matching versions/hashes.
- [ ] Independent final critic clears P0/P1 findings.
- [ ] RC decision is documented; any RC artifact is verified.
- [ ] `v1.0.0` tag/release/artifacts/checksums/SHA verify.
- [ ] Final wiki/README/status/index/compacted log are accurate.

## Required evidence

- `main` integration and finding-disposition matrix;
- final design-diff audit;
- deterministic/save/action/scenario hashes/results;
- ten-run gameplay report with seeds/replays;
- final screenshots/accessibility/browser traces;
- vector/prohibited dependency and placeholder proof;
- clean-install/build/artifact checks;
- final critic report;
- RC rationale/result;
- final release URL/tag/SHA/checksums;
- integrator/auditor/hunter/critic/release logs.

## Agent topology

One final integrator owns reconciliation order, shared fixes, version and release. Specialized read-only reviewers may run final gameplay hunt, UI audit and artifact verification in parallel once the candidate `main` commit is frozen. One independent critic has veto over P0/P1 issues. Release execution begins only after evidence is complete.

## Logging

Create:

- `logs/agents/WP-049/integrator-<name>.md`
- `logs/agents/WP-049/hunter-<name>.md`
- `logs/agents/WP-049/auditor-<name>.md`
- `logs/agents/WP-049/critic-<name>.md`
- `logs/agents/WP-049/release-<name>.md`
- `logs/compacted/WAVE-04-FINAL.md`

## Completion handoff

Report the final playable/release/wiki URLs, tag/SHA, verification summary, known nonblocking issues, save compatibility, and repository status. No further packet is implied unless a concrete post-release bug is opened and executed through `$bugfix`.
