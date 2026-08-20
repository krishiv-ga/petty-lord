# War and occupation

WP-022 implements war as a pure deterministic domain under `systems.war`. Legal title never changes;
campaigns change physical control, persistent troops, garrisons and public military facts. The design
authority remains the canonical `designer/war-and-occupation.md` and `designer/balance-sheet.md`.

## Public implementation surface

The military implementation is split by stable responsibility:

- `src/sim/systems/military/` owns serializable types, launch-state construction, levy/contract
  availability, commitments, casualties, return timing, expiry and accounting invariants.
- `src/sim/systems/war/` owns campaign legality, Royal Authority, stored fortune, visibility,
  defender reactions, revalidation and battle resolution.
- `src/sim/systems/occupation/` owns hereditary physical control, 75-troop garrisons, liberation,
  withdrawal and economy hooks.
- `src/sim/systems/capital/` owns Royal, Occupied, Uncontrolled and pending/contested Capital states.
- `src/sim/systems/threat/` emits authoritative facts and provides military-leverage and Acclamation
  queries.
- `src/sim/systems/actions/military/` registers deterministic kernel handlers.
- `src/sim/projections/military/` builds previews only from an explicitly supplied observer estimate.

`installMilitaryState` narrows the frozen Wave 2 `systems.war` namespace without changing the shared
foundation contract. WP-029 must compose this module with the time, economy, politics and knowledge
domains.

## Campaign sequence

`war.campaign` is both an initiative and scheduled handler.

1. Start validates a campaign base, adjacency, phase, authenticated claimant Capital gate and force
   availability. It emits the mandatory 10 Gold logistics debit; a command cannot claim that payment
   already happened. Levies must be committed in 25-troop increments.
   Defensive cause is derived from reclamation/recent aggression or a stored, actor/target/time-bound
   authorization; a command cannot assert that it is defensive.
2. The system atomically locks every levy, allied contingent and contracted band. A band or troop
   allocation cannot appear in two commitments. Every contributing lord needs a current adjacent
   base; every non-primary force needs a campaign/side/provider-bound aid authorization. Listed allied
   bases are valid only while the legal ally still physically holds that unoccupied seat.
3. Attacker and defender battlefield fortune are drawn once in the seeded session, stored on the
   campaign and copied to the scheduled item.
4. The campaign becomes public after 12 hours. The defender receives a mandatory reaction—Defend,
   Yield, or the contextual hostile-occupation withdrawal—without consuming an Order slot.
   AI Yield additionally requires a current campaign-bound assessment stored for that defending
   observer; caller-authored power or relief flags are rejected.
5. Resolution occurs after three days, or two days for a campaign created in Deathbed. Duration does
   not change retroactively. An Uncontrolled-Capital entry instead takes one full day.
6. Resolution revalidates the base and current controller. Simultaneous campaigns therefore resolve
   by scheduler `sequenceId`; a later Capital campaign fights the first victor's surviving garrison
   rather than the obsolete royal force. A changed controller invalidates and returns the prior
   reaction forces; old and new defenders are never combined, and stale Yield cannot transfer a new
   controller's seat without resistance.
7. Survivors assigned to no garrison return after one day. A campaign cancelled by loss of every base
   takes two days to return. Logistics Gold is never refunded.

Battle casualties revalidate every hereditary and Capital garrison before control benefits are
exposed. Contract expiry does the same and schedules any surviving mixed-garrison levy remainder for
its one-day return.

The registered handler emits structured `war.*` effects for Gold/political integration, Royal
sanctions, public visibility, battle reasons, casualty traces, outcomes and Prestige deltas. It never
directly mutates economy, support or observer knowledge. Resolution fallout also identifies first
dispossession viability shocks, the -12 Pledge shock for a claimant who loses the Capital, and the
`usurper`/-2 Church case only when Occupied control is actually gained.

`war.hire-mercenary` and `war.renew-mercenary` are the canonical contract handlers. They construct
only 150-troop, seven-day bands, enforce the two-band limit, emit the exact 50 Gold debit (40 for Mara
while physically holding Westmarch) or 20 Gold renewal debit, and schedule contract expiry. WP-029
must compose those debit effects atomically with WP-020's economy state. Each current contract emits
a warning one day before expiry; stale warning items from a later renewal are ignored.

## Royal Authority matrix

| Phase/cause | Capital | Campaign duration | King's Peace consequences |
|---|---|---:|---|
| Stable offense | Locked | 3 days | +15 Influence integration cost, -10 Prestige, -1 Church conduct, lawful relationship sanctions and +150 royal defender troops |
| Ailing offense | Locked | 3 days | -5 Prestige and `broke-kings-peace` history |
| Gravely Ill offense | Declared claimant only | 3 days | No flat Peace Prestige penalty; royal Capital garrison 450 |
| Deathbed offense | Declared claimant only | 2 days | No flat Peace Prestige penalty; royal Capital garrison 300 |
| Defensive cause | Phase-legal target | Phase duration | No Peace penalty and a 10-point threat-reduction fact |

An unjustified Abbeylands attack adds the canonical Church penalty in every phase. Royal Authority is
an explicit rule, not a simulated King actor.

## Battle trace and casualties

Each side resolves:

```text
baseForce = levies + mercenaries + eligible allies
effectivePower = baseForce × commander × terrain × fortification × stored fortune
```

Fortification is `1 + 0.10 × level`; fortune is stored in the inclusive `0.920–1.080` range. Exact
ties go to the defender. The winner/loser casualty rates use the canonical clamped ratio formula, are
rounded once, and are distributed proportionally with deterministic largest-remainder ordering.
Levies become permanent casualties; mercenary and temporary contingents lose troops from their
contracts. No loss can exceed its committed force and killed troops are never returned.

The preview projection lists known commander, terrain and fortification factors, the supplied exact
or banded defense estimate and the bounded fortune statement. It accepts no authoritative hidden
army state, preserving WP-023's observer-knowledge boundary.

## Occupation and dispossession

A hereditary occupation requires at least 75 eligible survivors. The garrison becomes a distinct
commitment and cannot campaign, aid, threaten as available force, or garrison another territory.

| Fact | Legal lord | Occupier |
|---|---|---|
| Legal title and Council vote | Retained | Never gained |
| Physical control | Lost | Gained while garrison remains 75+ |
| Income | 0 | 25% Wealth through WP-020's fractional hook |
| Levy recovery | 0 | 0 from occupied seat |
| Territory trait | Disabled | Not inherited |
| Politics, Claim, relationships, Gold and Orders | Retained | Unchanged except emitted fallout |

The legal lord is marked dispossessed but remains in every lord/Acclamation input query. A dispossessed
lord cannot start a campaign from the lost seat, but can lock the surviving retinue from a supplied
Pledged/Committed allied base. Liberation, voluntary withdrawal or a garrison below 75 restores legal
physical control; withdrawal troops return after one day. First dispossession emits a dedicated
history fact and the campaign result includes its one-time -8 Prestige in addition to any battle or
Yield result.

## Capital state machine

| Stable state | Controller/garrison | Benefits |
|---|---|---|
| Royal | No claimant; phase garrison 450/300 | No claimant income, tie-break or Acclamation credit |
| Occupied | Legal claimant and 200+ assigned survivors | 1 Gold/day hook, tie-break and Acclamation access |
| Uncontrolled | No controller after a pyrrhic victory or garrison collapse | No income, tie-break or Acclamation credit |

`contested` is a transient status while one or more scheduled Capital campaigns are pending; the
stable underlying state remains explicit. A victory with fewer than 200 eligible survivors sets
Uncontrolled and the defeated royal garrison to zero. A later authorized claimant may commit 200
claimant-owned, garrison-eligible troops and complete a one-day entry without battle—never instantly,
for free, or for pyrrhic battle Prestige when assignment fails. Contract/temporary-force
expiry removes troops before garrison validation; falling below 200 immediately makes the Capital
Uncontrolled and emits a reasoned history fact.

## Threat facts, leverage and Acclamation

`collectAuthoritativeMilitaryFacts` returns observer-independent facts for available strength,
offensive-war count, occupations/proximity, Capital control, recent results, treaty violations and
supplied candidacy/viability/public-support inputs. These are internal source facts. WP-023 must turn
them into observer estimates before AI or UI consumes them.

`queryMilitaryLeverage` returns a reasoned, re-runnable result for:

- an available force at an adjacent valid base meeting the target's canonical ratio;
- occupation of the target's legal seat;
- target-specific restrictions, including Edric's remaining force and Oswin's refusal to Pledge to
  military pressure.

Renard never uses the generic military-Pledge ratio. `queryRenardWithdrawalLeverage` exposes his
separate checklist: no supporters, the demanding claimant controls the Capital, and either Southmere
is occupied by any hostile force or Renard has fewer than 150 available troops.

The query derives from current state each time, so withdrawal, garrison collapse, force commitment or
loss of adjacency invalidates leverage without a stale flag. WP-021 owns Threaten costs and support
outcomes.

`militaryAcclamationChecklist` is a pure death-time query. A legal declared claimant is eligible only
when all are true:

- the claimant controls the Occupied Capital;
- the Capital commitment still contains at least 200 troops;
- the claimant physically controls at least three non-Capital seats.

It returns every check and reason and never runs Council ballots. `findMilitaryAcclamation` fails an
invariant if contradictory state somehow makes multiple claimants eligible.

## Verification

The WP-022 deterministic and hostile fixtures live under `tests/sim/war/`, `tests/sim/occupation/`
and `tests/sim/capital/`. Run:

```bash
pnpm exec vitest run --config vitest.sim.config.ts tests/sim/war tests/sim/occupation tests/sim/capital
pnpm test:sim
pnpm typecheck
pnpm wiki:check
```

The hostile suite covers early-war sanctions and forged defense evidence, Renard adjacency and his
withdrawal checklist, observer-scoped AI Yield, canonical mercenary construction/expiry, double
commitment, battle/expiry garrison collapse and return, occupation income/trait denial, legal voters
after conquest, one-time dispossession fallout, dispossessed allied basing, pyrrhic/expired Capital
control and Prestige, Uncontrolled entry timing, simultaneous Capital campaigns, military-leverage
invalidation, persistent royal casualties and reload-stable battle fortune. Balance questions such as
whether a Mara-first strategy is too attractive belong to WP-040 after multi-seed policy evidence.
