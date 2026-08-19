# Content and schemas

The canonical authored-content boundary lives under `src/content`.
It translates the locked design package into serializable definitions without implementing simulation
transitions. The simulation will resolve typed rule and effect identifiers; content never contains
arbitrary behavior closures.

## Dependency direction

The modules form one acyclic pipeline:

1. `src/contracts/ids.ts` defines category-scoped, lowercase-kebab stable IDs; content imports them.
2. `schemas.ts` composes small Zod schemas for the authored boundary.
3. `world.ts`, `actions.ts`, `rules.ts`, `narrative.ts` and `assets.ts` contain data only.
4. `pack.ts` assembles the raw pack and its separate text catalog.
5. `loader.ts` validates references and returns the frozen registry.
6. WP-019 exposes the validated singleton to consumers as `canonicalGameContent` through
   `src/contracts/content.ts`.

Content modules do not import React, Zustand, browser APIs, UI components, simulation reducers or
asset-rendering code. Category data does not import another category, preventing circular definitions.

## Loader boundary

`loadCanonicalContent(input)` first runs the complete Zod schema, then global refinements for:

- unique IDs and display order within every typed category;
- exact canonical entity coverage;
- all 15 relationship pairs;
- legal-lord/seat and starting military consistency;
- symmetric seven-territory adjacency, including Capital's six edges;
- lord, bargain, Proof, Red Line, secret and source-map references;
- effect-specific condition, shock, Church-state, secret, office, policy and globally unique decision
  references, including target/value/delay coherence;
- all eleven base action families and acceptance-time collateral semantics;
- one authored Renard vulnerability and the exact unique four-secret NPC pool in every opening;
- a zero-Gold choice in every event and valid seeded-outcome distributions;
- complete text keys and raster fallback slots;
- contiguous Claim bands and a 100% death-day distribution.

Successful loading produces a recursively frozen registry plus a deterministic `fnv1a64-…` content
hash. The hash uses stable object-key ordering and authored array order, so it is suitable for save and
build diagnostics. It is not a security signature.

The foundation checkpoint hash is `fnv1a64-71139efd89443029`. Saves record it in their compatibility
metadata. A changed registry must produce a new hash and either a compatible migration/policy or an
explicit import failure; consumers may not silently substitute different authored data.

## Content ownership

The registry owns authored facts: IDs, starting values, lookup tables, prerequisites, structured
effects, preview contracts and asset/text slots. Domain handlers remain authoritative for state
transitions. Later packets import stable entity IDs and `GameContent` through `src/contracts` and must
not duplicate canonical values in reducers.

See the [schema reference](../reference/content-schema.md) and [action catalog](../reference/action-catalog.md).
