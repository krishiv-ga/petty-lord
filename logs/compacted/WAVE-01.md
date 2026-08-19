# Compacted Log — Wave 01 Foundation Integration

- **Integration candidate:** `wp/WP-019-foundation-integration` (exact revision recorded at merge)
- **Source packet revisions:** WP-010 `944e824`, WP-011 `88e0f34`, WP-012 `719c5f4`
- **Release/tag:** `v0.1.0-alpha.1` pending critic clearance and verified publication
- **Critic verdict:** First review blocked; all findings remediated; independent re-review pending
- **Fan-out gate:** **Closed** until this log, status and packet index are updated atomically

## Repository capability assembled

The three Wave 1 foundations now run together: a pure deterministic kernel, a validated immutable
canonical content registry, and a bespoke raster-only UI laboratory. WP-019 supplies the narrow
contracts needed for the four Wave 2 packets without implementing their systems.

## Frozen Wave 2 contracts

- `src/contracts/ids.ts`: all stable entity and rule ID families; no content/runtime dependency.
- `src/contracts/domains.ts`: owned `time`, `politics`, `war` and `knowledge` namespaces plus
  namespaced effects, queries, results, resolvers and explicit Pledged-under-duress representation.
- `src/contracts/state.ts`: deterministic foundation envelope, package-derived build version,
  content/save compatibility and validated metadata mirrors.
- `src/contracts/simulation.ts`: command, scheduler and closure-backed immutable registry seam.
- `src/contracts/content.ts`: validated, recursively immutable canonical `GameContent`.
- `src/contracts/projection.ts`: read-only display projection boundary.
- `src/contracts/assets.ts`: deep-frozen, raster-validated semantic character manifest.

Wave 2 simulation code must import narrow submodules. These seams and shared root workflows remain
owned by the next serialized integrator, WP-029.

## Verification candidate

| Gate | Result |
|---|---|
| Frozen install / lockfile | Pass; no lockfile change |
| `pnpm check` | Pass |
| `pnpm typecheck` | Pass |
| `pnpm test` | Pass; 46/46 |
| `pnpm test:sim` | Pass; 28/28 |
| `pnpm build` | Pass; shipped game contains no SVG or canonical master payload |
| `pnpm build:storybook` | Pass |
| `pnpm wiki:check` | Pass |
| Foundation Playwright | Pass; 11/11 including maintained screenshots, keyboard, axe and reflow |
| `pnpm test:e2e` | Pass; 1/1 Chromium and axe |
| Extracted artifact smoke | Pass; 1/1 Chromium, checkpoint identity and no SVG element |

Canonical snapshot: 6 lords, 7 territories, 19 actions, 12 bargains, 8 secrets, 4 openings,
16 events and 96 raster slots; zero unresolved/missing references; content hash
`fnv1a64-71139efd89443029`.

## Independent critic disposition

The first combined review identified five P1 and three P2 findings. The candidate now has regression
evidence for immutable registries, immutable/vector-safe raster descriptors, complete domain/ID
contracts, consistent closed-gate docs, self-verifying release mechanics, save-mirror rejection,
restored UI evidence and transitive dependency guards. The same independent critic must clear these
remediations before publication.

## Known risks and deferred work

- This foundation checkpoint is not a playable game loop. Economy, politics, war, AI, events and
  succession belong to Wave 2.
- Dedicated bust/tight compositions, final map art and the remaining raster pack remain WP-034 work;
  current close portraits are visibly inventoried temporary raster stand-ins.
- Foundation browser/visual evidence is Chromium-only; broader support remains later hardening work.

## Pending gate handoff

After critic clearance, merge the exact candidate to `main`, dispatch and verify the manual
`v0.1.0-alpha.1` checkpoint, then update this header plus `logs/STATUS.md`, `work-packets/INDEX.md`,
README and wiki atomically to mark only WP-020, WP-021, WP-022 and WP-023 Ready.
