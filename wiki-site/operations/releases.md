# Releases

Checkpoint releases are deliberate integration events, not automatic on every merge. The manual
GitHub Actions release workflow requires an explicit version, prerelease choice and full green gate.
It creates archives and checksums before an annotated tag and GitHub Release.

See the [release policy](https://github.com/krishiv-ga/petty-lord/blob/main/RELEASES.md). WP-000 installs
the workflow but does not publish a release.
