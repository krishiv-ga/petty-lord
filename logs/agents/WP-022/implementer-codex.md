# Agent Log — WP-022 — Implementer/Codex

- **Packet:** WP-022 War, Occupation, Threat, Dispossession and the Capital
- **Role:** Implementer
- **Git target:** `main`
- **Starting revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283`
- **Ending revision:** pending follow-up critic checkpoint
- **Status:** Critic remediation complete; follow-up independent verdict pending

## Scope

Owned paths:

- `src/sim/systems/{military,war,occupation,threat,capital}/**`
- `src/sim/systems/actions/military/**`
- `src/sim/projections/military/**`
- `tests/sim/{war,occupation,capital}/**`
- `wiki-site/game-systems/war-and-occupation.md`
- `logs/agents/WP-022/**`

Explicitly out of scope:

- Shared contracts and foundation state initialization
- Economy recovery, political support transitions, observer knowledge, AI, UI and packet status
- Canonical design or balance changes

## Work performed

- Confirmed WP-019 is integrated, Wave 2 is open, `main` matches `origin/main`, and the packet's paths do not overlap the concurrent untracked WP-023 log.
- Read the complete packet authority chain and mandatory `$packet`, `$hunt`, `$critic` and `$wiki-sync` workflows.
- Added a JSON-compatible military domain with exact levy/contract availability, atomic commitments,
  deterministic proportional casualties, one-day return travel, expiry processing and accounting
  invariants.
- Implemented stored-fortune campaigns, Royal Authority phase rules, mandatory public defender
  reactions, observer-scoped AI Yield, derived defensive cause, current-controller revalidation and
  deterministic battle resolution.
- Implemented hereditary occupation/dispossession, 75-troop garrisons, 25% economy hooks,
  liberation/withdrawal, one-time fallout facts and immediate post-casualty/expiry collapse.
- Implemented Royal/Occupied/Uncontrolled/contested Capital states, 200-troop control, pyrrhic entry,
  simultaneous-campaign revalidation, exact benefit revocation and persistent royal casualties.
- Added canonical 150-troop mercenary hire/renew handlers, exact 50/40/20 Gold debit effects,
  two-band cap, seven-day schedules, one-day warnings and mixed-garrison return scheduling.
- Added authoritative military facts, current-state leverage, Renard's separate forced-withdrawal
  checklist and exact Military Acclamation checklist/invariant.
- Added observer-safe force previews and synchronized the maintained war/occupation wiki page.
- Resolved every independent hunter P1 with a deterministic regression: defender-win garrison
  collapse, forged defense/Yield facts, unbounded mercenaries, stranded expiry returns,
  Capital/dispossession Prestige, royal resurrection and generic Renard leverage.
- Resolved the independent critic's five P1 and one P2 findings: campaign-bound claimant and military
  aid authorization, per-contributor basing/adjacency revalidation, occupied-allied-base rejection,
  current-controller reaction rebuilding, prior-garrison return, failed-entry Prestige prevention,
  layered Capital battle/control Prestige, and Renard's literal third-party Southmere gate.
- Added structured political fallout for Capital loss, usurper/Church conduct, Pledge shock and
  first-dispossession viability integration without crossing WP-021/WP-029 ownership boundaries.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| Implement behind the frozen `systems.war` JSON namespace without editing shared contracts | WP-019 freezes shared seams and WP-022 forbids contract edits | WP-029 will compose the typed military state with time/economy/politics/knowledge adapters |
| Emit structured war facts/effects instead of mutating Gold, support or AI knowledge | Packet implementation contract and Wave 2 ownership | WP-020/021/023 and WP-029 consume the hooks |
| Require stored defensive authorizations and campaign-bound observer Yield assessments | Caller-authored booleans/power values reproduced a Stable-sanction and AI-Yield bypass | WP-029/WP-023 must create these trusted records; raw commands cannot assert them |
| Emit exact negative Gold deltas rather than accept `paid` booleans | Payment assertions are not authoritative and WP-022 may not own economy state | WP-029 must apply the debit and military transition atomically |
| Revalidate both garrison classes after battle casualties and contract expiry | Control thresholds are continuous invariants, including when a defender wins | Benefits and Acclamation never observe a sub-threshold controller |
| Keep canonical Mara-first values unchanged | Hunter could not assess balance while malformed contracts existed; canonical route is not automatically fortune-proof | WP-040 measures policy frequency after Wave 3 integration |

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| Gate/dependency/current-main audit | Pass | WP-019 integrated; WP-022 Ready; Wave 2 open at `e98954d` |
| `pnpm exec biome check --write ...<WP-022 paths>` | Pass | Scoped implementation/test files formatted; two files updated mechanically |
| Focused Vitest command from wiki | Pass | 6 files, 34 tests, including hunter and critic regressions |
| `pnpm test:sim` | Pass | 30 files, 197 deterministic simulation tests |
| `pnpm test` | Pass | 8 files, 46 unit/content/architecture tests |
| `pnpm typecheck` | Pass | `tsc -b` completed without diagnostics |
| `pnpm build` | Pass | TypeScript and Vite production build completed |
| `pnpm wiki:check` | Pass | VitePress client/server build and page rendering completed |
| Independent `$hunt` | Findings resolved | 13 named attacks executed; seven P1 findings converted to regressions, no design amendment |

## Critic findings and resolution

| Severity | Finding | Resolution |
|---|---|---|
| P1 | Arbitrary/remote allied forces and enemy-occupied allied bases | Every contributor now needs a current adjacent base; non-primary providers need a campaign/side/provider/beneficiary-bound authorization capped by troops. Bases and aid are revalidated at resolution. |
| P1 | Simultaneous campaigns combine stale defenders or orphan a prior garrison | Controller change returns obsolete reaction forces and rebuilds from the current controller/garrison; attacker-already-controls cancels; every Yield transfer first restores legal control and returns the old garrison. |
| P1 | Failed Uncontrolled entry farms +8 Prestige | Start and resolution both require 200 claimant-owned, garrison-eligible troops; failed assignment cancels without battle Prestige. |
| P1 | Caller-forged `declaredClaimant` | The boolean was removed. A current campaign-bound Capital march authorization is required and raw-command forgery is regressed. |
| P1 | Capital defender-victory Prestige is wrong | Normal major/minor battle Prestige is computed first, then Capital acquisition/loss is layered from control state; Royal, claimant, collapse and attacker-victory cases are regressed. |
| P2 | Renard gate requires the claimant to occupy Southmere | Any current hostile occupation satisfies the authored Southmere branch; demanding-claimant Capital control remains separate. |

The first critic verdict was **Needs fixes** at `ee1d9b3`. All findings are implemented and tested;
the independent follow-up review is pending on the remediation commit.

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Save/schema impact: no shared schema version change; typed data remains JSON-compatible under `systems.war`
- Wiki pages updated: `wiki-site/game-systems/war-and-occupation.md`

## Risks and deferred work

- Cross-domain economy, politics, AI knowledge and succession wiring is deliberately deferred to WP-029.
- The canonical Gold debit effects are not yet atomic with WP-020 resource mutation on shared main;
  WP-029 owns that adapter. The military module no longer trusts a caller-provided payment flag.
- Mara-first conquest frequency remains a WP-040 tuning question after integrated multi-seed policy
  tests; no locked values were tuned here.
- Trusted authorization records must be created only by WP-029's composed politics/knowledge adapter;
  player commands cannot construct them through the registered military command parser.

## Integration notes

- Shared contracts touched: none
- Reconciliation/order constraints on `main`: WP-029 must install the military domain state/module alongside WP-020/021/023
- Follow-up packets: WP-029, WP-040 for balance findings
- Integration-ready: No — follow-up independent critic clearance remains
