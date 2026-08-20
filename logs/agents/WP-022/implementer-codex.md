# Agent Log — WP-022 — Implementer/Codex

- **Packet:** WP-022 War, Occupation, Threat, Dispossession and the Capital
- **Role:** Implementer
- **Git target:** `main`
- **Starting revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283`
- **Ending revision:** pending
- **Status:** Implementation complete; independent critic pending

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
| `pnpm exec biome check ...<WP-022 paths>` | Pass | 25 files; no fixes required after scoped formatting |
| Focused Vitest command from wiki | Pass | 6 files, 29 tests, including all seven hunter regressions |
| `pnpm test:sim` | Mixed shared-main result | WP-022's 29 tests passed; shared run was 165/175 with 10 concurrent WP-020/021/023 failures in AI, bargains and one time timeout |
| `pnpm typecheck` | Blocked outside scope | Only concurrent `events.ts` and `bargains.ts` errors remained; no WP-022 diagnostic |
| `pnpm wiki:check` | Environment/shared dependency failure on latest run | VitePress could not resolve `vue/server-renderer` from unchanged `content-and-schemas.md`; this command passed earlier in the packet before concurrent dependency activity |
| Independent `$hunt` | Findings resolved | 13 named attacks executed; seven P1 findings converted to regressions, no design amendment |

## Critic findings and resolution

Independent critic pending. Hunter findings and resolutions are recorded above and in
`hunter-independent.md`.

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
- Shared-main full gates currently include failures in concurrently edited WP-020/021/023 paths.

## Integration notes

- Shared contracts touched: none
- Reconciliation/order constraints on `main`: WP-029 must install the military domain state/module alongside WP-020/021/023
- Follow-up packets: WP-029, WP-040 for balance findings
- Integration-ready: No — independent critic and post-review full gates remain
