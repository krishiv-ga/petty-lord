# Repository Status

- **Current phase:** WP-000 integrated; Wave 1 foundations ready to fan out.
- **Reviewed integration revision:** `aa11d6b2379f1d3563e4aeb787dc1a73c090e2a9`.
- **Latest compacted log:** [`logs/compacted/WAVE-00.md`](./compacted/WAVE-00.md)
- **Fan-out gate:** **Open**.
- **Ready now:** [`WP-010`](../work-packets/WP-010-deterministic-simulation-kernel.md),
  [`WP-011`](../work-packets/WP-011-content-schema-and-canonical-data.md) and
  [`WP-012`](../work-packets/WP-012-visual-language-and-ui-foundation.md).
- **Do not start yet:** WP-019 waits for WP-010–012; WP-020+ remain blocked.
- **Next checkpoint:** foundation integration and `v0.1.0-alpha.1` through WP-019.

WP-010, WP-011 and WP-012 may run concurrently only in separate branches/worktrees with disjoint
owned paths. Shared root tooling, lockfile, workflows, navigation and compacted status are frozen for
the wave and belong to WP-019 integration.

This file is updated only by an integration packet. Individual packet agents write under
`logs/agents/<packet-id>/` and do not edit this shared status.
