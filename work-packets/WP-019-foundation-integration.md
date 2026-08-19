# WP-019 — Foundation Integration, Contract Freeze and Alpha Checkpoint

- **Status:** Blocked
- **Wave:** 1 integration
- **Execution:** **Serial integration gate**
- **Depends on:** WP-010, WP-011, WP-012 ready for integration with critics complete
- **May run with:** Nothing
- **Must not run with:** Any Wave 2 packet
- **Primary skill:** `$integrate`
- **Required specialist skills:** `$critic`, `$wiki-sync`, `$release`
- **Critic:** Required after combined integration
- **Integrator:** This packet is the mandatory wave integrator
- **Release impact:** Owns `v0.1.0-alpha.1`

## Objective

Integrate the deterministic kernel, canonical content pack and visual/UI foundation into one coherent repository; repair their seams; freeze the contracts that allow four gameplay-system agents to begin in parallel; and publish the foundation checkpoint when all evidence is green.

Do not split merge repair, contract freeze, wiki synchronization, compacted logging and release into separate packets. They share the same authoritative files and must remain serialized.

## Canonical inputs

- all Wave 1 branches, PRs, implementer logs and critic logs;
- [`AGENTS.md`](../AGENTS.md)
- [`TECH_STACK.md`](../TECH_STACK.md)
- [`designer/README.md`](../designer/README.md)
- [`RELEASES.md`](../RELEASES.md)
- [`wiki.md`](../wiki.md)

## Owned paths

WP-019 may modify all shared integration seams, including:

- root configs and lockfile only when required for a verified integration defect;
- `src/contracts/**`;
- top-level simulation/content/UI exports;
- shared state envelope and content-registry connection;
- application smoke integration;
- cross-boundary tests and fixtures;
- wiki navigation, architecture overview and cross-links;
- root README/status/version/checkpoint notes;
- `logs/agents/WP-019/**`;
- `logs/compacted/WAVE-01.md`;
- `logs/STATUS.md`;
- `work-packets/INDEX.md` status/gate;
- release notes/artifact metadata for `v0.1.0-alpha.1`.

Avoid feature work belonging to WP-020–023.

## Deliverables

### 1. Evidence-first branch integration

Before merging:

- inspect each packet against its owned paths;
- verify implementer and independent critic logs;
- reject or repair unresolved P0/P1 findings;
- confirm no branch modified prohibited shared files without explanation;
- compare toolchain/lockfile drift;
- preserve meaningful history and do not squash away evidence unless the release strategy explicitly requires a clean integration commit.

Integrate in the order that minimizes contract churn, normally kernel → content → UI, while treating all three as peers rather than forcing one branch’s assumptions onto the others.

### 2. Shared contract freeze

Create or finalize the small public contracts later packets may depend on:

- stable entity ID exports;
- validated immutable `GameContent` registry boundary;
- canonical top-level `GameState` envelope and extension points;
- scheduler registration/resolver protocol;
- command/result/effect protocol;
- save/import validation seam;
- content-hash/build-version metadata;
- projection boundary between simulation and UI;
- raster asset slot/manifest contract;
- test-fixture builders that do not couple later systems to UI.

Document which modules are frozen for Wave 2. Prefer narrow interfaces over broad barrels.

Do not implement economy, politics, war, AI, events or succession inside the integration layer.

### 3. Kernel-content proof

Connect canonical content to the data-agnostic kernel only enough to prove:

- validated content loads before a new state can be created;
- a deterministic seed and content hash initialize a generic game envelope;
- the scheduler can advance through a fake registered domain event using canonical IDs;
- export/import preserves the content/build compatibility metadata;
- incompatible or invalid content/save combinations fail clearly;
- no UI/browser dependency enters the simulation.

### 4. UI-content/asset proof

Connect foundation stories/fixtures to canonical display data and asset slots without implementing real feature screens.

Prove:

- canonical lord/territory names and realistic copy lengths render in foundation fixtures;
- raster asset slots map to `RasterIcon`/image contracts;
- a missing production asset produces an explicit development placeholder/warning rather than vector fallback;
- no UI component imports raw mutable simulation state.

### 5. Cross-boundary architecture and invariants

Add tests for:

- forbidden dependency directions;
- no `Math.random()` in simulation;
- no authored/shipped SVG or prohibited icon-library import;
- content pack loads once and is immutable;
- kernel save round-trip includes content hash/schema/build version;
- public contracts compile from representative Wave 2 skeleton consumers;
- clean production, Storybook and wiki builds.

Use maintained tools or straightforward tests. Do not create a custom architecture framework.

### 6. Wiki and onboarding sync

Synchronize:

- architecture overview;
- deterministic simulation and scheduler/RNG;
- content/schema and asset contract;
- UI foundation/visual language;
- command reference;
- agent/work-packet flow;
- current checkpoint status and release page.

Fix any conflict between root docs, wiki and implementation rather than documenting contradictory truths.

### 7. Combined critic pass

After integration, assign an independent critic who did not implement the combined seams.

The critic must attack:

- hidden circular dependencies;
- premature domain logic in the kernel or content;
- save/content hash incompatibility;
- scheduler/PRNG leaks;
- vector/icon/generic-UI leakage;
- inaccessible UI primitives;
- package/CI mismatch;
- contracts too vague for Wave 2 parallelism;
- contracts so broad they force every packet to edit shared files.

Resolve all P0/P1 findings and explicitly dispose of lower-severity findings.

### 8. Foundation checkpoint release

When green, use the manual workflow to publish `v0.1.0-alpha.1`.

Release artifacts/evidence must include:

- game smoke build;
- Storybook build;
- wiki build or deployment link;
- clean test summary;
- WAVE-01 compacted log;
- known issues;
- checksums and exact commit SHA.

This release is for the integrated foundation, not a claim that the game is playable.

### 9. Open Wave 2 fan-out

Last, update:

- `logs/compacted/WAVE-01.md`;
- `logs/STATUS.md`;
- `work-packets/INDEX.md`.

Mark WP-019 Integrated and WP-020/021/022/023 Ready. State the frozen contracts and shared files that only WP-029 may change.

## Acceptance tests

- [ ] All three Wave 1 packets and critic dispositions are accounted for.
- [ ] Fresh clean install produces no lockfile diff.
- [ ] Canonical content initializes a deterministic kernel envelope with content hash/build/schema metadata.
- [ ] Save/export/import round-trip remains exact after content integration.
- [ ] Representative Wave 2 consumers compile against frozen contracts without editing shared modules.
- [ ] Dependency-boundary tests prevent UI/browser imports into simulation and behavior imports into content.
- [ ] Storybook fixtures render canonical data and raster placeholders without SVG/vector fallback.
- [ ] Check, typecheck, all foundation tests, game build, Storybook build, wiki check and Playwright smoke pass together.
- [ ] Combined independent critic clears the integration.
- [ ] `v0.1.0-alpha.1` release points to the exact integrated commit and artifacts verify.
- [ ] WAVE-01 compacted log/status/index open only Wave 2 packets.

## Required evidence

- branch/commit integration map;
- critic finding matrix from all Wave 1 packets and combined review;
- public contract inventory;
- dependency graph/boundary test output;
- deterministic content-init/save proof;
- visual/vector prohibition proof;
- release URL/tag/artifact checks;
- integrator and critic logs.

## Agent topology

One integrator owns all shared seams. It may ask original implementers to explain or patch packet-local defects, but they do not independently edit the integration branch without coordination.

Use a fresh independent critic after the combined suite passes. A release specialist may execute `$release` only after the integrator and critic agree the commit is checkpoint-ready.

## Logging

Create:

- `logs/agents/WP-019/integrator-<name>.md`
- `logs/agents/WP-019/critic-<name>.md`
- `logs/agents/WP-019/release-<name>.md` when separate
- `logs/compacted/WAVE-01.md`

WP-019 alone updates shared status/index.

## Completion handoff

State the exact frozen imports/contracts, release tag/SHA, known risks, and the four legal Wave 2 branches. The next fan-out gate is open only after those statements are committed.
