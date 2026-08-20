# Agent Log — WP-021 — Implementer/Codex

- **Packet:** WP-021 Politics, Support, Claim, Church and Succession
- **Role:** Implementer
- **Git target:** `main`
- **Starting revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283`
- **Ending revision:** `65bbd4bd48d96fda9ee5096739f1649c4df7f8ff`
- **Status:** Complete

## Scope

Owned paths:

- `src/sim/systems/{relationships,politics,support,claim,church,succession}/**`
- `src/sim/systems/actions/politics/**`
- `src/sim/projections/politics/**`
- `tests/sim/{politics,succession}/**`
- `wiki-site/game-systems/{politics-and-support,claim-church-succession,endings}.md`
- `logs/agents/WP-021/**`

Explicitly out of scope:

- Battle, occupation and military-fact production (WP-022)
- Secret discovery, knowledge and event scheduling (WP-023)
- Economy/time/Order execution (WP-020), UI and persistence integration
- Frozen shared contracts, packet index, compacted/status logs and root tooling

## Work performed

- Added directed bounded Relationships with reason history and expiring modifiers.
- Implemented exact per-voter candidate evaluation, ordered reasons, opening fixtures, preference
  hysteresis and the Constitution's forced vote when both finalists cross a Red Line.
- Added serializable Support maturation, Pledge/Commitment inertia, typed Proof facts, persistent
  Request refusal, public/private coercion, spent-secret tracking and observer-safe projections.
- Added authored bargain target/collateral validation, atomic acceptance, replay protection, office and
  policy incompatibility, escrow breach handling, Access Debt consumption and action-planning gates.
- Added candidacy, Renard withdrawal, legal candidate queries and historical Greyfen vote planning.
- Added safe/fabricated Claim, once-run Research/Forge, Forgery evidence/exposure, confession and exact
  shocks.
- Added Church cases, Patronage anti-stack, sole endorsement/reconsideration, condemnation and Penance.
- Added deterministic Military Acclamation/Council succession with six-voter ballots, runoff,
  complete tie order, manual Greyfen vote and full reconstruction.
- Updated all three packet wiki pages and completed independent hostile testing.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| Politics receives observer-limited military, leverage, secret and Proof facts as typed input | WP-021 may not import WP-022/WP-023 private state | WP-029 must supply and revalidate those facts |
| Bargain identity and collateral are validated inside WP-021 | Caller trust enabled free promises and wrong-lord support | WP-029 must create Agreements only through the exported acceptance API |
| Candidate totals remain absent from UI projections | Canonical design exposes reasons, not a master king score | WP-033 consumes ordered positive/negative reasons |
| Shared contracts remain unchanged | Wave 2 shared contracts are frozen for WP-029 reconciliation | All new public APIs live under WP-021-owned entrypoints |
| Claim/Church project and Penance resolution do not charge resources again | WP-020 charges start costs | WP-029 supplies the `costPaidAtStart` resolution fact |

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| `pnpm exec vitest run --config vitest.sim.config.ts tests/sim/politics tests/sim/succession` | Pass | 7 files, 80 tests |
| `pnpm exec vitest run --config vitest.sim.config.ts --maxWorkers=1` | Pass | Final combined Wave 2 simulation: 30 files, 197 tests; one worker avoids host-contention timeouts |
| `pnpm exec biome check <WP-021 paths>` | Pass | 26 files clean |
| `pnpm check` | Pass | Full repository Biome check clean after concurrent WP-022 review landed |
| `pnpm wiki:check` | Pass | VitePress build completed |
| `pnpm typecheck` | Pass | Full strict TypeScript graph clean |
| `pnpm build` | Pass | TypeScript plus Vite production build; 130 modules transformed |
| Independent `$hunt` | Pass | Hostile promise/coercion/churn/ballot probes clear after fixes; see hunter log |
| Independent `$critic` | Pass | Clear for integration; 14 findings fixed and independently rechecked |

## Critic findings and resolution

| Severity | Finding | Resolution/status |
|---|---|---|
| P1 | Offer replay, wrong/underpriced collateral and incompatible same-offer policies could mutate the ledger | Fixed with accepted IDs, authored contracts and atomic validation; hostile replay clear |
| P1 | Refusal churn, arbitrary Agreement IDs and arbitrary Proof IDs could manufacture a Pledge | Fixed with voter-persistent refusal and typed accepted Agreement/Proof validation |
| P1 | Undeclared/Stable political preparation and repeated Threaten could bypass cadence | Fixed with phase/declaration gates and phase-target-leverage history |
| P1 | One secret could coerce multiple voters; Self support and public visibility could be overwritten/spoofed | Fixed with spent-secret ledger, Self guard and discriminated leverage visibility |
| P2 | Both-excluded finalists had no forced constitutional vote | Fixed with violence → Relationship → Claim → declaration fallback |
| P2 | Candidate status leaked private Leaning | Fixed with explicit observer-knowledge input |
| P2 | Joint Campaign required its own future victory before acceptance | Fixed by accepting the pending 100-troop obligation; victory is the later Commitment hook |
| P1 | Exact evaluation/timing omitted hysteresis, authored flags, reason gates, same-time sequence and Deathbed/cooldown rules | Fixed with exact values, ordered reasons, sequence precedence and start availability tests |
| P1 | Request could not preserve start eligibility or distinguish later invalidation | Fixed with serialized start assessment carried through action effect; both branches tested |
| P1 | Agreement termination, two-sided Joint Campaign, condition gates and off-dawn Patronage were incomplete | Fixed with participant-aware lifecycle, owner locks, active conditions and fractional elapsed days |
| P2 | Relationship IDs replayed after expiry and tie-break evidence was incomplete | Fixed with permanent history check and decisive tests for every constitutional step |

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Save/schema impact: no shared schema edit; WP-029 must serialize accepted Agreement IDs, Support
  clocks/refusals/shocks, spent leverage, Access Debt, Claim/Church state and succession reconstruction
- Wiki pages updated: `politics-and-support.md`, `claim-church-succession.md`, `endings.md`

## Risks and deferred work

- WP-029 must wire action start charging, schedules, leverage/Proof revalidation, observer knowledge and
  death resolution without bypassing the exported state machines.
- No unresolved technical or design risk remains inside the packet.
- Route frequency and value tuning remain WP-040 work; no design defect was found.

## Integration notes

- Shared contracts touched: none
- Reconciliation/order constraints on `main`: WP-020 and WP-022 landed concurrently; WP-023 must land
  before the final shared gate and WP-029 owns cross-system state wiring
- Follow-up packets: WP-029 and WP-040
- Integration-ready: Yes; final combined shared gates are green
