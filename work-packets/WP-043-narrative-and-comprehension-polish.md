# WP-043 — Narrative, Onboarding and Comprehension Polish

- **Status:** Blocked by WP-039
- **Wave:** 4
- **Execution:** Parallel-safe within Wave 4
- **Depends on:** WP-039
- **May run with:** WP-040, WP-041, WP-042
- **Must not run with:** WP-049
- **Primary skill:** `$packet`
- **Required specialist skills:** `$critic`, `$wiki-sync`
- **Critic:** Required
- **Integrator:** WP-049
- **Release impact:** Final release candidate

## Objective

Polish the game’s authored language and teaching so players understand the crisis, characters, actions, consequences, uncertainty and final result without flattening politics into technical jargon or adding excessive prose.

This packet changes wording and information sequencing, not gameplay rules, balance values, UI architecture or art.

## Canonical inputs

- integrated beta and WAVE-03 comprehension issues;
- canonical `/designer` package;
- complete action, event, chronicle, onboarding, forecast and ending text-key inventory;
- actual target-viewport screenshots from WP-039;
- glossary/wiki structure.

## Owned paths

Expected ownership:

- dedicated text/copy modules under `src/content/text/**` or the copy-only paths established by WP-039;
- action/condition/phase/event/chronicle/ending/onboarding/glossary text values, excluding numeric weights/conditions;
- copy-specific tests/fixtures;
- `wiki-site/reference/glossary.md` and player-facing terminology notes;
- `wiki-site/development/onboarding-and-endings.md` copy guidance;
- `logs/agents/WP-043/**`.

Do not edit UI components/styles/layout, simulation, balance numbers, event weights/eligibility, save schema, production assets, package config or shared status. Report UI layout problems to WP-041 and technical defects to WP-042.

## Voice and language contract

The writing should feel like a severe, politically literate medieval crisis—not parody, faux-Shakespeare, generic fantasy lorem ipsum or a modern analytics product.

Use:

- direct, readable modern English;
- restrained period vocabulary where immediately understandable;
- specific political consequences;
- distinct but concise character voices;
- action labels that communicate intent;
- physician reports and proclamations that intensify phase pressure;
- reasons phrased through people/institutions rather than raw scores.

Avoid:

- “synergy,” “optimize,” “KPI,” “buff/debuff,” “quest,” “cooldown” in normal player-facing prose where a world-consistent term works;
- florid paragraphs that hide a decision;
- generic “Something happened” notifications;
- invented lore irrelevant to the succession;
- false certainty when information is stale/unknown;
- promises that imply support is secured before proof/collateral;
- ending prose that claims facts not present in structured data.

## Deliverables

### 1. Complete copy inventory and consistency pass

Audit every player-facing key for:

- title/menu/save/error;
- King/phase/prognosis;
- resources/ratings/bands;
- lords, desires, fears, Proof and Red Lines;
- support states and reasons;
- all actions, variants, previews, cancellations and invalidations;
- bargains, offices, collateral and breaches;
- Claim/Church/forgery/Penance;
- war, occupation, garrisons, Capital and threat;
- Spy/intelligence freshness/secrets;
- events and choices;
- chronicle/deltas;
- forecast/verdict/uncertainty;
- onboarding/help/glossary;
- every ending route, ballot reason, political cost and replay action;
- recoverable errors and debug labels where player-visible.

Remove placeholder, duplicated, contradictory and tone-breaking text. Preserve stable keys.

### 2. Character differentiation

Give each rival a compact recognisable voice in direct demands/letters without turning every system label into dialogue.

- Edric: blunt, martial, testing strength and courage.
- Ysabel: controlled, transactional, attentive to safety and leverage.
- Renard: entitled, courtly and increasingly defensive.
- Oswin: lawful, ecclesiastical and concerned with order/legitimacy.
- Mara: severe, regionalist and suspicious of central power.

Voice must not hide mechanical demands. A player should be able to tell exactly what proof/collateral/red line is involved.

### 3. Consequence-first action language

For every action preview, ensure text order supports:

1. what the player is doing;
2. target and duration;
3. immediate cost;
4. resources/collateral locked;
5. known likely consequence;
6. visibility/political meaning;
7. cancellation/invalidation;
8. intentional uncertainty.

Use compact labels and one-sentence explanations. Do not repeat numeric data already shown by structured UI.

### 4. Time/phase pressure language

Polish:

- initial eight-week prognosis;
- Stable/Ailing/Gravely Ill/Deathbed transitions;
- physician reports from approximate weeks to “any hour”;
- what newly becomes legal or politically acceptable;
- final-dawn/death proclamation;
- Deathbed action urgency.

The language must pressure strategic choice without implying an exact hidden death day.

### 5. Information-state language

Make these distinctions unmistakable:

- public fact;
- fresh private intelligence;
- stale report;
- unknown/undeclared;
- conditional support;
- public coercion;
- secretly coerced support known only to player;
- rumor versus discovered evidence;
- exact self-knowledge versus military band estimate.

Never describe stale/unknown information as current fact.

### 6. Onboarding comprehension pass

Review the integrated tutorial sequence with actual screenshots and copy lengths.

Teach in this order without forcing a route:

- objective, clock, pause and Orders;
- how to read Renard’s advantage;
- relationship≠support;
- Proof/collateral/maturation;
- Claim/Church/Capital distinction;
- war/occupation trade-offs when first relevant;
- forecast uncertainty and end procedure.

Replace generic tutorial voice with concise chancery/physician/advisor framing where it improves identity. Keep each interruption short and defer detail to help/glossary.

### 7. Event and chronicle pass

For every authored event:

- make trigger/context clear;
- keep choices meaningfully distinct in wording;
- preview known consequences without revealing hidden outcomes;
- ensure names/pronouns/titles are consistent;
- keep choice buttons scannable;
- avoid false moral labels when the choice is strategic;
- provide a clear result/chronicle line.

Routine chronicle entries should be compact. Major public acts, scandals, battles, Pledges and phase changes should sound consequential without all-caps spam.

This packet does not change event eligibility, weights, cadence or effects; hand those to WP-040.

### 8. Forecast and ending comprehension

Forecast:

- explain Favored/Contested/Unlikely/Blocked;
- describe unknown votes and tie-break dependencies;
- use constitutional language without legalese overload;
- never produce a percentage or hidden score.

Ending:

- state win/loss immediately;
- reconstruct ballots/Acclamation in chronological, causal language;
- explain each vote from structured reasons;
- distinguish decisive tie-break from background advantages;
- list political debts/costs plainly;
- phrase turning points as events, not generated grandiose claims;
- make historical Greyfen vote explicit after the player has already lost.

### 9. Error and recovery copy

Polish recoverable messages for:

- invalidated action;
- full Order slots;
- lost leverage/collateral;
- corrupt/incompatible save;
- previous-checkpoint recovery;
- storage failure;
- missing asset fallback;
- development invariant failure when exposed to testers.

Errors must say what happened, what was preserved and what the player can do next.

### 10. Copy tests and critic

Add tests/lint-like assertions for:

- no missing keys;
- no unresolved placeholders/interpolation tokens;
- no accidental duplicate title/label where distinction matters;
- representative max length per component contract;
- no forbidden internal jargon in normal player strings;
- all events/choices/endings have result text;
- pronoun/name/title consistency where practical;
- formatting remains plain text/approved markup only.

Use an independent critic to play at least opening, one political negotiation, one battle/scandal and one ending while focusing solely on comprehension and voice. The critic should identify anything they misunderstood, not merely stylistic preference.

## Implementation contract

- Copy modules remain declarative and data-driven.
- Do not change IDs, conditions, costs, durations, effects or order of constitutional rules.
- Do not introduce runtime LLM generation.
- No UI layout changes; report overflow/placement to WP-041 with screenshots and exact key.
- Do not hide game mechanics behind flavor.
- Keep screen text concise; deep explanations live in help/wiki.
- Preserve accessibility: meaningful labels, no decorative punctuation spoken excessively, no ALL CAPS dependency.

## Acceptance tests

- [ ] Every player-facing text key is complete and no placeholder/gibberish remains.
- [ ] Character direct messages are distinct while mechanical demands stay clear.
- [ ] Action previews and invalidation messages state costs/consequences/uncertainty accurately.
- [ ] Onboarding teaches the required distinctions without forcing a route or overwhelming the opening.
- [ ] Forecast never overstates unknown information or uses score/percentage language.
- [ ] Every ending fixture is understandable and factually matches structured data.
- [ ] Event/chronicle copy has no effect/eligibility/weight change.
- [ ] Copy length fixtures fit component contracts or produce documented WP-041 handoffs.
- [ ] Independent comprehension critic clears P0/P1 misunderstandings.
- [ ] Standard gates, copy checks and wiki sync pass.

## Required evidence

- full copy inventory and changed-key list;
- before/after screenshots for major comprehension fixes;
- overflow/layout handoff list;
- event/ending sample matrix;
- copy-test results;
- critic notes describing actual misunderstandings and resolutions;
- implementer/critic logs.

## Agent topology

Parallel read-only reviewers may cover actions/politics, events/chronicle and onboarding/ending. One copy lead serially edits canonical strings to preserve terminology. One independent comprehension critic plays the integrated build.

## Logging

Create:

- `logs/agents/WP-043/reviewer-actions-politics-<name>.md`
- `logs/agents/WP-043/reviewer-events-<name>.md`
- `logs/agents/WP-043/reviewer-onboarding-ending-<name>.md`
- `logs/agents/WP-043/implementer-<name>.md`
- `logs/agents/WP-043/critic-<name>.md`

## Completion handoff

Provide changed-key inventory, terminology/voice rules, UI/technical/gameplay handoffs, remaining comprehension risks and integration readiness for WP-049.
