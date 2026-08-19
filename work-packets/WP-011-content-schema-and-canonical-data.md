# WP-011 — Content Schema and Canonical Data Pack

- **Status:** Blocked by WP-000
- **Wave:** 1
- **Execution:** Parallel-safe within Wave 1
- **Depends on:** WP-000
- **May run with:** WP-010, WP-012
- **Must not run with:** WP-019 or any Wave 2 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$critic`, `$design-guard` only if a genuine contradiction is found
- **Critic:** Required
- **Integrator:** WP-019
- **Release impact:** Foundation checkpoint candidate

## Objective

Translate the locked design package into one complete, validated, typed, data-driven canonical content pack without implementing game-system behavior.

The result must remove ambiguity for later agents: IDs, map topology, actors, starting values, action definitions, support proofs/red lines, bargains, secrets, events, phase constants, outcomes, text keys and balance constants are present, cross-referenced and schema-validated.

## Canonical inputs

Read every file listed by [`designer/README.md`](../designer/README.md), with particular focus on:

- [`designer/world-and-actors.md`](../designer/world-and-actors.md)
- [`designer/balance-sheet.md`](../designer/balance-sheet.md)
- [`designer/candidate-evaluation.md`](../designer/candidate-evaluation.md)
- [`designer/game-rules.md`](../designer/game-rules.md)
- [`designer/politics-and-succession.md`](../designer/politics-and-succession.md)
- [`designer/war-and-occupation.md`](../designer/war-and-occupation.md)
- [`designer/ai-information-events.md`](../designer/ai-information-events.md)
- [`designer/paperplay/final-amendments.md`](../designer/paperplay/final-amendments.md)

The parent `/designer` files override paperplay history. Do not resurrect superseded values.

## Owned paths

Expected ownership:

- `src/content/**`
- `tests/content/**`
- content fixtures under `tests/fixtures/content/**`
- `wiki-site/architecture/content-and-schemas.md`
- `wiki-site/reference/content-schema.md`
- `wiki-site/reference/action-catalog.md`
- `wiki-site/reference/glossary.md` content-owned terms
- `logs/agents/WP-011/**`

Do not edit simulation behavior, UI, root configuration, shared barrels, packet status, or compact logs.

## Deliverables

### 1. Stable identifiers

Define explicit IDs for all canonical entities:

- six lords including the player;
- seven territories;
- all action families and contextual actions;
- royal-health phases;
- support states and reasons;
- Church states;
- offices, policies, bargains and collateral types;
- secrets and evidence;
- opening packages;
- authored events and choices;
- shocks/conditions;
- ending labels and chronicle categories;
- asset slots and text keys.

IDs are permanent save/content identifiers, not display strings. They must be unique, lowercase/kebab-case or another single documented convention, and safe for JSON and analytics-free debug traces.

### 2. Zod schemas and inferred types

Create Zod 4 schemas for the full authored-content boundary.

Schemas must validate:

- required fields and numeric bounds;
- cross-entity references;
- map adjacency symmetry and legal topology;
- unique IDs and display ordering;
- action costs, durations, phases, repeat/cooldown rules and visibility;
- bargain prerequisites, collateral, proof and red-line references;
- secrets, discovery/exposure effects and guaranteed availability rules;
- event conditions, choices, weights, cooldowns and consequences;
- candidate-evaluation values and explanation keys;
- asset manifest slots and density metadata;
- text keys required by content.

Use small composable schemas. Avoid one enormous opaque schema or runtime classes.

### 3. Canonical map and actor data

Encode exactly the final seven-territory map, legal owners, adjacency, Wealth, levy capacity, Fortification and traits.

Encode all five rivals and the player baseline:

- identity and titles;
- starting resources/ratings;
- starting relationships and public/private positions;
- desire, fear, proof, red line and special advantage;
- candidacy behavior;
- bargain menu and incompatible conditions;
- AI personality tags/weights as authored by the design, without implementing AI selection;
- starting military and economic data.

Any value not explicitly canonical must be recorded in an `ASSUMPTIONS` section of the implementer log and proposed for WP-019 rather than silently invented. Prefer extracting an existing value from the balance sheet or amendment ledger.

### 4. Action and rule-definition data

Encode all eleven base action families and contextual actions with:

- ID, label and explanation text key;
- legal phases and targets;
- base duration and Deathbed modifier;
- start cost and acceptance-time collateral timing;
- visibility;
- repeat/cooldown/diminishing rules;
- canonical result/effect identifiers;
- cancellation and invalidation policy;
- AI availability tags;
- preview fields required by UI;
- chronicle templates/keys.

Do not implement effects as arbitrary executable functions inside content. Use typed effect/rule identifiers and data that later domain handlers resolve.

### 5. Politics, Church and succession data

Encode:

- Leaning maturation by phase;
- Pledge/Commitment/Under Duress reason categories;
- per-lord proofs, red lines and hysteresis constants;
- Church consideration/endowment/condemnation states and modifiers;
- Council thresholds, elimination and tie-break order;
- Military Acclamation checklist;
- Claim and Prestige bands;
- candidate-evaluation authored values and explanation ordering;
- support/candidacy eligibility constants.

The data may express thresholds and lookup tables; it must not become a hidden generic KING SCORE.

### 6. War and economy data

Encode canonical:

- territory income and levy capacities;
- levy recovery formula constants;
- Tax Strain and Unrest effects;
- invasion duration/logistics;
- fortification/terrain/commander modifiers;
- casualty bands or formulas specified by design;
- seat and Capital garrison requirements;
- occupation income/recovery/trait rules;
- King's Peace phase modifiers and sanctions;
- threat-history constants;
- mercenary access/costs and contract data.

### 7. Openings, secrets, events and endings

Provide the complete launch content required by the design:

- deterministic opening-package definitions and compatibility rules;
- guaranteed Renard vulnerability path in every legal package;
- authored secrets/evidence and their target constraints;
- sixteen authored events or the exact canonical count after reconciling design files;
- event choice text keys and structured effects;
- occurrence windows/cooldowns/requirements;
- ending labels, reconstruction sections and decisive-turning-point keys.

Content may use placeholder copy only where final prose is owned by WP-043, but the semantic key and maximum/representative length must exist now.

### 8. Asset-slot manifest schema

Define the raster asset slots later art/UI packets require:

- portraits and deterioration states;
- crests and territory emblems;
- map plate and overlays;
- status/action/resource icons;
- seals, ribbons, textures, letters and ending/title art.

Each slot declares logical dimensions/aspect, allowed raster formats, density expectations, alpha/background requirements, semantic role and fallback key.

No SVG format is legal in the schema. A validation test must reject `.svg`, data-URI SVG and icon-font references.

### 9. Validation report and data snapshot

Create a deterministic command/test that loads the entire canonical pack and emits a concise validation summary:

- entity counts;
- unresolved references;
- map topology;
- numeric boundary warnings;
- missing text/asset slots;
- event/opening coverage;
- content hash useful for save/build diagnostics.

Do not invent a custom dashboard. A test/CLI summary through the approved project command surface is enough.

## Implementation contract

- Data is declarative, serializable and deterministic.
- Content modules do not import React, Zustand, browser APIs, UI components or simulation reducers.
- Types are inferred from Zod schemas where practical.
- No circular imports between content categories.
- No arbitrary behavior closures hidden in JSON-like definitions.
- Text, IDs and numeric values remain separable.
- Every cross-reference is validated in one canonical loader.
- Production runtime receives a validated immutable content registry.

## Acceptance tests

- [ ] Canonical content loader validates the complete pack with zero unresolved references.
- [ ] Exactly six lords and seven territories exist; adjacency is symmetric and matches design.
- [ ] All required actions, contextual actions, bargains, proofs, red lines, secrets, openings, events, phases, Church states and ending labels are represented.
- [ ] Every design-table value has one canonical source and no contradictory duplicate.
- [ ] Every action has cost, duration, availability, visibility, cancellation/invalidation, preview and AI-permission data.
- [ ] Every event choice and secret consequence references legal structured effects.
- [ ] Every opening guarantees an authored route to discover/expose a Renard vulnerability.
- [ ] Asset schema rejects SVG and permits only approved raster formats.
- [ ] Content pack hash and validation summary are deterministic.
- [ ] No content module imports UI or implements domain transitions.
- [ ] All tests and standard gates pass.
- [ ] Independent critic verifies design fidelity and cross-reference completeness.
- [ ] Owned wiki/reference pages are updated.

## Required evidence

- validation summary and entity counts;
- machine-readable mapping from canonical design sections to content modules;
- cross-reference and topology test output;
- SVG-rejection test;
- list of assumptions or explicit statement that none were needed;
- implementer and critic logs.

## Agent topology

One lead implementer owns schemas/loader. It may fan out data transcription into disjoint categories—actors/map, actions/bargains, events/secrets, assets/text—but must integrate them against a single schema and run one complete cross-reference audit.

The independent critic should compare data to every canonical design file and specifically hunt:

- stale paperplay values;
- missing acceptance-time collateral semantics;
- double-counted Church/Oswin effects;
- missing private/public coercion distinctions;
- broken guaranteed intrigue path;
- impossible event conditions;
- missing raster slots or hidden SVG allowance;
- duplicate IDs or display strings used as IDs.

WP-019 owns any cross-contract reconciliation with the simulation kernel.

## Logging

Create:

- `logs/agents/WP-011/implementer-<name>.md`
- `logs/agents/WP-011/critic-<name>.md`

Do not edit shared status or packet index.

## Completion handoff

Document loader API, immutable registry shape, content hash, entity counts, assumptions, text/art placeholders, and proposed integration seams for WP-019. State whether integration-ready.
