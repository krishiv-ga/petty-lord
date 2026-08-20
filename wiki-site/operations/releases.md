# Releases

Checkpoint releases are deliberate integration events, not automatic on every merge. The manual
GitHub Actions release workflow requires an explicit version, prerelease choice and full green gate.
It creates archives and checksums before an annotated tag and GitHub Release.

See the [release policy](https://github.com/krishiv-ga/petty-lord/blob/main/RELEASES.md). WP-000
installed the workflow. WP-019 owns the first foundation checkpoint, `v0.1.0-alpha.1`, built from the
exact integrated `main` revision with the Wave 01 compacted log, structured notes, known issues, test
summary, game/Storybook/wiki archives and SHA-256 checksums. The workflow smoke-tests the extracted
game and verifies the published tag, prerelease flag, downloaded artifacts and checksums. This release
was published and independently verified at commit
`6be70ed7b2ac79c51adc834e9ef27a92d58981eb`:
[`v0.1.0-alpha.1`](https://github.com/krishiv-ga/petty-lord/releases/tag/v0.1.0-alpha.1). The tag is an
immutable foundation prerelease, not a claim that the game loop is playable.
