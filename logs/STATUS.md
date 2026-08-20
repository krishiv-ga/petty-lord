# Repository Status

- **Current phase:** WP-019 foundation integration complete; Wave 2 systems ready to fan out.
- **Reviewed integration revision:** `6be70ed7b2ac79c51adc834e9ef27a92d58981eb`.
- **Latest compacted log:** [`logs/compacted/WAVE-01.md`](./compacted/WAVE-01.md)
- **Fan-out gate:** **WAVE 2 OPEN**.
- **Ready now:** [`WP-020`](../work-packets/WP-020-time-economy-orders-actions.md),
  [`WP-021`](../work-packets/WP-021-politics-claim-church-succession.md),
  [`WP-022`](../work-packets/WP-022-war-occupation-threat-capital.md) and
  [`WP-023`](../work-packets/WP-023-ai-knowledge-events.md).
- **Do not start yet:** WP-029 waits for WP-020–023; Wave 3+ remain blocked.
- **Checkpoint:** [`v0.1.0-alpha.1`](https://github.com/krishiv-ga/petty-lord/releases/tag/v0.1.0-alpha.1), verified at the reviewed revision above.

WP-020, WP-021, WP-022 and WP-023 may run concurrently on shared `main` only when their owned paths
remain disjoint. The frozen contracts under `src/contracts/**`, shared root tooling, lockfile,
workflows, navigation and compacted status belong to the next serialized integrator, WP-029.

This file is updated only by an integration packet. Individual packet agents write under
`logs/agents/<packet-id>/` and do not edit this shared status.
