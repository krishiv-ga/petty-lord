# Hostile Paperplay

This directory records adversarial design testing performed only after the first complete rules package existed.

The tests intentionally attempted to:

- find dominant openings and conversion loops;
- hoard resources for an unanswerable late burst;
- spam promises, gifts, taxes, threats or wars;
- exploit pause, refresh and same-time scheduling;
- make conquest snowball;
- win with obligations that cost nothing before the ending;
- force undefined ballot, dispossession or Capital states;
- make AI use hidden information;
- exploit event timing, debt and private blackmail;
- produce UI forecasts that know more than the player.

## Passes

1. [`pass-01-exploit-matrix.md`](./pass-01-exploit-matrix.md) — targeted resource, support, Claim, coercion and conquest exploits.
2. [`pass-02-complete-runs.md`](./pass-02-complete-runs.md) — full coalition, legitimacy, intrigue/Capital, military, late-hoarder and dispossessed runs.
3. [`pass-03-edge-cases.md`](./pass-03-edge-cases.md) — timing collisions, invalid Orders, saves, Capital, information and ballot edge cases.
4. [`pass-04-final-consistency.md`](./pass-04-final-consistency.md) — final implementation attack covering player votes, observer knowledge, private blackmail, debt, shock expiry and exact AI evaluation.
5. [`final-amendments.md`](./final-amendments.md) — audit trail of every design change incorporated into the canonical files.

## Severity

- **RED:** collapses the central game, creates a dominant strategy, makes a route impossible or leaves succession undefined.
- **YELLOW:** creates unfairness, recurring confusion, weak replayability or an avoidable exploit.
- **GREEN:** hostile behavior produces a valid strategy with meaningful counter-pressure.

## Pass standard

A route passes only when:

1. it can plausibly win under exact economy and clock;
2. it pays material cost before the King dies;
3. rivals have time and reason to respond;
4. the ending explains the result without hidden aggregate scoring;
5. repeating the route is not guaranteed across packages and seeds.

## Outcome

No new major system was required. The passes changed resource arithmetic, support maturation, Church bargains, guaranteed intrigue access, fraud repair, Yield behavior, scheduler ordering, collateral timing, defection, private knowledge, shock lifetime, debt consequences and exact per-lord evaluation.

The remaining risks are tuning risks—win rates, demand frequency, casualty balance and event pacing—not missing-rule risks.