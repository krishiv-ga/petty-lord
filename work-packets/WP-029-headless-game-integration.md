# WP-029 — Complete Headless-Game Integration and Alpha Checkpoint

- **Status:** Blocked
- **Wave:** 2 integration
- **Execution:** **Serial integration gate**
- **Depends on:** WP-020, WP-021, WP-022 and WP-023 ready for integration with critics complete
- **May run with:** Nothing
- **Must not run with:** Any Wave 3 packet
- **Primary skill:** `$integrate`
- **Required specialist skills:** `$critic`, `$hunt`, `$wiki-sync`, `$release`
- **Critic:** Required after combined integration
- **Integrator:** This packet is the mandatory systems integrator
- **Release impact:** Owns `v0.2.0-alpha.1`

## Objective

Combine all parallel gameplay domains into one complete deterministic game that can initialize, run, save/reload, accept player commands or scripted policies, execute rival AI and events, kill the King, resolve Military Acclamation or Council succession, and reconstruct the ending without requiring React or the browser UI.

No full-screen feature UI may integrate before this packet proves the game exists headlessly.

## Canonical inputs

- all Wave 2 branches, PRs, logs, critics and hostile findings;
- frozen contracts from WP-019;
- all canonical `/designer` files;
- [`TECH_STACK.md`](../TECH_STACK.md);
- [`RELEASES.md`](../RELEASES.md).

## Owned paths

WP-029 may modify all shared gameplay seams, including:

- shared `src/contracts/**` and state envelope;
- top-level simulation registry/reducer/command router;
- cross-domain effect routing;
- content-handler registration;
- save schema/version and migration tests;
- headless/debug/simulation runner modules and commands;
- cross-system scenario/invariant tests;
- wiki navigation/architecture/game-system integration pages;
- `logs/agents/WP-029/**`;
- `logs/compacted/WAVE-02.md`;
- `logs/STATUS.md`;
- `work-packets/INDEX.md`;
- checkpoint version/release notes/artifacts.

Avoid feature-screen implementation. A minimal debug text output or existing smoke shell adapter is allowed only to exercise commands.

## Deliverables

### 1. Integrate from evidence, not optimism

For each incoming packet:

- inspect actual diff and critic disposition;
- rerun packet-specific high-risk tests before merging;
- verify owned-path discipline and no hidden shared contract fork;
- inventory proposed seam changes;
- reject unresolved correctness/cheating/constitutional P0/P1 issues;
- preserve balance-only findings for WP-040 rather than “fixing” them ad hoc.

Integrate the four domains in the order that makes effect routing explicit, normally common time/economy → politics → war → AI/events, then repair reciprocal hooks centrally.

### 2. Complete canonical `GameState`

Finalize the authoritative serializable state for launch scope:

- King/time/phase/death;
- all lords, territories, relationships and support;
- Church, candidacies, agreements and offices;
- Orders and AI Intents;
- military campaigns, mercenaries, garrisons, control and Capital;
- secrets and per-observer knowledge;
- scheduled items, decisions, shocks and event state;
- chronicle;
- ending reconstruction;
- schema/build/content hash/seed/PRNG/sequence IDs.

No authoritative domain state remains in module globals, caches that cannot rebuild, React, or debug-only structures.

### 3. Cross-domain effect routing

Connect typed effects and queries without creating circular ownership:

- Gifts/Court → relationships/opportunities;
- phase changes → candidacy, AI and action availability;
- bargains → resource escrow, troop aid, policy costs and support;
- battle/occupation → Prestige, relationships, threat, proof/shared risk, knowledge and event eligibility;
- secrets/Spy/exposure → political, Church, Claim and support consequences;
- AI Intent → the same legal action lifecycle/resources as player actions;
- threat facts + observer knowledge → AI beliefs and Threaten leverage;
- death → contract/support/Church/Capital validation → Acclamation or Council;
- succession → complete ending record.

Use one explicit routing layer or registered domain handlers. Do not resolve the same effect twice in two systems.

### 4. Complete action catalog

Prove every canonical action can be started, previewed, serialized, resolved, cancelled/invalidated and explained:

- Gift;
- Offer Bargain;
- Request Declaration;
- Threaten;
- Watch Court;
- Find Dirt;
- Research Lineage;
- Forge Royal Descent;
- Expose Secret;
- Invade;
- Raise Taxes;
- Hold Court/Emergency Council;
- Patronize Church;
- Declare Candidacy;
- March on Capital;
- Break Agreement;
- Withdraw Occupation;
- Confess/Penance;
- Cast Greyfen’s historical vote.

Build a machine-readable action contract test from the canonical content registry.

### 5. Freeze UI-facing action intent semantics

Reconcile WP-020/WP-021 presentation-semantic handoffs into one shared Wave 3 contract.

The final preview/decision shape must distinguish gameplay meaning without embedding presentation colors:

- normal **confirm/commit**;
- caution/warning where appropriate;
- destructive/danger only when the action itself carries genuinely destructive, hostile, irreversible-loss or critical meaning;
- disabled/blocked as a separate legality state.

Specific regression requirement: **“Seal and begin the offer” is a normal commit/confirm action, not danger-red by semantic default.** A red wax seal is an in-world art cue and must remain independently legible from the surrounding clickable surface. The Wave 3 UI is expected to use a parchment/surface-colored confirmation control with an intentional outline/edge or equivalent authored treatment rather than a red-filled container when the seal itself is red.

Do not expose `red`, `burgundy`, CSS class names, or other literal palette decisions through simulation/content projections. Freeze the semantic contract here so WP-031 can render it correctly without reinterpreting gameplay intent.

### 6. New-game initialization

Implement one public deterministic new-game function:

- validates content;
- seeds PRNG and death dawn;
- selects/stores opening package and Renard vulnerability;
- creates exact starting resources, actors, map, relationships, support, knowledge and royal state;
- schedules phase/death/initial AI items;
- records content/build/schema metadata;
- produces the first chronicle/onboarding-safe projection;
- passes opening invariants and exact candidate tests.

### 7. Headless player-policy and debug runner

Provide a documented headless runner capable of:

- creating a run by seed;
- applying scripted player policies or explicit command scripts;
- advancing to next decision/Order/death/end instantly;
- selecting deterministic default choices only when a policy says so;
- printing concise time/resources/public succession/major events/ending;
- exporting a command replay and final save;
- running batches without React or Playwright;
- writing bounded JSON/CSV summaries for `$hunt`/`$tune` without becoming a custom analytics product.

Include sample policies representing passive, coalition, legitimacy/intrigue and military attempts. They are test policies, not claimed optimal bots.

### 8. Persistence and replay contract

Finalize save codec/migrations sufficiently for UI integration:

- current and previous checkpoint representation;
- exact import validation and compatibility errors;
- full pending decision/Order/Intent/campaign/event restoration;
- same-seed command replay;
- corruption/unsupported-schema failure;
- migration test fixture strategy;
- deterministic post-load continuation.

IndexedDB orchestration remains WP-032, but the pure save contract must be complete.

### 9. Cross-system scenarios

Implement canonical end-to-end headless tests for at least:

- four-vote Coalition win;
- Church 3–3 tie;
- Capital tie;
- Claim tie;
- Military Acclamation;
- Renard wins despite liking the player;
- Edric candidacy/runoff;
- dispossessed player wins Council;
- coerced vote breaks after leverage loss;
- Commitment resists ordinary reevaluation;
- same-dawn Order then death;
- Capital garrison contract collapses before death;
- pyrrhic Capital becomes Uncontrolled;
- Forgery exposure and Penance;
- eliminated player casts historical vote;
- every opening includes a Renard vulnerability;
- same seed/replay/save reproduces exactly.

### 10. Whole-game hostile pass

Use `$hunt` against the integrated headless game. Attack:

- late declaration dominance;
- promise/collateral loopholes;
- repeat-action conversion engines;
- universal first war;
- military/mercenary snowball;
- AI cheating or five-infinite-hands behavior;
- support pinball;
- no-action Deathbed states;
- notification/event overload;
- unwinnable opening package;
- automatic Renard;
- a route impossible under starting resource arithmetic;
- softlocks after dispossession, full Order slots, missing target, debt, lost leverage, unresolved decision or no candidate;
- save/reload and scheduler nondeterminism.

Correct rule/implementation defects now. Record tuning questions with reproducible seeds for WP-040.

### 11. Combined critic and release

Run an independent combined critic focused on state correctness, cross-domain double effects, constitution, AI knowledge and save determinism.

After clearance, release `v0.2.0-alpha.1` with:

- headless build/game smoke artifact;
- representative replay/save fixtures;
- test/simulation summary;
- WAVE-02 compacted log;
- known balance/UI omissions;
- exact SHA/checksums.

This checkpoint means “the complete game rules run headlessly,” not “the player-facing game is finished.”

### 12. Open Wave 3

Last, update status/index and mark WP-030/031/032/033 Ready. Mark WP-034 Ready only when the approved raster asset drop exists; otherwise state its prerequisite explicitly.

Freeze:

- simulation command API;
- projection boundaries;
- save codec/schema version;
- action preview/result shapes, including semantic confirm/warning/danger intent without literal color coupling;
- decision queue;
- knowledge-safe forecast input;
- ending reconstruction;
- raster asset-slot contract.

## Acceptance tests

- [ ] A fresh seed can run from initialization through death and a legal winner without React.
- [ ] Every action contract has preview/start/resolve/cancel-or-invalidate/serialization coverage.
- [ ] Normal sealed bargain confirmation is a normal confirm/commit semantic; destructive actions are classified separately; no UI-facing gameplay projection contains literal color styling.
- [ ] Every end-to-end scenario above passes and reconstructs reasons.
- [ ] AI uses one Intent, actual resources and observer-limited knowledge in the combined game.
- [ ] Same seed + command script is identical across uninterrupted, save/reload and chunked advancement.
- [ ] Batch runner produces bounded machine-readable summaries and preserves replay seeds.
- [ ] No unresolved P0/P1 whole-game hostile or combined-critic finding remains.
- [ ] Check/typecheck/unit/scenario/simulation/build/wiki gates pass together.
- [ ] `v0.2.0-alpha.1` artifacts and SHA verify.
- [ ] WAVE-02 log/status/index open only legal Wave 3 packets.

## Required evidence

- integration/effect-routing map;
- final GameState/schema inventory;
- full action-contract report including semantic-intent cases;
- end-to-end scenario output and ending reconstructions;
- same-seed/save/replay hashes;
- batch sample across multiple seeds/policies;
- hostile and critic finding matrix;
- release URL/tag/artifact checks;
- integrator/critic/hunter/release logs.

## Agent topology

One integrator owns cross-domain state/effects. Original packet implementers may provide targeted fixes but do not independently redesign seams.

A gameplay hunter may run in parallel once the first integrated build works, but reports findings without changing shared balance data. A fresh critic reviews the final combined diff and selected traces. Release work begins only after both are cleared.

## Logging

Create:

- `logs/agents/WP-029/integrator-<name>.md`
- `logs/agents/WP-029/hunter-<name>.md`
- `logs/agents/WP-029/critic-<name>.md`
- `logs/agents/WP-029/release-<name>.md` when separate
- `logs/compacted/WAVE-02.md`

## Completion handoff

State exact frozen UI-facing commands/projections/save/ending/assets contracts, including action-intent semantics, release tag/SHA, balance seeds deferred to WP-040, and legal Wave 3 fan-out. The next gate opens only after the compacted log/status/index commit.
