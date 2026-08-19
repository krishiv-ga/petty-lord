---
name: hunt
description: Hostile-test The Petty Lord for gameplay and design failures such as dominant strategies, dead choices, pressure collapse, misleading counterplay, route nonviability, or soft losses. Do not use for ordinary technical bugs.
---

# Hunt Gameplay Failures

## Scope

Use this skill to attack the game as a player/system designer. A crash, persistence defect, rendering failure or incorrect code path belongs to `$bugfix` unless it exposes a deeper gameplay problem.

Start read-only. Do not tune values while hunting.

## Establish the target

- Record build SHA/version, seed/opening, player policy/route and any debug acceleration.
- Read the relevant canonical design and paperplay invariants.
- State the intended pressure/counterplay you are attempting to falsify.
- Prefer command replays and headless policies that can be rerun, then verify representative findings in the browser.

## Adversarial approaches

Try to:

- win through promise spam, repeated gifts, taxes, court, threats or another conversion loop;
- delay candidacy until a safe burst;
- stay second to avoid retaliation;
- acquire support without proof/collateral/shared risk;
- make one lord/route/action mandatory;
- conquer a resource snowball or delete political opposition;
- reuse troops/garrisons/mercenaries;
- exploit knowledge, stale intelligence or forecast certainty;
- force support pinball or permanent coercion;
- make Deathbed idle, deterministic or unfair;
- create an unwinnable/free-win opening;
- discover a fixed opener that works across seeds;
- remain technically alive but strategically unable to make a meaningful choice;
- win without creating obligations, hostility, casualties or another vulnerability.

## Evidence

A valid finding includes:

- exact reproduction or policy script;
- seed/save/replay;
- expected counterplay and why it failed;
- frequency across controlled repeats;
- user impact and severity;
- suspected root system/value;
- smallest likely intervention;
- whether it is a gameplay defect, technical bug, UI/comprehension problem or intended trade-off.

Do not report a single unlucky loss as balance evidence. Do not use aggregate win rates without describing policies and opening distribution.

## Output

Write a hunter log with findings ranked:

- release-blocking exploit/nonviability;
- dominant/degenerate strategy;
- pressure or counterplay failure;
- low variety/dead option;
- misleading feedback/comprehension;
- balance polish.

For technical findings, create a precise handoff to `$bugfix`. For UI/copy findings, hand off to the owning packet. Invoke `$design-guard` only when the locked rule itself—not implementation or value—is proven defective.

Tuning begins later through `$tune`, after reproduction and triage.
