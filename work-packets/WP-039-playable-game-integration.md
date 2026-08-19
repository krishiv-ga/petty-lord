# WP-039 — Complete Playable-Game Integration and Beta Checkpoint

- **Status:** Blocked
- **Wave:** 3 integration
- **Execution:** **Serial integration gate**
- **Depends on:** WP-030, WP-031, WP-032, WP-033 and WP-034 ready for integration with critics complete
- **May run with:** Nothing
- **Must not run with:** Any Wave 4 packet
- **Primary skill:** `$integrate`
- **Required specialist skills:** `$ui-audit`, `$critic`, `$wiki-sync`, `$release`
- **Critic:** Required after combined integration
- **Integrator:** This packet is the mandatory playable-game integrator
- **Release impact:** Owns `v0.3.0-beta.1`

## Objective

Integrate the complete headless game, application shell, raster map, political/action interface, forecast/onboarding/ending and production raster asset pack into one browser game that a new player can start, understand, play through, lose or win, inspect, resume and replay.

This packet owns global composition and seams. Do not fragment layout integration, asset wiring, end-to-end testing, visual criticism and beta release into separate concurrent tasks.

## Canonical inputs

- all Wave 3 branches, PRs, screenshots, logs, audits and critic dispositions;
- frozen simulation/projection/save/ending/asset contracts from WP-029;
- canonical design package;
- [`TECH_STACK.md`](../TECH_STACK.md);
- [`RELEASES.md`](../RELEASES.md).

## Owned paths

WP-039 may modify all shared browser integration seams, including:

- application composition/root routes;
- shared store selectors and feature callbacks;
- global game-screen layout and responsive constraints;
- shared UI exports/tokens only where integration evidence requires;
- production asset manifest/wiring adjustments;
- cross-feature and full-run browser tests;
- static deployment configuration;
- wiki navigation/operations/playable architecture pages;
- `logs/agents/WP-039/**`;
- `logs/compacted/WAVE-03.md`;
- `logs/STATUS.md`;
- `work-packets/INDEX.md`;
- beta release notes/version/artifacts.

Do not change canonical gameplay/balance rules without `$design-guard` and evidence from a complete run.

## Deliverables

### 1. Integrate feature branches from evidence

For every incoming packet:

- confirm owned-path discipline;
- review implementer/auditor/critic logs;
- inspect visual evidence at target viewports;
- rerun high-risk tests;
- reject unresolved P0/P1 accessibility, hidden-information, persistence, vector or interaction findings;
- inventory callbacks/contracts and shared layout assumptions;
- validate WP-034 production pack and regeneration closure.

Merge feature branches into one integration branch and resolve semantic—not merely textual—conflicts.

### 2. Global screen composition

Create the final main-screen composition for minimum 1280×720 and preferred 1440×900:

- top crisis/resource/time strip;
- left or compositionally appropriate lord portrait rail;
- central raster map with sufficient territory targets;
- right political/territory inspector and actions;
- bottom two Orders and chronicle;
- forecast/help access;
- mandatory decisions layered as political letters/proclamations.

The exact frame may adapt from this scheme when usability evidence supports it, but must remain a political command table—not a generic sidebar/card dashboard.

Resolve:

- panel resizing/overflow;
- map-versus-inspector priority;
- low-height behavior;
- keyboard focus order across regions;
- selected lord/territory/action handoffs;
- modal/popover layering;
- direct chronicle links;
- reduced motion and safe transitions.

### 3. Complete application wiring

Wire all real features through the frozen store/command/projection interfaces:

- title → new/resume;
- map/lord selection;
- all action variants and map targets;
- Orders and cancellation;
- reactions/mandatory decisions;
- pause/speed/visibility;
- chronicle and direct interruptions;
- succession forecast;
- contextual onboarding/help;
- death → succession → ending;
- same/new seed replay;
- save/export/import/debug in development.

Remove stub callbacks and fixture-only paths from production behavior.

### 4. Production raster asset integration

Use the validated WP-034 manifest everywhere.

- No feature hardcodes filenames.
- No production placeholder remains in a release-critical slot.
- Every icon/portrait/map/seal/texture has intrinsic dimensions and accessible semantics.
- No `.svg`, inline SVG, icon font, Heroicons/Lucide/Radix Icons/other vector package import, runtime rasterization or vector fallback.
- Missing-asset development warnings remain useful; production fallbacks are raster and safe.
- Verify visuals in actual integrated contexts rather than contact sheets alone.

### 5. Integrated onboarding and comprehensibility

Run a clean-seed new-player path and ensure the game teaches:

- objective and prognosis;
- pause, speed and two Orders;
- Renard’s initial advantage;
- attitude versus succession support;
- Proof, collateral and maturation;
- Claim and Church distinction;
- war/occupation costs;
- forecast uncertainty;
- what changed in each phase;
- why the final result occurred.

Do not force one strategic route or overload the opening with every rule.

### 6. Full browser run tests

Add Playwright flows using deterministic debug acceleration where necessary while still testing normal command/UI paths:

- new game → first initiative → Ailing → declare → Pledge → death → Council ending;
- Claim/Church route;
- war/occupation/Capital route and Acclamation ending;
- Spy/secret exposure route;
- dispossession → continued political play;
- full Order slots + defense reaction;
- active campaign/pending decision save/reload;
- hidden tab pause;
- same-seed replay;
- player elimination and historical vote;
- corrupt-save fallback;
- keyboard-only critical path.

At least one unaccelerated short segment must prove the real time driver and progress UI; do not spend CI time on a literal 56-minute run.

### 7. Visual and accessibility integration audit

Run `$ui-audit` on the integrated game, not only component stories.

Review:

- whether it looks authored rather than vibe-coded;
- visual hierarchy under dense late-game state;
- map readability with real art;
- portrait/support/ribbon clarity;
- action consequence readability;
- forecast and ending reconstruction;
- focus order, traps/return, keyboard shortcuts;
- no color-only states;
- contrast and type size;
- reduced motion;
- 1280×720 overflow;
- raster icon legibility at actual sizes;
- modal/notification overload.

Capture before/after screenshots for material fixes.

### 8. Integrated critic and complete play sessions

Assign an independent critic with access to production build and deterministic seeds.

Require at least:

- one coalition attempt;
- one legitimacy/intrigue attempt;
- one military attempt;
- one deliberately hostile/odd route;
- one save/resume interruption;
- one keyboard-focused session.

The critic should report gameplay defects separately from tuning questions. Correct implementation/usability P0/P1 issues now; route balance goes to WP-040 unless it makes the beta impossible to evaluate.

### 9. Static deployment and beta release

Produce a static deployment build with correct base paths, asset caching and no server dependency.

Publish `v0.3.0-beta.1` only after:

- full integrated gates are green;
- production raster pack is complete;
- no release blocker from `RELEASES.md` remains;
- at least four complete integrated play sessions finish;
- save/reload/ending reconstruction are verified.

Attach/link:

- production game build;
- wiki;
- test/Playwright/axe summary;
- selected screenshots/traces;
- WAVE-03 compacted log;
- known gameplay/visual issues for Wave 4;
- exact SHA/checksums.

### 10. Open Wave 4

Last, update compacted log/status/index and mark WP-040/041/042/043 Ready.

Freeze for polish:

- player-facing layout regions and primary flows;
- save schema unless a bug requires migration;
- simulation command/projection boundaries;
- production raster asset-slot IDs;
- release command surface.

## Acceptance tests

- [ ] A new player can complete a full browser run and receive a correct ending without debug-only interaction.
- [ ] Every canonical action is reachable through integrated UI when legal.
- [ ] Map, lord rail, inspector, Orders, chronicle, forecast, decisions, onboarding and ending share one coherent visual language.
- [ ] Save/resume is exact during active Orders, campaign and mandatory decision.
- [ ] Hidden information never leaks in forecast, lord UI or chronicle.
- [ ] Integrated production source/assets contain no SVG/vector/icon-font dependency or production placeholder.
- [ ] Keyboard-only critical path and axe checks pass.
- [ ] 1280×720 and 1440×900 screenshots have no clipped critical controls or generic dashboard composition.
- [ ] All full-run Playwright scenarios and simulation regressions pass.
- [ ] Independent integrated critic clears P0/P1 issues.
- [ ] `v0.3.0-beta.1` release/artifacts/SHA verify.
- [ ] WAVE-03 log/status/index open only Wave 4 packets.

## Required evidence

- branch integration map and finding matrix;
- integrated screenshots before/after audit;
- full browser run traces/videos/screenshots;
- save/reload state hashes;
- vector/prohibited-dependency proof;
- production asset manifest/hash/placeholder report;
- accessibility results;
- beta release URL/artifacts/checksums;
- integrator/auditor/critic/play-session logs.

## Agent topology

One integrator owns global composition and cross-feature callbacks. Original implementers may make targeted packet-local fixes under coordination.

Use an integrated UI auditor and a separate independent critic/playtester. A release specialist acts only after all blockers clear.

## Logging

Create:

- `logs/agents/WP-039/integrator-<name>.md`
- `logs/agents/WP-039/auditor-<name>.md`
- `logs/agents/WP-039/critic-<name>.md`
- `logs/agents/WP-039/playtest-<name>.md` for distinct sessions where useful
- `logs/agents/WP-039/release-<name>.md` when separate
- `logs/compacted/WAVE-03.md`

## Completion handoff

State beta URL/tag/SHA, integrated screen/command/save/asset contracts, reproducible Wave 4 findings/seeds, and exact legal parallel polish packets. Open the final fan-out gate only in the committed status/index update.
