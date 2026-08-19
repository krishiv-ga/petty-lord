# Agent Log — WP-019 — implementer/release-visual-baselines

- **Packet:** `WP-019 Foundation Integration and First Checkpoint Release`
- **Role:** Implementer
- **Branch/worktree:** `codex/wp019-release-visual-baselines` / `petty-lord-assets-main`
- **Starting revision:** `f294ad9aa81f5e3822bd87b61dfdc6cd0ddce532`
- **Ending revision:** `a31ef88c6f1c100c39315f8acb4434c40550bdf0` plus final evidence logs
- **PR:** `https://github.com/krishiv-ga/petty-lord/pull/5`
- **Status:** Ready for integration — independent critic clear

## Scope

Owned paths:

- `tests/ui/foundation/playwright.config.ts`
- `tests/ui/foundation/baselines/`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `logs/agents/WP-019/implementer-release-visual-baselines.md`

Explicitly out of scope:

- Gameplay, simulation, canonical design, balance, save schema, and authored UI changes.

## Work performed

- Reproduced release dry-run failure at integrated SHA `f294ad9`: five visual assertions compared Linux Chromium captures with Windows-authored baselines.
- Segregated visual baselines by Playwright platform while preserving the accepted Windows evidence.
- Added failure-only artifact preservation for release browser traces, reports, and captures.
- Captured the nine Linux baselines from GitHub run `32268752985`, visually reviewed the representative lord, crisis, mandatory-dialog and focused-map states, and committed the complete platform set.
- Replaced the repeatedly stalled `--with-deps` helper with the pinned Chromium-only install after the same Ubuntu runner/dependency set had already passed CI. The cache remains keyed to the lockfile.
- Verified the complete release dry run at exact candidate `a638870` in GitHub run `32269131464`.
- Applied the same proven Chromium install path to normal CI and verified exact-final-workflow SHA `a31ef88` in PR run `32269673849`.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| Visual baselines are platform-specific. | Font rasterization differs by OS; the failing captures were stable within Linux but differed from Windows by 1–3% of pixels. | Release CI validates Linux against reviewed Linux captures without weakening thresholds. |
| Preserve failed browser evidence. | The initial dry run discarded the captures needed for diagnosis and review. | Future release failures retain traces/screenshots for 14 days. |

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| Release workflow dry run `32234857248` | Fail (reproduction) | Quality gate passed; Linux visual comparison failed 5/11 because the baseline path was platform-neutral. |
| `pnpm build:storybook` | Pass | Windows Storybook production build completed. |
| `pnpm exec playwright test --config tests/ui/foundation/playwright.config.ts` | Pass | Windows platform suite 11/11 after baseline relocation. |
| Release workflow evidence run `32268752985` | Expected fail | Quality gate and Chromium install passed; missing Linux baselines were generated and retained as a 31.7 MB Actions artifact. |
| Manual review of Linux captures | Pass | Nine captures present; representative lord, crisis, mandatory-dialog and focused-map images preserve authored layout, text, focus and raster identity. |
| Release workflow dry run `32269131464` | Pass | Exact `a638870`; quality gate, Linux foundation/browser smoke, packaging/checksums, extracted-game smoke and artifact upload passed in 1m29s. |
| PR CI `32269673849` | Pass | Exact `a31ef88`; quality/build/Storybook/wiki and runnable Chromium smoke jobs both green. |

## Critic findings and resolution

| Severity | Finding | Resolution/status |
|---|---|---|
| P3 | Implementer evidence stopped at `a638870`, omitted `.github/workflows/ci.yml`, and still said critic pending. | Fixed in this final log update with exact `a31ef88`, PR #5, CI run `32269673849`, owned path, and critic-clear handoff. |

Independent focused critic verdict: **Clear for integration** with no P0/P1/P2 findings.

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Save/schema impact: none
- Wiki pages updated: none required; release operations evidence will be finalized after publication.

## Risks and deferred work

- The real release must be dispatched from merged `main`, then its tag, release metadata, downloads and checksums must be verified before Wave 2 opens.
- No released build or save was affected; the defect blocked only the unpublished checkpoint workflow.

## Integration notes

- Shared contracts touched: release workflow and visual-test evidence layout only.
- Merge order constraints: merge before publishing `v0.1.0-alpha.1`.
- Follow-up packets: none.
- Integration-ready: Yes
