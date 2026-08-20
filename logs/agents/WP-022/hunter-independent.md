# Agent Log — WP-022 — Hunter/Independent

- **Packet:** WP-022 War, Occupation, Threat, Dispossession and the Capital
- **Role:** Independent hunter (`$hunt`)
- **Git target:** `main`
- **Starting revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283`
- **Reviewed snapshot:** uncommitted working tree observed `2026-08-20T07:53:51+05:30`
- **Status:** Findings present — not ready for integration

## Scope

Owned path:

- `logs/agents/WP-022/hunter-independent.md`

Read-only review targets:

- `src/sim/systems/{military,war,occupation,threat,capital}/**`
- `src/sim/systems/actions/military/**`
- `src/sim/projections/military/**`
- `tests/sim/{war,occupation,capital}/**`

No production code, test, canonical design, packet status or shared contract was edited. The working
tree was changing concurrently, so the reviewed production files are pinned by these SHA-256
prefixes: `campaign.ts` `7C8C0BF5A241`, `availability.ts` `18EDBA3E334B`, `state.ts`
`ECA9625420AA`, `module.ts` `7A0C8A173FDC`, `threat.ts` `19A56FB1A78B`, `capital.ts`
`DD25668D65E5`, and `occupation.ts` `AD70FC30626F`.

## Target and method

The intended pressure was attacked through the packet's thirteen named policies: obtain conquest
without casualties or sanctions, manufacture/reuse troops, absorb conquered economies, delete
political opposition, retain control with invalid garrisons, take the Capital for free, reuse one
army as universal coercion, softlock dispossessed lords, and reroll battle fortune.

Authorities read were the WP-022 packet, canonical war/game/world/balance documents, final
amendments, and the relevant paperplay war/edge-case passages. Probes used the packet fixtures and
Vite's read-only SSR module loader. Unless stated otherwise, every trace is deterministic and was
reproduced once against the pinned snapshot; the defect follows directly from a pure transition and
therefore has no seed frequency.

## Ranked findings

### P1 — Release-blocking correctness: battle casualties do not revalidate a defending garrison

`resolveCampaign` applies defender casualties and completes the campaign without calling
`revalidateHereditaryGarrisons` or `revalidateCapitalGarrison`. This violates the explicit rule that
control ends immediately below 75/200 and can decide the Crown illegally.

Exact hereditary reproduction:

1. Lock 75 Greyfen levies and call `occupyHereditarySeat(..., westmarch)`.
2. Lock 25 Edric levies from adjacent Northkeep.
3. Resolve a public `defend` campaign with both stored fortunes `1.000`.
4. Defender wins and takes 8 casualties; the garrison is 67.
5. Observed state still has `westmarch.controllerLordId === 'greyfen'` and the occupation remains.

Exact Capital reproduction:

1. Occupy the Capital for Greyfen with exactly 200 troops.
2. March Mara's legal minimum 250 from Westmarch; resolve at fortunes `1.000/1.000`.
3. Greyfen wins behind Fortification 3 and takes 36 casualties, leaving 164.
4. Observed state remains `occupied` by Greyfen and `capitalControlBenefits` still returns income,
   tie-break and Acclamation access.

Frequency: 1/1 for each exact state; deterministic. Expected counterplay is the attack itself causing
control collapse even when the attacker loses. Smallest intervention: revalidate both hereditary and
Capital garrisons after all battle casualties and before outcome benefits/effects are exposed, with
regressions for a victorious defender falling below the threshold. This is a technical correctness
bug, not tuning.

### P1 — Release-blocking correctness: caller assertions bypass King's Peace and AI Yield

`StartCampaignInput` accepts authoritative-looking booleans and power numbers from its caller:
`defensiveCause`, `defenderIsAi`, `attackerKnownExpectedPower`,
`defenderKnownExpectedPower`, and `alliedReliefAvailable`. The military transition does not derive or
authenticate them.

Exact reproduction: on a Stable Westmarch offense, pass `defensiveCause: true`. The observed
consequences are Influence 0, Prestige 0, Church 0, no relationship penalties, no royal troops, plus
the defensive threat reduction. The same campaign with `false` correctly emits +15 Influence cost,
-10 Prestige, -1 Church and +150 royal troops. For Yield, setting `defenderIsAi: false` allows a Mara
defender to take `yield` at any power ratio; setting caller-supplied expected powers can also satisfy
the 1.75 test without relation to the locked/public forces.

Frequency: 100% for the forged payload. Expected counterplay—the Stable sanctions and hard AI Yield
floor—never activates. Smallest intervention: accept a validated defensive-cause token/fact from the
authoritative war history/agreement seam, derive whether the defender is the player from authoritative
actor state, and consume a knowledge-layer estimate that cannot be authored in the command payload.
If WP-029 is intended to be that trust boundary, the raw military starter must not be exposed as a
legal command before it. This is a correctness/integration-boundary bug, not tuning.

### P1 — Release-blocking correctness: mercenary construction is unbounded and canonical hiring is absent

`addContractedForce` checks non-negative integers, expiry ordering, ownership and a two-band count,
but it does not enforce the canonical 150 troops, 50 Gold (40 for Mara while legally/physically
holding Westmarch), seven-day duration or 20-Gold renewal. No registered hire/renew initiative
charges Gold or schedules the exported expiry resolver.

Exact reproduction: `addContractedForce` accepted one `mercenary` with 10,000 troops, initial strength
10,000, renewal cost 1 and an arbitrary distant expiry. No Gold state or payment proof was consumed.
That one band can then be committed normally. Frequency: 1/1 and deterministic.

This collapses the intended Gold/casualty pressure and turns Mara-first conquest and subsequent
conquest into a manufactured-force exploit. Smallest intervention: replace the generic public
mercenary insertion path with a canonical hire transition that derives band strength, price,
discount, duration and expiry scheduling; keep a separately named, validated temporary-force path
for authored events. Charge/acknowledge Gold through the same trusted integration boundary used by
other actions. This is a technical correctness/completeness defect, not evidence that canonical
mercenary values need tuning.

### P1 — Release-blocking correctness: contract-expiry collapse can strand surviving levies forever

When a contracted garrison expires, `processMilitaryExpiry` correctly removes the band and collapses
control. `restoreLegalControl` marks any surviving levy portion `returning` for +24 hours. However,
the registered `war.contract-expiry` resolver returns no `war.return-forces` schedule.

Exact reproduction:

1. Make a Westmarch garrison from 25 Greyfen levies plus one 150-troop band.
2. Resolve its expiry at hour 168 through the registered scheduled resolver.
3. Control correctly returns to Mara; the 25 levies become a `returning` commitment due hour 192.
4. The resolver's `schedule` is absent, so those troops never release unless an unrelated later
   operation happens to schedule a return pass.

Frequency: 1/1. This is a garrison reuse/accounting failure that can also create a strategic softlock
by deleting the mobile remainder. Smallest intervention: after expiry/revalidation, schedule the
earliest return exactly as campaign and withdrawal resolution do. Add mixed levy/mercenary tests for
both hereditary and Capital collapse. Technical correctness bug.

### P1 — Major rule/effect correctness: Capital and dispossession fallout is incomplete

`campaignPrestigeDeltas` returns `{}` for `pyrrhic-capital`, despite the locked amendment granting
the victor battle Prestige. On an attacker victory over a claimant-held Capital it returns only
`{ attacker: +8 }` and omits the prior controller's canonical `-8`. Separately, a hereditary seat
change emits the ordinary major-battle defender loss but no explicit one-time dispossession `-8`
Prestige/viability-shock or the authored occupation relationship fallout. No other WP-022 effect
contains those deltas.

Exact pure-query results:

- `campaignPrestigeDeltas(capital campaign, null, 'pyrrhic-capital')` -> `{}`.
- `campaignPrestigeDeltas(Greyfen attacks Renard-held Capital, null, 'attacker-victory')` ->
  `{ greyfen: 8 }`, with no Renard entry.

The missing outputs remove political counter-pressure and can change Council results. Smallest
intervention: emit distinct battle, Capital-loss and first-dispossession fallout with idempotent
reasons so WP-029 can apply them exactly once. This is correctness/completeness, not tuning.

### P1 — Correctness: Deathbed phase transition can resurrect the royal garrison

`setMilitaryPhase` assigns 300 at Deathbed rather than capping the surviving royal garrison. Exact
reproduction: set a casualty-reduced royal garrison to 10, then transition to Deathbed; observed value
is 300. The transition can therefore manufacture 290 royal troops (and can also erase troops when the
survivor count is above 300), despite persistent battle casualties.

Frequency: 1/1. Smallest intervention: Deathbed weakening should not increase casualty-reduced
strength (`min(current, 300)` unless the canonical initialization seam proves the current value has
never been materialized). Add a failed-Gravely-assault then Deathbed regression. Technical
correctness bug.

### P1 — Pressure/counterplay correctness: military leverage applies a generic rule to Renard

`queryMilitaryLeverage` assigns Renard the default 1.25x threshold and may return credible military
leverage for a Pledge. Canonically Renard has a separate forced-withdrawal gate: no supporters,
Southmere occupied or army below 150, demanding claimant controls the Capital, and a successful
Threaten using that leverage.

Exact reproduction: give Greyfen an allied Abbeylands base and 1,000 available troops, leave Renard
at 100, and call `queryMilitaryLeverage(..., 'renard', 'pledge')`. Observed result is `credible: true`
solely because the available force meets 1.25x; Capital control and support count are absent.

This is not a balance question: the wrong authored branch is selected. Smallest intervention: refuse
generic military-Pledge leverage for Renard and expose a separate structured withdrawal checklist
requiring all canonical facts. Also ensure the WP-021 seam cannot reuse a caller-authored `valid`
assessment without a resolution-time query.

## Required hostile-scenario disposition

| Packet attack | Result on reviewed snapshot | Classification |
|---|---|---|
| Mara-first conquest every run | Starting 360 loses to Mara's expected fortified 473; one exact 150 band is not fortune-proof (worst 469.2 vs best defense 511); two bands are fortune-proof but require at least 110 Gold including logistics, above starting 70, and still incur casualties/75 lock. Canonical policy frequency remains a WP-040 simulation question. The unbounded contract constructor currently invalidates any balance conclusion. | Tuning question after P1 mercenary fix |
| Attack Renard opener | Direct Greyfen -> Southmere fails adjacency. A legal adjacent base requires prior Capital/ally position; no fixed direct opener found. | Correct |
| Casualty-free Yield | Zero casualties are intended after a valid 1.75x/no-relief AI decision, with intact dispossessed retinue and garrison cost. Caller-controlled AI/power facts currently bypass the gate. | P1 correctness |
| Mercenary snowball | Two-band assignment/reuse cap works for well-formed contracts, but arbitrary force/price/duration insertion and absent hire scheduling make unlimited effective power possible. | P1 correctness |
| Occupation economy absorption | Hook returns exactly 25% Wealth (Westmarch 0.5/day), zero legal levy recovery and no legal/occupier trait. Fractional accumulation remains a WP-020/WP-029 consumer seam. | Correct locally; integration check required |
| Delete-a-voter conquest | Legal owner/lord record survives occupation, dispossessed flag is separate, and the Acclamation fixture still contains Mara. | Correct |
| Garrison reuse/double counting | Simultaneous contracted-force reuse is rejected and assigned garrisons leave campaign availability, but battle threshold revalidation and expiry-return scheduling fail. | P1 correctness |
| Capital pyrrhic control | Attacker victory with fewer than 200 correctly becomes Uncontrolled and loses benefits. A victorious defending controller can remain Occupied at 164, and pyrrhic/prior-controller Prestige is wrong. | P1 correctness |
| Uncontrolled Capital free/instant capture | Entry requires 200 troops and resolves after 24 hours without battle; 175 is rejected. | Correct |
| Threaten everyone with one army | Starting Greyfen can reach weakened adjacent Mara but not nonadjacent Ysabel or military-immune Oswin. However the result has no reservation for available-force leverage, WP-021 accepts caller-authored leverage, and Renard uses the wrong generic threshold. | P1 Renard/boundary defect; multi-target reservation is WP-029 risk |
| Dispossessed player softlock | Greyfen retains levies and can campaign from an explicitly supplied allied base; legal identity is preserved. With no ally/resource a strategic loss is canonical, not a software softlock. Expiry can nevertheless strand a returning levy remainder. | Correct design; P1 expiry bug |
| Early King's Peace irrelevance | Correct matrix and +150 Stable royal defense exist when `defensiveCause=false`; forged `true` removes all sanctions. | P1 correctness |
| Refresh rerolling fortune | Stored attacker/defender fortune survives serialization and different time chunking; existing replay test produced byte-identical military and RNG state. | Correct |

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| `pnpm test:sim` | Pass | 30 files, 158 tests; green suite does not cover the P1 traces above |
| Vite SSR pure-state probes | Fail as hostile gate | Reproduced 67/75 seat control, 164/200 Capital benefits, forged Stable defense, 10,000-troop band, unscheduled 25-troop return, Capital Prestige omissions, royal 10 -> 300 and generic Renard leverage |
| Canonical/paperplay comparison | Fail | Findings contradict explicit Yield, garrison, pyrrhic Prestige, Capital loss, dispossession, persistent casualty, mercenary and Renard-withdrawal rules |
| Browser verification | Not run | WP-022 is an isolated headless domain; no integrated player flow exists yet |

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| Caller-provided facts are unsafe until a trusted adapter derives them | The kernel accepts JSON commands; pure state must remain authoritative | WP-029 must close the war/politics/AI/economy trust boundary |
| Do not tune Mara-first frequency now | Canonical paperplay explicitly assigns it to implementation simulation, and current mercenary construction is invalid | WP-040 only after correctness fixes and integrated policy runs |
| Treat no-allied-base dispossession as a possible strategic loss, not softlock | Canonical edge-case ruling preserves nonmilitary actions but does not guarantee comeback | No design amendment |

## Design, balance and handoff

- Canonical design changed: No.
- Balance values changed: none.
- Design-guard required: No; every confirmed issue is an implementation/effect-boundary defect.
- Tuning handoff: WP-040 should measure Mara-first conquest/support frequency and the two-band military
  route only after canonical hiring, costs, renewals, reactions and containment are integrated.
- Bugfix/implementer handoff: resolve P1 findings above and add adversarial regressions. In particular,
  a green suite must include defender-win garrison collapse, mixed-garrison expiry return, forged
  defensive/AI facts, exact mercenary construction, pyrrhic/prior-controller fallout, royal casualty
  persistence and the full Renard withdrawal checklist.
- Integration-ready: **No** on the pinned snapshot.

