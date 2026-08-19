# Authored content

This directory is the declarative, Zod-validated boundary for the canonical game content. It contains
no simulation transitions, UI components, browser APIs or executable effect closures.

`index.ts` exports the immutable `canonicalContentRegistry`, inferred content types, the loader and the
validation-summary helpers. The loader performs structural validation, category-scoped ID and display
order checks, cross-reference resolution, exact map-topology checks, text/asset coverage, opening and
event coverage, stable serialization, a deterministic FNV-1a 64-bit diagnostic hash, and recursive
runtime freezing.

Category modules are intentionally one-directional:

- `ids.ts` and `schemas.ts` define stable identifiers and composable authored-content schemas;
- `world.ts`, `actions.ts`, `rules.ts`, `narrative.ts` and `assets.ts` contain canonical definitions;
- `source-mappings.ts` links canonical design sections to concrete entity IDs;
- `pack.ts` composes raw definitions and the text catalog;
- `loader.ts` is the single validation and immutable-registry boundary;
- `content.test.ts` is the design-fidelity and cross-reference regression suite.

Later simulation packets resolve typed `effectId`, rule and invalidation identifiers. They must not
place behavior functions inside content or bypass `loadCanonicalContent`.
