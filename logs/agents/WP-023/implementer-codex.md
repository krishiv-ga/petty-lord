# Agent Log — WP-023 — Implementer/Codex

- **Packet:** WP-023 Rival AI, Observer Knowledge, Secrets, Openings and Events
- **Role:** Implementer
- **Git target:** `main`
- **Starting revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283`
- **Ending revision:** `5ffb23b70fdfb16823c5893113ad60ef2b8a7d8d` (implementation; evidence-only log amendment follows)
- **Status:** Ready for integration

## Scope

Owned paths:

- `src/sim/systems/{ai,knowledge,intelligence,secrets,openings,events}/**`
- `src/sim/systems/actions/intelligence/**`
- `src/sim/projections/knowledge/**`
- `tests/sim/{ai,knowledge,events}/**`
- `wiki-site/game-systems/ai-knowledge-events.md`
- `logs/agents/WP-023/**`

Explicitly out of scope:

- Political support transitions, battle resolution, baseline economy/time, UI, storage adapters
- Frozen `src/contracts/**`, root tooling, lockfile, packet index, status and compacted logs

## Work performed

- Added serializable observer-ledger facts with source, confidence, timestamp, staleness,
  invalidation and sequence ordering, plus public/self-only knowledge projections for succession,
  military, support/coercion, threat, agreements, secrets, Intent, Capital, occupation and war.
- Added knowledge-bound one-Intent AI selection with internal observer requirement/threat derivation,
  affordability filtering, authored personality/phase modifiers, stored seeded near-tie noise,
  actual charges/locks, next-dawn invalidation fallback and reaction preservation.
- Added Watch Court and Find Dirt plans with canonical durations/costs, Deathbed lock, stored contested
  tier/power/defense/detection snapshots, seven-day intelligence freshness, partial results, repeat
  detection and typed hostility/alert effects.
- Added secret discovery, one-use blackmail, one-time exposure, destroyed-evidence invalidation and
  typed release hooks for privately coerced support.
- Added seeded opening package/secret selection and viability validation. The same seed recreates the
  full package; controlled hostile corpora cover all packages and Renard vulnerabilities.
- Added the 16-event engine with deterministic weighted selection, stored choice outcomes,
  eligibility/cooldown/once/cadence rules, mandatory and delayed follow-up decisions, changed-condition
  fallback, death-before-ambient suppression and structured notification classification.
- Added focused acceptance/hostile tests and synchronized the owned wiki page.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| Implement domain-owned serializable models behind pure functions | WP-019 freezes narrow JSON-capable seams and WP-023 may not mutate shared contracts | WP-029 can compose the domain with time/politics/war without schema drift |
| Accept structural authored-content views instead of importing runtime content | Simulation architecture forbids transitive `src/content` dependencies | WP-029 injects validated `GameContent`; simulation remains data-agnostic |
| Require the acting lord's projection and derive candidate knowledge gates/threat inside AI selection | Critic reproduced caller-trusted hidden candidate/threat inputs | WP-029 may bind authored action contracts, but cannot inject hidden belief inputs |
| Emit typed hooks rather than applying political/war consequences | Packet forbids support/war implementation | WP-029 connects `politics.*`/`knowledge.*` effects to peer resolvers |

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| `pnpm exec vitest run --config vitest.sim.config.ts tests/sim/ai tests/sim/knowledge tests/sim/events` | Pass | 6 files, 34/34 after critic regressions |
| `pnpm test:sim` | Pass | Final combined Wave 2 state: 30 files, 182/182 |
| `pnpm typecheck` | Pass | Strict `tsc -b` after all current Wave 2 changes |
| `pnpm exec vitest run tests/unit/architecture.test.ts` | Pass | 5/5; no sim→content/browser dependency |
| Focused `biome check` | Pass | Owned production/test/wiki/log files clean |
| `pnpm check` | Pass | Combined repository, 201 files |
| `pnpm test` | Pass | 8 files, 46/46 |
| `pnpm build` | Pass | Production TypeScript/Vite build |
| `pnpm wiki:check` | Pass | VitePress build and links after concurrent WP-020 link repair |
| Forbidden nondeterminism/browser scan | Pass | No `Math.random`, clock, timer, browser storage/network or DOM use in WP-023 production paths |

## Critic findings and resolution

| Severity | Finding | Resolution/status |
|---|---|---|
| P2 | Hunter reproduced exposure of a discovered secret after its evidence was destroyed (`hunter-destroyed-secret`) | Fixed: exposure now requires valid discoverable evidence; exact regression passes |
| P1 | Random event choices returned contradictory conditional placeholder effects | Added typed outcome reduction for E06/E09/E12/E14 and regressions |
| P1 | AI candidates/threat could be supplied from hidden authoritative state | Required actor-owned projection; internalized knowledge gates and canonical observer threat derivation |
| P1 | Projection omitted public/private coercion semantics | Added narrowed public support type, observer-private support facts and public-duress validation |
| P1 | Partial Find Dirt could expose an exact army count | Restricted partial military intelligence to bands; exact projection now requires confirmed direct/Watch Court source |
| P2 | Follow-up decisions could resolve early or replay | Stored due time and resolved follow-up IDs; both are enforced |
| P2 | Ambient cadence trusted arbitrary caller slot keys | Derive the six canonical day slots internally; gap days reject |
| P2 | Repeated evidence destruction re-emitted release effects | Reject invalid/exposed evidence destruction and clear spent leverage |
| P2 | AI completion accepted invalid troop losses and invalidation replaced immediately | Bound losses and delay replacement to the next canonical dawn |
| P2 | Stale partial army bands overrode current public knowledge forever | Stale credible bands now yield to the current public band |
| P2 | Observer threat initially used invented ratios/raw army and missed observer-known private coercion | Uses canonical points with exact defense and current known public/private coercion; informed/uninformed regression passes |
| — | Independent critic final verdict | Clear for integration; no unresolved P0/P1/P2/P3 finding |

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Save/schema impact: no foundation version change; new WP-023 domain values remain JSON-serializable
- Wiki pages updated: `wiki-site/game-systems/ai-knowledge-events.md`

## Risks and deferred work

- WP-029 must bind the authored AI catalog's action IDs/cost/duration and typed effects to real
  politics, time and war handlers; hunter gates still require integrated hidden-state twins,
  leader/latent-threat targeting and applied event-effect traces.
- WP-040 owns balance conclusions for package win pressure, Intent repetition/pinball, intrigue cost,
  stale-decision shocks and interruption cadence.

## Integration notes

- Shared contracts touched: none
- Reconciliation/order constraints on `main`: preserve WP-020–WP-022 disjoint paths
- Follow-up packets: WP-029, WP-040
- Integration-ready: Yes; independent critic clear and all final gates pass
