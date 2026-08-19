# Content schema reference

The authored pack is schema version `1` and loads through `loadCanonicalContent`. Types are inferred
from the Zod definitions and exported from `src/content/index.ts`; callers should not hand-maintain a
parallel interface.

## Registry shape

The immutable registry contains:

| Category | Canonical count | Purpose |
|---|---:|---|
| Phases | 4 | Phase bounds, maturation, inertia, Capital garrison and action pressure |
| Lords | 6 | Identity, seat, resources, support baseline, Proof, Red Lines and AI tags |
| Territories | 7 | Ownership, topology, economy, military capacity, Fortification and trait |
| Relationships | 15 | Every unordered starting lord pair exactly once |
| Actions | 19 | Eleven base families, variants, contextual actions and reactions |
| Bargains | 12 | Present collateral, future offices, Proof, incompatibilities and breach links |
| Proofs / Red Lines | 14 / 17 | Authored political gates and automatic breakers |
| Candidate evaluations | 5 | Exact lord-specific legitimacy, conduct, fear and viability tables |
| Secrets | 8 | Three Renard vulnerabilities, four other NPC secrets and conditional Forgery |
| Openings / events | 4 / 16 | Seeded openings and four mandatory plus twelve ambient events |
| Shocks / Church states | 19 / 5 | Timed inertia inputs, secret-specific selectors and institutional stance bands |
| Endings | 6 | Route labels and reconstruction keys |
| Raster asset slots | 81 | Portrait, crest, map, icon, seal, texture, letter and ending contracts |

The text catalog is built separately from semantic keys. Each entry has a role, representative default
copy and maximum length. Final prose may change in WP-043 without changing save-safe entity IDs.

## Stable IDs

Entity IDs use lowercase kebab-case. Uniqueness is category-scoped because typed domains deliberately
share canonical names such as lord `greyfen` and territory `greyfen`. Display strings and translation
keys are never used as IDs. Text keys use lowercase dot/kebab segments.

The catalog also defines support levels/bases, Claim bands, the 0–100 Prestige range, offices,
policies, conditions and chronicle categories. `sourceMappings` provides a machine-readable link from
each canonical design document to representative content entity IDs.

## Structured definitions

Actions define phases and targets, fixed-at-start duration, start cost, optional cost tiers,
acceptance collateral timing, visibility (including public force versus private blackmail), repeat
rules, cancellation/invalidation policies, typed results, preview fields, AI permission tags and
chronicle keys.

Bargains distinguish negotiation Influence from collateral applied on acceptance. Collateral types
include Gold payment/escrow, troop locks, office reservations, policies, completed actions, shared risk
and public renunciation. `collateralMode` records whether every item or one alternative is required.

Events contain eligibility, phase/window, weight, cooldown, choices and structured effects. Seeded
outcomes declare their distribution, values/weights and that the draw is stored at choice time. The
schema rejects mismatched weighted distributions and malformed coin-flip or integer-range outcomes.

Typed effect references are checked against their target domains: conditions, shocks, Church states,
secrets, offices, policies and globally unique follow-up decisions and choices. Effect targets must match their
operation, while shock values and scheduled delays must match their referenced definitions. Candidate
evaluation stores the shared
relationship, bargain and exact-tie rules once in `constants.politics.evaluation`; lord-specific
tables contain only legitimacy, conduct, fear and Proof/Red-Line facts. A test-local oracle derives
opening Leanings from those tables without adding gameplay behavior to the content runtime.

Asset slots declare logical dimensions/aspect, PNG/WebP formats, 1×/2× density expectations,
alpha/background rules, semantic role and a typed fallback slot. `rasterAssetSourceSchema` rejects
`.svg`, every data URI, icon-font references, padded references and every non-PNG/WebP source.

## Validation snapshot

`pnpm test` runs the content regression and emits a concise snapshot containing entity counts,
unresolved/missing-reference counts, event/opening coverage, topology and the deterministic content
hash. The hash changes whenever validated authored content changes and remains identical for an exact
JSON round trip.

The registry is recursively frozen at runtime. Consumers may project or index it, but must not mutate
it or import raw category modules to bypass validation.
