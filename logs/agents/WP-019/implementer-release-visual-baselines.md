# Agent Log — WP-019 — implementer/release-visual-baselines

- **Packet:** `WP-019 Foundation Integration and First Checkpoint Release`
- **Role:** Implementer
- **Branch/worktree:** `codex/wp019-release-visual-baselines` / `petty-lord-assets-main`
- **Starting revision:** `f294ad9aa81f5e3822bd87b61dfdc6cd0ddce532`
- **Ending revision:** `a63887091ff81eebde6bada1b46ee7d4c410b1c3` plus this evidence update
- **PR:** `pending`
- **Status:** Ready for critic

## Scope

Owned paths:

- `tests/ui/foundation/playwright.config.ts`
- `tests/ui/foundation/baselines/`
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

## Critic findings and resolution

None yet — independent critic pending on the focused `f294ad9..a638870` release fix.

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
- Integration-ready: Pending independent critic
