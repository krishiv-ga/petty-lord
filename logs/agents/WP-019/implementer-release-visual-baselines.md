# Agent Log — WP-019 — implementer/release-visual-baselines

- **Packet:** `WP-019 Foundation Integration and First Checkpoint Release`
- **Role:** Implementer
- **Branch/worktree:** `codex/wp019-release-visual-baselines` / `petty-lord-assets-main`
- **Starting revision:** `f294ad9aa81f5e3822bd87b61dfdc6cd0ddce532`
- **Ending revision:** `pending`
- **PR:** `pending`
- **Status:** In progress

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
- Linux baseline capture, exact-run verification, critic review, and final evidence are pending.

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

## Critic findings and resolution

None yet — critic pending.

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Save/schema impact: none
- Wiki pages updated: none required; release operations evidence will be finalized after publication.

## Risks and deferred work

- Linux captures must be generated and reviewed on the same Playwright image used by GitHub Actions before release publication.
- No released build or save was affected; the defect blocked only the unpublished checkpoint workflow.

## Integration notes

- Shared contracts touched: release workflow and visual-test evidence layout only.
- Merge order constraints: merge before publishing `v0.1.0-alpha.1`.
- Follow-up packets: none.
- Integration-ready: No
