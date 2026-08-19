# Repository Agent Skills

Project-local Codex skills live under [`.codex/skills/`](./.codex/skills/). Invoke one explicitly with `$name`, or allow Codex to select it when the task matches its description.

Skills are workflows, not permission to ignore the assigned work packet. `AGENTS.md`, the packet, and canonical design remain authoritative. All repository execution uses `main` only; skills do not authorize packet, feature, integration, or PR branches.

## Core execution skills

| Skill | Use it for | Primary output |
|---|---|---|
| [`$packet`](./.codex/skills/packet/SKILL.md) | Execute one indexed work packet end to end directly on `main`. | Focused implementation, tests, log, critic handoff, `main` commit. |
| [`$critic`](./.codex/skills/critic/SKILL.md) | Independently attack a significant diff or packet result. | Findings ranked by severity, adversarial evidence, critic log. |
| [`$integrate`](./.codex/skills/integrate/SKILL.md) | Reconcile two or more packet results already on `main` and open a fan-out gate. | Integrated `main` revision, full checks, compacted wave log, updated index. |
| [`$bugfix`](./.codex/skills/bugfix/SKILL.md) | Fix a concrete technical defect with a known or reproducible failure. | Minimal patch, regression test, bugfix log. |

## Game-design and balance skills

| Skill | Use it for | Primary output |
|---|---|---|
| [`$hunt`](./.codex/skills/hunt/SKILL.md) | Hunt gameplay exploits, dominant strategies, dead choices, softlocks, misleading feedback, or broken political pressure. Not for ordinary technical bugs. | Reproducible gameplay findings and severity-ranked recommendations. |
| [`$tune`](./.codex/skills/tune/SKILL.md) | Adjust costs, durations, thresholds, casualties, AI weights, event cadence, and other gameplay values using deterministic evidence. | Small value changes, before/after simulation evidence, updated balance docs. |
| [`$design-guard`](./.codex/skills/design-guard/SKILL.md) | Handle evidence that a locked design rule is impossible, incoherent, dominant, or unteachable. | Paperplay evidence, smallest canonical amendment, implementation impact. |

## Presentation and documentation skills

| Skill | Use it for | Primary output |
|---|---|---|
| [`$ui-audit`](./.codex/skills/ui-audit/SKILL.md) | Review a screen or UI diff for political identity, hierarchy, non-generic styling, raster-only icons, keyboard use, accessibility, and responsive bounds. | Screenshot-backed findings and fixes. |
| [`$wiki-sync`](./.codex/skills/wiki-sync/SKILL.md) | Update maintained wiki material after architecture, workflow, rule, schema, testing, or release changes. | Synchronized wiki pages and link validation. |
| [`$release`](./.codex/skills/release/SKILL.md) | Prepare a major checkpoint tag and GitHub Release after an integration packet. | Version/tag, generated notes, artifacts, compacted log, release verification. |

## Required combinations

- Significant implementation: `$packet` → independent `$critic` → `$integrate` when shared seams or multiple packet results are involved.
- Gameplay defect: `$hunt`; use `$tune` only after the cause is established.
- Locked-rule change: `$hunt` or test evidence → `$design-guard` → implementation packet.
- Major UI packet: `$packet` + `$ui-audit` + critic.
- Checkpoint: `$integrate` → `$wiki-sync` → `$release`.
- Direct technical regression: `$bugfix`; add a critic when it touches deterministic state, saves, scheduler, succession, build, or release tooling.

## Skill maintenance

Skills should remain concise. Put triggering conditions in YAML frontmatter and procedural instructions in the body. Do not add scripts unless repetition or fragility justifies them; prefer maintained third-party tooling over custom infrastructure. Any skill change requires a small forward test on a real packet and an agent log.
