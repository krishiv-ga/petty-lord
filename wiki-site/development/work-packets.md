# Work packets

Implementation begins from the
[packet index](https://github.com/krishiv-ga/petty-lord/blob/main/work-packets/INDEX.md). Each packet owns
specific paths, dependencies, acceptance checks and logs. Work directly on `main`: synchronize with
`origin/main` before starting, before committing and before pushing, and do not create packet, feature,
integration or PR branches. Do not implement later packets opportunistically.

`Parallel-safe` means only that packets with disjoint ownership may proceed concurrently. Every agent
still works on `main`, and shared paths remain serialized under the owning integration packet. If remote
`main` advances while local commits exist, rebase those commits onto latest `origin/main`, rerun affected
checks and push `main`; do not create a temporary conflict branch.

Significant work requires an independent critic reviewing the relevant `main` commit/diff, logs and
evidence. A PR is not required. Only integration packets update shared status, compacted logs and
fan-out gates; they reconcile the combined state already on `main` rather than merging feature branches.

WP-019 integrates Wave 1 and, only after independent clearance plus a verified foundation release,
opens the second fan-out gate for WP-020 (time/economy/orders), WP-021
(politics/Church/succession), WP-022 (war/occupation/Capital) and WP-023 (AI/knowledge/events). The
authoritative status log still controls whether those packets are actually open.
