---
name: design-guard
description: Govern a proposed change to The Petty Lord's locked canonical design when implementation, tests, hostile paperplay, usability, or balance evidence proves the rule itself is defective. Prevent casual design drift.
---

# Guard and Amend Locked Design

## Trigger threshold

Use only when evidence shows one of these:

- the canonical rule is internally contradictory or leaves a critical state undefined;
- faithful implementation is impossible without violating another locked rule;
- an invariant/scenario proves the rule cannot function;
- repeated hostile paperplay proves a dominant/nonviable route caused by the rule rather than values;
- usability testing proves the rule cannot be communicated or reasonably understood;
- balance evidence shows the structure, not a tunable number, is broken.

Do not use because a different implementation is easier or because one playtester dislikes a result.

## Evidence packet

Record:

- exact canonical passages in conflict;
- implementation/test/paperplay seeds and traces;
- why a technical fix or value tune is insufficient;
- affected systems, saves, UI, content, tests and work packets;
- smallest viable alternatives and their new exploit surface.

## Hostile amendment pass

Paperplay the proposed amendment against:

- coalition, legitimacy/intrigue and military routes;
- late declaration and Deathbed;
- support/collateral/coercion;
- AI information and counterplay;
- constitution/tie-breaks;
- save/determinism and UI explanation.

Prefer the smallest rule clarification/change that closes the hole without adding a major system.

## Authority update order

When accepted:

1. Update the relevant canonical parent file under `/designer`.
2. Update `designer/paperplay/final-amendments.md` with evidence and rationale.
3. Update `designer/balance-sheet.md` when values change.
4. Update content/schema/tests/implementation.
5. Update wiki and player-facing copy.
6. Record save/migration/release impact.

Never update code/wiki alone and leave canonical design stale.

## Output

The design-guard log states:

- original rule;
- proven hole;
- considered alternatives;
- final amendment;
- affected packets/contracts;
- new tests/paperplay;
- migration/backward-compatibility impact;
- critic approval.

Significant amendments require an independent critic and integration ownership. If evidence is insufficient, reject the amendment and route the issue to `$bugfix`, `$tune`, UI or copy work instead.
