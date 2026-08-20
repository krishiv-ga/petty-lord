# Agent Log — WP-019 — Release/Codex

- **Packet:** WP-019 Foundation Integration, Contract Freeze and Alpha Checkpoint
- **Role:** Release
- **Git target:** `main`
- **Starting revision:** `6be70ed7b2ac79c51adc834e9ef27a92d58981eb`
- **Released revision:** `6be70ed7b2ac79c51adc834e9ef27a92d58981eb`
- **Final evidence revision:** gate-status commit follows
- **Release:** https://github.com/krishiv-ga/petty-lord/releases/tag/v0.1.0-alpha.1
- **Status:** Complete

## Scope

Owned paths and external state:

- manual `.github/workflows/release.yml` dispatch for `v0.1.0-alpha.1`;
- annotated Git tag and GitHub prerelease;
- `logs/agents/WP-019/release-codex.md`;
- WP-019 compacted/status/index/wiki release handoff through the integrator.

Explicitly out of scope:

- npm publication, deployment, gameplay-system implementation, balance or save-schema changes.

## Work performed

- Confirmed authenticated GitHub CLI access, clean synchronized `main`, exact candidate `6be70ed`,
  absent tag, structured notes, known issues and compacted Wave 01 evidence.
- Dispatched the maintained non-dry-run workflow with version `v0.1.0-alpha.1`, prerelease `true` and
  compacted log `logs/compacted/WAVE-01.md`.
- Verified workflow run `32270680771` passed all quality, simulation, build, wiki, Linux foundation,
  app smoke, packaging/checksum, extracted-game smoke, tag, release and post-publication download steps.
- Fetched the annotated tag independently and confirmed `v0.1.0-alpha.1^{}` equals `6be70ed`.
- Independently downloaded all eight published assets, matched all seven entries in
  `checksums.sha256`, listed all three archives and reran the extracted-game Chromium smoke 1/1.

## Release artifacts

- `petty-lord-v0.1.0-alpha.1.tar.gz`
- `petty-lord-storybook-v0.1.0-alpha.1.tar.gz`
- `petty-lord-wiki-v0.1.0-alpha.1.tar.gz`
- `compacted-log.md`
- `known-issues.md`
- `release-notes.md`
- `test-summary.md`
- `checksums.sha256`

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| GitHub release workflow | Pass | https://github.com/krishiv-ga/petty-lord/actions/runs/32270680771; exact `6be70ed`, 1m53s |
| Release metadata | Pass | Published, non-draft prerelease named `The Petty Lord v0.1.0-alpha.1` |
| Annotated tag | Pass | `git rev-parse v0.1.0-alpha.1^{}` = `6be70ed7b2ac79c51adc834e9ef27a92d58981eb` |
| Independent asset download | Pass | Eight expected assets downloaded successfully |
| `sha256sum -c checksums.sha256` | Pass | Seven listed game/Storybook/wiki/evidence files matched |
| Archive readability | Pass | Game, Storybook and wiki tar inventories readable |
| Fresh extracted artifact smoke | Pass | Chromium 1/1; checkpoint identity present and no SVG element |

## Critic findings and resolution

| Severity | Finding | Resolution/status |
|---|---|---|
| P3 | Release-fix implementer log omitted the final CI delta and verdict. | Resolved before merge with exact SHA, CI run, owned path and critic-clear evidence. |

No P0, P1 or P2 release finding remains.

## Design, balance, or schema impact

- Canonical design changed: No
- Balance values changed: none
- Save/schema impact: schema `1`; release build `0.1.0-alpha.1`, content schema `1`, content hash `fnv1a64-71139efd89443029`
- Wiki pages updated: release page, work-packet page and landing/status references

## Risks and deferred work

- This is a foundation prerelease, not a playable game loop.
- Dedicated bust/tight portraits and the production raster pack remain WP-034 work.
- Browser visual evidence is maintained for Windows and Linux Chromium; broader platform coverage remains later hardening.

## Integration notes

- WP-020, WP-021, WP-022 and WP-023 may now run on disjoint `main` paths.
- WP-029 and every later wave remain blocked.
- Release complete: Yes
