# Agent Log — WP-019 — Critic/Independent

- **Packet:** WP-019 Foundation Integration, Contract Freeze and Alpha Checkpoint
- **Role:** Critic
- **Branch/worktree:** `wp/WP-019-foundation-integration` / `petty-lord-wp019`
- **Starting revision:** `8a213c56abf33c066fa0545d32c3ef486cd5b944` (`origin/main`)
- **Reviewed candidate:** `6e6c435c22d829809a7bf8c1e2bd23cb1511325f`
- **Ending revision:** `6e6c435c22d829809a7bf8c1e2bd23cb1511325f` plus this critic log only
- **PR:** pending
- **Status:** Complete — blocked pending fixes and re-review

## Scope

Owned path:

- `logs/agents/WP-019/critic-independent.md`

Reviewed without modifying:

- the actual integration diff `origin/main...6e6c435c22d829809a7bf8c1e2bd23cb1511325f`;
- the unique WP-010, WP-011 and WP-012 histories, implementer logs, critic/auditor logs and their
  dispositions;
- `src/contracts/**`, connected application/content/simulation/raster seams, representative consumer
  and architecture tests;
- package/build metadata, CI/manual-release workflow, production/Storybook/wiki artifacts and shared
  status/onboarding documentation;
- canonical character masters and the `full`/`bust`/`tight` derivative-character contract.

Explicitly out of scope:

- Production-code, baseline, workflow, packet-index, status, release or wiki fixes. The integrator
  remains responsible for every disposition and rerun.
- Publishing a tag/GitHub Release or opening Gate 2.

## Work performed

- Read the repository authority chain, WP-019, canonical integration/art/release inputs, latest
  compacted log, all WP-010/011/012 evidence and the WP-019 integrator log before judging the diff.
- Confirmed the three incoming packet histories are attributable and their unique changes stay within
  their packet-owned source/test/wiki/log paths. Their prior P0/P1 findings are recorded as resolved.
- Inspected the actual shared seam rather than relying on the integrator narrative, with emphasis on
  Wave 2 parallel consumers, save/content/build compatibility, registry immutability, dependency
  direction, semantic raster slots and release mechanics.
- Ran the full local foundation gate and inspected the generated production, Storybook and wiki
  artifacts. The game build has no SVG file or canonical full-master portrait payload; the four SVG
  files in Storybook are framework-owned manager favicons and remain outside the shipped game.
- Ran a new browser-runtime adversarial probe against the real Vite-transformed modules. It proved
  post-registration resolver replacement, contradictory metadata import acceptance and mutation of a
  supposedly frozen raster manifest into an accepted SVG data source.
- Visually inspected the failed lord-strip expected/actual/diff evidence. The failure is deterministic
  integration drift, not an unreadable image artifact: Greyfen now repeats `Lord of Greyfen` in the
  title/detail line and the maintained baseline was not reconciled.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| The candidate is the pre-release combined-critic revision, so missing tag/WAVE-01/status transitions are pending obligations rather than automatically findings | WP-019 orders the critic before release/gate opening, and the integrator log explicitly marks those steps pending | The verdict still blocks release/opening; findings distinguish incomplete planned work from defects in the implementation/workflow |
| “Frozen Wave 2 contracts” must let all four named packets compile real state/effect skeletons without importing private content/kernel modules or editing shared files | WP-019 acceptance and the four Wave 2 packets explicitly require this | One empty generic module is not representative acceptance evidence |
| Runtime immutability matters for registries/manifests that determine authoritative resolution or raster format | TypeScript `readonly` disappears at runtime, while deterministic behavior and no-SVG are release invariants | Mutable `Map` and nested raster objects are shared-contract defects, not style preferences |
| Storybook manager SVGs are development-tool assets, not shipped-game SVG leakage | `TECH_STACK.md` and Wave 00 explicitly isolate Storybook; `dist/` has zero SVG files | No finding is raised merely for Storybook's four framework favicons |

## Ranked critic findings

| Severity | Location | Finding and exact evidence | Expected behavior / impact | Recommended resolution |
|---|---|---|---|---|
| **P1** | `src/contracts/ids.ts:1-7`; `src/contracts/state.ts:18-22`; `src/sim/state/types.ts:68-82`; `src/sim/kernel/types.ts:12-45`; `tests/unit/wave2-contract-consumers.test.ts:20-44`; `wiki-site/architecture/deterministic-sim.md:22-28` | **The claimed Wave 2 contract freeze is still a generic/stringly placeholder and does not cover the four consumers it is supposed to unblock.** The public ID seam exports only action/lord/phase/territory IDs, while WP-021/WP-023 immediately require bargains, support levels/bases, Church states, collateral, proofs, red lines, secrets, openings, events, shocks, conditions and effect IDs already present in `src/content/ids.ts`. `FoundationDomainExtensions` adds only `compatibility` to the unchanged all-domain `JsonValue` containers. Scheduled kinds and `SimulationEffect.kind` remain arbitrary strings, with no typed cross-domain query/effect protocol for economy↔politics↔war↔knowledge. The “representative Wave 2” test compiles one empty module and never models WP-020/021/022/023 state ownership or required hooks. The unresolved WP-011 question about canonical Pledged/Under-Duress representation receives no disposition. | WP-020–023 must not be forced to duplicate IDs, import private `src/content`/`src/sim` modules, write overlapping broad keys, or invent incompatible effect strings. That would break the shared contract and defeat safe fan-out. Freeze narrow system-owned state namespaces/extension interfaces, export all required stable ID families, define discriminated shared effects/queries/results, dispose of Under Duress explicitly, and compile four non-empty packet skeletons using only the smallest public submodules. |
| **P1** | `src/sim/kernel/registry.ts:17-52`; `src/sim/kernel/types.ts:143-149`; `wiki-site/architecture/deterministic-sim.md:49-57` | **The scheduler registry is publicly mutable after duplicate validation.** `createKernelRegistry` returns five writable `Map` instances. The adversarial probe created a trusted resolver, resolved one state, replaced `registry.scheduledResolvers['critic.event']`, then resolved the identical seed/state again. Results changed from `outcome: "trusted"` to `outcome: "mutated"`; both registry and map reported `Object.isFrozen(...) === false`. | Resolver identity is configuration for authoritative deterministic behavior. Same state + seed + commands must not change because a consumer retained and rewrote a registry map. Do not expose writable maps: finalize registrations behind read-only lookup methods/private maps, reject post-construction changes, and add a regression proving replacement/clear/delete are impossible while duplicate registration still fails. |
| **P1** | `src/contracts/assets.ts:30-67`; `src/assets/raster/characterPortraits.ts:26-91`; `src/content/assets.ts:58-63` | **The “frozen” raster manifest is shallow and can be mutated into an accepted SVG source; its three semantic compositions also alias one incompatible content slot.** Runtime evidence: manifest and entry were frozen, but `entry.asset`, `asset.sources`, and the source object were not. Replacing `character.edric.full.asset.sources[0].src` with `data:image/svg+xml,%3Csvg%3E` succeeded, and `resolveFoundationRasterAsset` returned `available: true` with no warning. Separately, `full`, `bust` and `tight` all advertise `contentSlotId: portrait-edric` (and peers), whose content contract is one 180×240 portrait, while actual descriptors are full 1024×1536/1086×1448 and square 80×80/64×64; manifest construction validates only ID presence, not source format/dimensions/density. | This is a broken shared raster contract and a direct bypass of the release-blocking vector prohibition. Deep-freeze or defensively clone validated descriptors, validate every resolved source, and give full/bust/tight distinct semantic content specifications (or remove the misleading `contentSlotId` link) with actual aspect/dimension/density checks. Add mutation and SVG-data-source regressions. |
| **P1** | `README.md:9-12,63-64`; `logs/STATUS.md:3-11`; `work-packets/INDEX.md:5-13`; `wiki-site/index.md:13-16` | **Human-facing onboarding already declares WP-019 integrated and Gate 2 open while the authoritative status/index still say Wave 1 is open, WP-019 is waiting, and WP-020+ are blocked.** The critic is not clear, the release/tag does not exist, `logs/compacted/WAVE-01.md` does not exist, and the wiki already links to that nonexistent handoff. | The packet explicitly forbids Wave 2 until critic, release, status and index are complete. This contradiction can trigger illegal parallel work from an unreviewed base. Keep README/wiki language pending until the final gate commit, or update README/wiki/status/index/WAVE-01 atomically only after the critic is clear and the release is verified. Add a status-consistency check covering these entry points. |
| **P1** | `.github/workflows/release.yml:50-75,108-155`; `package.json:3`; `src/contracts/state.ts:8`; `RELEASES.md` release tooling/evidence contract | **The maintained workflow cannot by itself satisfy the WP-019 checkpoint evidence and version-consistency contract.** It verifies the input only against `package.json`, while save/build compatibility is a separately hard-coded `FOUNDATION_BUILD_VERSION` with no parity check. It builds Storybook but packages only game/wiki archives; the release therefore lacks the required Storybook build artifact/link. It uses generic generated notes rather than the required checkpoint/player/system/design/verification/known-issues/artifact structure, and it stops immediately after `gh release create` without downloading/verifying the published files/checksums/tag or running the game artifact. | A green dispatch could publish an incomplete or mislabeled foundation checkpoint, and future package/state version drift would silently change release labels without changing save compatibility. Derive version metadata from one source or assert exact parity in tests/workflow; package/link Storybook evidence; create structured notes; and add post-release tag/SHA/artifact/checksum plus extracted-game smoke verification before WP-019 records success. |
| **P2** | `src/contracts/state.ts:42-57,61-111`; `src/contracts/foundation.test.ts:29-67`; `wiki-site/architecture/deterministic-sim.md:72-77` | **Import accepts state whose deterministic metadata contradicts its compatibility block.** Creation mirrors content hash/schema into `metadata.values`, but `compatibilityIssues` validates only `state.compatibility`. The adversarial probe changed mirrored hash to `fnv1a64-0000000000000000` and schema to `999` while leaving compatibility canonical; `importFoundationGameState` returned `ok: true` and preserved both false values. | A save must have one unambiguous content/build identity. Validate every documented mirror (and build/save mirrors if retained), or remove duplicate authority and expose one canonical compatibility object. Add tampered-mirror regressions with exact paths. |
| **P2** | `src/ui/fixtures/foundationFixtures.ts:23-40`; `tests/ui/foundation/foundation.spec.ts:46-58`; `tests/ui/foundation/baselines/lords-1280x720.png` | **The integrated canonical fixture fails its maintained visual gate and visibly duplicates Greyfen's title.** Independent Chromium at 1280×720 produced 9,959 changed pixels (~2%). The actual fixture renders `The Lord of Greyfen`, then `Lord of Greyfen · Player seat · Keeper of the Fen Roads`; the prior reviewed baseline had only the nonduplicated detail. The other ten UI tests pass. | Reconcile the projection/fixture so canonical identity is not redundantly repeated, visually review at the required viewport, then deliberately refresh the baseline. Do not merely accept/update the screenshot without fixing the visible copy regression. |
| **P2** | `tests/unit/architecture.test.ts:15-35`; `tests/sim/boundary.test.ts:1-8`; `src/contracts/index.ts:1-6` | **The dependency guard does not prevent the hidden imports it claims to freeze.** It scans only TS/TSX text, requires `from` syntax, and does not catch side-effect/dynamic imports or browser globals such as `window`, `document`, `localStorage`, `indexedDB`, `fetch`, `setInterval` or browser crypto. The headless test only proves those globals are absent in the current test process. It also does no transitive graph check, even though the broad `@contracts/index` barrel re-exports raster/content/state modules and the docs tell future `src/sim/systems/**` code to consume contracts. | A later simulation module can introduce a browser/global or transitive content/asset dependency without tripping this gate. Use a maintained import-boundary check or a complete static dependency walk, forbid the browser-global surface, and test actual non-empty `src/sim/systems` skeletons importing only simulation-safe contract submodules. Prefer narrow submodule imports and avoid the broad barrel for simulation. |

No P0 finding was identified. The existing kernel/content/UI packet findings were correctly preserved in
history, but the new WP-019 shared seam has unresolved P1 defects and cannot open Gate 2.

## Acceptance tests independently verified

| WP-019 acceptance item | Result | Evidence/notes |
|---|---|---|
| All three Wave 1 packets and critic dispositions accounted for | **Pass** | Merge commits preserve WP-010 `944e824`, WP-011 `88e0f34`, WP-012 `719c5f4`; unique packet diffs/logs reviewed; no unresolved incoming P0/P1 |
| Fresh clean install produces no lockfile diff | **Pass** | `pnpm install --frozen-lockfile` reported already up to date; status clean before/after |
| Canonical content initializes deterministic metadata | **Pass on canonical creation** | Repeated state equality and canonical content hash `fnv1a64-74442a9f99aadb91`; import consistency is partial because the tampered metadata mirror is accepted |
| Save/export/import round-trip remains exact | **Pass for honest round trip; fail for contradictory metadata** | 43-unit suite passes; adversarial mirror probe fails closedness (P2) |
| Representative Wave 2 consumers compile without shared edits | **Fail** | Only one empty generic module and four ID families compile; four packet-specific state/effect/query skeletons are absent (P1) |
| Dependency-boundary tests prevent forbidden directions | **Partial** | Current source scan is clean, but the test misses browser globals, side-effect/dynamic/transitive imports (P2) |
| Storybook fixtures render canonical data/raster placeholders without vector fallback | **Partial/fail** | Storybook builds, raster behavior/axe/keyboard pass, but maintained lord screenshot fails and Greyfen copy duplicates (P2) |
| Character slot contract exposes full/bust/tight without hardcoded files | **Fail as a frozen runtime contract** | Semantic keys/statuses exist, but nested assets are mutable to SVG and all three alias one generic incompatible content slot (P1) |
| Check/typecheck/tests/builds/wiki/Playwright pass together | **Fail** | All nonvisual gates pass; foundation Playwright is 10/11 with the lord-strip screenshot failure |
| Combined independent critic clears integration | **Fail** | This review verdict is Blocked |
| `v0.1.0-alpha.1` release points to exact integrated commit and artifacts verify | **Not run / blocked** | No local or remote tag; workflow evidence/verification defects must be fixed first |
| WAVE-01/status/index open only Wave 2 | **Not run / blocked, with current contradiction** | WAVE-01 absent and status/index correctly remain pre-integration, while README/wiki prematurely claim the opposite (P1) |

## Tests and evidence run

| Command/check | Result | Evidence/notes |
|---|---|---|
| `git diff --stat/name-status origin/main...6e6c435` and per-branch ownership/history audit | Pass | 150-file integrated diff inspected; packet histories attributable and merge order kernel → content → UI preserved |
| `git diff --check origin/main...6e6c435` | Pass | No whitespace errors |
| `pnpm install --frozen-lockfile` | Pass | Already up to date; no lockfile/worktree diff |
| `pnpm check` | Pass | 100 files; no fixes |
| `pnpm typecheck` | Pass | Strict TypeScript project build |
| `pnpm test` | Pass | 8 files, 43 tests |
| `pnpm test:sim` | Pass | 7 files, 28 tests |
| `pnpm build` | Pass | 128 modules; 365.51 kB JS / 106.35 kB gzip; production artifact contains zero SVG files and no canonical full-master portrait payload |
| `pnpm build:storybook` | Pass after serial rerun | 240 modules; five canonical masters remain development-only; four framework-owned manager SVG favicons, no project-authored story fallback |
| `pnpm wiki:check` | Pass | VitePress build and render complete |
| `CI=1 pnpm test:e2e` | Pass | 1/1 Chromium 1280×720 smoke, axe-clean |
| `CI=1 pnpm exec playwright test --config tests/ui/foundation/playwright.config.ts` | **Fail** | 10/11; lord-strip screenshot differs by 9,959 pixels (~2%); all keyboard/axe/reflow/motion/missing-raster checks pass |
| New mutable-registry same-input adversarial probe | **Fail as intended** | Writable resolver replacement changed `trusted` to `mutated` for identical seed/state; registry/maps not frozen |
| New contradictory-save-metadata adversarial probe | **Fail as intended** | Canonical compatibility plus forged mirrored hash/schema imported successfully |
| New raster-manifest mutation/vector probe | **Fail as intended** | Nested source mutated to SVG data URI; resolver returned `available: true`, no warning |
| Raster/vector/package scan and built-artifact inventory | Pass for current shipped game; contract probe fails | No project SVG/icon-font/runtime vector in current game; Storybook SVGs are framework-owned; nested manifest can nevertheless be mutated into vector input |
| Approved master integrity inventory | Pass | Five canonical PNGs present; SHA-256 hashes recorded during review and unchanged |
| Local/remote `v0.1.0-alpha.1` tag check | Not published | No matching local or `origin` tag |

## Design, schema, save, asset and release impact

- Canonical design changed: **No**. No design amendment is required; findings enforce the existing
  determinism, parallelism, character-composition and raster-only contracts.
- Balance values changed: None.
- Save/schema impact: Schema remains `1`, but its foundation validator is not safe to freeze until
  metadata authority and future domain-validation composition are explicit.
- Shared-contract impact: `ids`, state extension ownership, effects/queries, registry finalization and
  simulation-safe import direction require correction before Wave 2 starts.
- Asset impact: Preserve the five approved full masters and temporary bust/tight status. Correct the
  semantic content-slot specifications and runtime immutability; do not promote mechanical crops.
- Release impact: **Checkpoint release blocked.** The version parity, Storybook evidence, structured
  notes and post-publication artifact verification contract must be executable before tagging.
- Wiki impact: Correct the generic/frozen-extension claim, dependency direction, status/WAVE-01 link
  and any release description affected by the fixes.

## Unresolved questions requiring integrator disposition

- What exact shared representation makes “Pledged Under Duress” a Pledged vote with leverage/visibility
  facts without double-counting it as an independent support level? This carried from the WP-011 critic
  and is still not frozen.
- Which nonoverlapping top-level namespaces belong to WP-020, WP-021, WP-022 and WP-023, and which
  cross-domain effects/queries are the only legal communication between them?
- Is `metadata.values` compatibility authority or diagnostic duplication? Either answer is acceptable
  if there is one validated truth and the wiki/tests agree.
- Is Storybook delivered as a release attachment or an immutable CI/deployment link? WP-019 must choose
  and record one verifiable answer before dispatch.

## Risks and deferred work

- Dedicated front/near-front bust and tight portraits correctly remain WP-034 work. The current
  temporary master crops must stay visibly temporary.
- Cross-browser visual support remains a later hardening decision; that does not excuse the current
  Chromium baseline failure.
- Publication, `logs/compacted/WAVE-01.md`, `logs/STATUS.md`, `work-packets/INDEX.md`, release log and
  exact final SHA remain expected post-fix/post-critic work. They were not executed during this review.

## Final verdict

**Blocked.** WP-010, WP-011 and WP-012 are meaningfully integrated and almost all standard gates are
green, but the candidate does not yet provide a deterministic, immutable, parallel-safe Wave 2
contract. Five P1 findings block release and Gate 2: incomplete shared state/effect/ID freeze, mutable
kernel registrations, mutable/vector-bypass raster manifest, contradictory premature gate docs, and an
incomplete checkpoint release workflow. The save metadata, visual baseline and dependency-guard P2s
also require disposition and regression evidence.

After the integrator resolves every finding, rerun the exact adversarial probes, four real Wave 2
skeleton compile tests, the complete standard gate, foundation Playwright, a release dry run and a
fresh independent re-review. WP-019 is **not integration-ready**, `v0.1.0-alpha.1` must not be tagged,
and Gate 2 must remain closed.

