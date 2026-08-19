# Agent Log — WP-019 — Critic/Release Visual Baselines

- **Packet:** WP-019 Foundation Integration, Contract Freeze and Alpha Checkpoint
- **Role:** Critic
- **Branch/worktree:** `codex/wp019-release-visual-baselines` / `petty-lord-assets-main`
- **Starting revision:** `f294ad9aa81f5e3822bd87b61dfdc6cd0ddce532`
- **Reviewed candidate:** `a31ef88c6f1c100c39315f8acb4434c40550bdf0`
- **Ending revision:** `a31ef88c6f1c100c39315f8acb4434c40550bdf0` plus this critic log only
- **PR:** pending
- **Status:** Complete — clear for integration with one non-blocking evidence-log correction

## Scope

Owned path:

- `logs/agents/WP-019/critic-release-visual-baselines.md`

Reviewed without modifying:

- exact diff `f294ad9aa81f5e3822bd87b61dfdc6cd0ddce532..a31ef88c6f1c100c39315f8acb4434c40550bdf0`;
- Windows-to-`win32` baseline relocation and all nine new Linux Chromium baselines;
- Playwright snapshot routing, failure-evidence upload, browser cache/install behavior and the matching CI change;
- failed release reproduction `32234857248`, Linux evidence run `32268752985`, successful dry run `32269131464`, and exact-final-SHA PR CI `32269673849`;
- the downloaded dry-run checkpoint bundle, internal checksums, archives and exact-SHA test summary.

Explicitly out of scope:

- Publishing the real tag/GitHub Release, opening Gate 2, or editing workflow/tests/baselines/other logs.
- Re-reviewing unchanged gameplay, simulation, save, content or UI production code already cleared by the combined WP-019 critic.

## Work performed

- Confirmed the original integrated release failed only at the visual seam: run `32234857248` passed
  the quality gate and browser installation, then five screenshots differed from Windows-authored
  expectations by 1–3% of pixels on Linux.
- Inspected every Linux and Windows PNG, recorded dimensions and hashes, reviewed complete contact
  sheets, and inspected the Linux lord strip, mandatory dialog, focused map and tall decision record
  at readable size. Geometry, text, focus, raster identity, dialog state and authored chancery
  hierarchy are intact; no baseline hides clipping, fallback fonts, blank content or vector leakage.
- Compared corresponding OS captures structurally. All nine pairs have identical dimensions; SSIM
  ranges from `0.908343` to `0.967721`, consistent with visible font/rasterization differences rather
  than layout replacement. The two map pairs are `0.967721`; representative text-heavy compositions
  remain visually equivalent.
- Verified the snapshot template fails closed by selecting `{platform}` before the snapshot name:
  Linux never compares against Windows evidence, while an unsupported platform without reviewed
  baselines cannot silently inherit another OS's images.
- Downloaded Actions artifact `9371475575` from dry run `32269131464`, independently matched all
  seven entries in `checksums.sha256`, inspected the game archive inventory and confirmed the bundled
  test summary names exact build SHA `a63887091ff81eebde6bada1b46ee7d4c410b1c3`.
- Attacked the cache/install change. Both workflows key `~/.cache/ms-playwright` by runner OS plus the
  pinned lockfile, still execute `playwright install chromium` after restore so a cache miss downloads
  the locked browser, and then prove actual launch. Dry run `32269131464` passed 11 Linux foundation
  tests, app smoke and extracted-artifact smoke; final-SHA PR CI `32269673849` independently passed
  its quality and Chromium jobs after the same install change.
- Confirmed the release failure uploader retains `test-results/`, the HTML report and Linux baseline
  path for missing-baseline generation. It does not weaken screenshot thresholds or auto-update
  snapshots in a green release.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| OS-specific image evidence is correct here | Linux and Windows have identical geometry but stable text raster differences; cross-OS comparison produced the original false failure | The maintained suite remains strict within each reviewed platform instead of increasing tolerance globally |
| Dry-run evidence at `a638870` applies to the release fix in final candidate `a31ef88` | Commits after `a638870` change only its implementer evidence log and the equivalent CI browser-install command; release workflow, baselines and Playwright config are byte-identical | The real publish must still rerun from merged `main`, but another branch dry run is not required for this log-only/CI-only tail |
| Chromium-only install is acceptable on the current GitHub runner contract | Both an isolated release job and the final-SHA PR job launch Chromium successfully after the command; cache misses remain covered by the install command | A future runner-image dependency removal will fail observably at browser launch rather than publish an unchecked release |
| Real tag/release absence is expected | This review occurs before merge and release dispatch, and `dry_run=true` skipped every publication step | Gate 2 remains closed until post-merge release verification |

## Ranked critic findings

| Severity | Location | Finding and exact evidence | Expected behavior / impact | Recommended resolution |
|---|---|---|---|---|
| **P3** | `logs/agents/WP-019/implementer-release-visual-baselines.md:7,13-18,73` | The implementer log stops at `a638870`, does not list the final `.github/workflows/ci.yml` path/change, and still says integration readiness is pending. The independently reviewed head is `a31ef88`, whose exact PR CI is green in run `32269673849`. | Packet evidence should name its final reviewed production/workflow SHA and every owned file. Runtime, visual and release behavior are unaffected; this critic log supplies the missing exact evidence, so the issue is non-blocking. | Refresh the implementer log before final packet closure to name `a31ef88`, include `.github/workflows/ci.yml`, record run `32269673849`, and hand off as critic-cleared. |

No P0, P1 or P2 finding was identified. The focused release defect is fixed and the platform split
does not weaken visual acceptance.

## Acceptance tests independently verified

| Focused acceptance item | Result | Evidence |
|---|---|---|
| Windows baselines remain accepted and unchanged | **Pass** | Nine files moved at 100% similarity into `baselines/win32`; local Windows suite passes 11/11 |
| Linux baselines are complete and visually reviewed | **Pass** | Nine files with expected dimensions; representative and full-sheet inspection found no semantic/layout regression |
| Platform routing is strict | **Pass** | `snapshotPathTemplate: '{snapshotDir}/{platform}/{arg}{ext}'`; no tolerance or update-snapshot weakening |
| Release failures retain diagnosis evidence | **Pass** | Failure-only artifact includes `test-results/`, HTML report and Linux baseline path; evidence run `32268752985` retained missing captures |
| Browser cache/install reaches runnable Chromium | **Pass** | OS+lockfile cache key; release dry run and final-SHA PR CI both launch and pass Chromium after `playwright install chromium` |
| Exact GitHub release dry run succeeds | **Pass** | Run `32269131464`, `dry_run=true`, exact `a638870`, 11/11 foundation, 1/1 app smoke, 1/1 extracted game smoke, artifact upload |
| Dry-run release bundle verifies | **Pass** | Artifact `9371475575`, 22,051,975 bytes; all seven listed checksums match; three archives plus five evidence files uploaded |
| Final workflow candidate CI succeeds | **Pass** | Run `32269673849`, exact `a31ef88`, quality/build/wiki and Chromium jobs both green |
| Diff remains focused and clean | **Pass** | 22 changed paths: two workflows, Playwright config, platform baselines and implementer log; `git diff --check f294ad9..a31ef88` passes |

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| `git diff --check f294ad9..a31ef88` | Pass | No whitespace errors |
| `pnpm install --frozen-lockfile` | Pass | Already current; no lockfile or worktree change |
| `pnpm exec vitest run tests/unit/workflows.test.ts` | Pass | 1 file / 3 workflow tests |
| `pnpm build:storybook` | Pass | 241 modules; reviewed fixture build produced successfully |
| `CI=1 pnpm exec playwright test --config tests/ui/foundation/playwright.config.ts` | Pass | Windows 11/11 against relocated `win32` baselines |
| Linux release foundation suite | Pass | Run `32269131464`, Linux 11/11 against committed Linux baselines |
| Final-SHA PR CI | Pass | Run `32269673849`, exact `a31ef88`; both jobs green |
| Artifact download/checksum/archive audit | Pass | Actions artifact `9371475575`; seven checksum matches; game archive and evidence metadata inspected |
| Cross-platform visual comparison | Pass | Nine dimension-matched pairs, SSIM `0.908343`–`0.967721`, semantic visual inspection clean |

## Design, schema, save and release impact

- Canonical design changed: **No**.
- Balance values changed: None.
- Save/schema impact: None.
- Production UI/build impact: None; only test evidence routing and workflow execution changed.
- Release impact: The unpublished foundation checkpoint is unblocked for a real dispatch from merged
  `main`. That dispatch must create and verify the immutable tag/release at its own exact SHA.
- Wiki impact: None required for this repair; maintained release behavior and commands are unchanged.

## Risks and deferred work

- Only `win32` and `linux` have reviewed visual baselines. A macOS execution correctly fails for a
  missing `darwin` baseline until one is deliberately generated and reviewed.
- `ubuntu-latest` system-library availability remains an external runner-image dependency. Current
  release and PR jobs prove the browser is runnable; a later image change should be handled as a
  tooling failure, not by weakening or auto-accepting screenshots.
- The real non-dry-run workflow, tag, release assets/downloads/checksums and status/index transition
  remain mandatory after merge. None was authorized or performed by this critic.

## Final verdict

**Clear for integration.** Candidate `a31ef88c6f1c100c39315f8acb4434c40550bdf0` fixes the
cross-platform release blocker without changing UI semantics or weakening visual comparison. Linux
and Windows evidence is complete, independently reviewed and green on their target platforms; the
release cache/install path and downloaded dry-run artifact are verified; exact-final-SHA PR CI is
green. The sole P3 is evidence-log freshness and does not block merging this focused fix. Gate 2 must
remain closed until the real `v0.1.0-alpha.1` release is published and verified from integrated
`main`, then the packet status/index/onboarding handoff is updated atomically.
