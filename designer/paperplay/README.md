# Hostile Paperplay

This directory records adversarial design testing performed after the first complete rules pass.

The purpose is not to narrate ideal play. It is to behave like a player who wants to:

- find one dominant opening;
- convert one resource into every other advantage;
- delay commitment until the AI cannot react;
- spam low-risk actions;
- exploit pause, reloads and ambiguous timing;
- win with promises that never cost anything before the ending;
- snowball through conquest;
- force undefined succession states;
- make the UI lie or conceal decisive rules;
- produce softlocks through dispossession, debt or resource exhaustion.

## Passes

1. [`pass-01-exploit-matrix.md`](./pass-01-exploit-matrix.md) — targeted attacks on individual systems and conversion loops.
2. [`pass-02-complete-runs.md`](./pass-02-complete-runs.md) — end-to-end paper runs for coalition, legitimacy, intrigue, military and deliberately abusive strategies.
3. [`pass-03-edge-cases.md`](./pass-03-edge-cases.md) — timing collisions, invalid states, save/load, information and UX failure cases.
4. [`final-amendments.md`](./final-amendments.md) — all changes made to the canonical design after the passes.

## Severity

- **RED:** can collapse the central game, create a dominant strategy, make a route impossible or leave succession undefined.
- **YELLOW:** produces unfairness, repeated confusion, weak replayability or an avoidable exploit.
- **GREEN:** hostile behavior produces a valid strategy with meaningful counter-pressure; no fix required.

## Test standard

A route passes only if:

1. it can plausibly win under the exact economy and clock;
2. it pays costs before the King dies;
3. rivals have time and reason to respond;
4. the ending can explain the result without hidden aggregate scoring;
5. repeating the route is not guaranteed across all opening packages and seeds.

## Outcome

The hostile passes found no need for a new major system. They did find several numeric and state-transition holes. The canonical design files were revised to address them, and `final-amendments.md` is the audit trail.