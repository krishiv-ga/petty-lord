# Agent Log — WP-022 — Critic/Independent

- **Packet:** WP-022 War, Occupation, Threat, Dispossession and the Capital
- **Role:** Critic
- **Git target:** `main`
- **Starting revision:** `e98954dfb3a8fbd48b6efbfb1dc181b153b14283`
- **Ending revision:** `219b32f262e9d4744af102096422a83eda048c05` (remediation reviewed)
- **Status:** Needs fixes

## Scope

Read-only review targets:

- `src/sim/systems/{military,war,occupation,threat,capital}/**`
- `src/sim/systems/actions/military/**`
- `src/sim/projections/military/**`
- `tests/sim/{war,occupation,capital}/**`
- `wiki-site/game-systems/war-and-occupation.md`
- WP-022 implementer and hunter evidence

Owned write path:

- `logs/agents/WP-022/critic-independent.md`

Explicitly out of scope:

- Concurrent WP-020, WP-021 and WP-023 files and their transient shared-main failures
- Production/test remediation; the implementer owns every fix and regression
- Economy, politics, knowledge or AI implementation except where WP-022 exposes their integration
  trust boundary

## Work performed

- Read the repository authority chain, WP-022, every named canonical war/game/world/balance input,
  final paperplay amendments, the relevant final edge/consistency passes, technical/skill/wiki
  authority, the latest compacted Wave 1 log and the `$critic` workflow.
- Verified the packet was legal after WP-019 and confined the reviewed diff to
  `e98954d..ee1d9b3`; every changed production/test/wiki/log path belongs to WP-022.
- Inspected all 28 changed files rather than relying on the implementer or hunter narratives.
- Attacked force ownership and basing, same-time controller changes, occupation replacement, failed
  Uncontrolled-Capital entry, candidacy authentication, Capital battle fallout and Renard's exact
  withdrawal constitution with disposable Vite SSR probes. No probe file was added to the repository.
- Re-ran the full current simulation suite and TypeScript gate. The existing green tests do not cover
  the reproduced hostile failures below.

## Decisions and assumptions

| Decision/assumption | Reason/evidence | Downstream impact |
|---|---|---|
| Treat arbitrary allied force selection and caller-authored candidacy as trust-boundary defects, not merely WP-029 wiring | `war.campaign` is a registered command handler and currently accepts those assertions as authority; the packet explicitly forbids AI extra resources and requires exact Capital gates | WP-022 must expose authenticated/derived inputs that WP-029 can safely compose |
| Treat a later simultaneous campaign as hostile to the current controller, never as permission to combine old and new defenders | Canonical invalidation says the later campaign revalidates against the new controller and gets the documented withdrawal reaction | Stale defender locks must be released or separately resolved before battle |
| Distinguish a battle-created pyrrhic Capital from a failed unopposed entry | Final amendments grant battle Prestige to the force that defeated a garrison; an entrant that assigns no legal garrison won no battle | Prevents repeatable no-casualty Prestige generation while preserving canonical pyrrhic battles |
| Read “Southmere occupied” literally, independent of the demanding claimant | `world-and-actors.md` requires only that Southmere is occupied; Capital control belongs to the demanding claimant as a separate gate | The query and wiki currently narrow the constitution without authority |

## Critic findings and resolution

| Severity | Finding | Reproduction/evidence and expected behavior | Resolution/status |
|---|---|---|---|
| P1 | Campaign requests can seize arbitrary lords' troops, teleport them from unrelated bases, and retain an allied base after enemy occupation | `campaign.ts:180-185` validates only that the first request is the attacker; `availability.ts:184-243` accepts every later lord if that lord has any listed base, with no aid/agreement authorization and no target adjacency. A probe started Greyfen → Westmarch with Greyfen 25 plus **Ysabel 225 from nonadjacent Eastvale**; both commitments were accepted and Ysabel fell from 240 to 15. Separately, `state.ts:162-175` returned `hasCampaignBase=true` for Greyfen's listed Abbeylands right after Mara occupied Abbeylands, and a Greyfen campaign started there. This violates eligible promised allies, current unoccupied allied bases, no AI extra hands and no instant teleport. | **Unresolved.** Require campaign-bound aid/basing authorization, validate every contributing base against current physical control and target travel/adjacency, and revalidate those facts at resolution. Add hostile attacker/defender aid and occupied-base regressions. |
| P1 | A simultaneous controller change reuses an obsolete defender reaction and can strand the former occupier's garrison | `campaign.ts:665-681` unions the campaign's stored defender commitments with the current garrison without checking ownership. Two same-time attacks on Westmarch reproduced this: Greyfen resolved first and became controller with a 75 garrison; Edric's later campaign still carried Mara's 200-troop reaction, then fought a fabricated **275-troop combined Mara+Greyfen defense** under Greyfen's commander while its stored defender remained Mara. A second probe had Greyfen's occupying defender Yield to Edric; `campaign.ts:632-643` overwrote the occupation without liberating it, leaving Greyfen's old 75 troops permanently classified as `occupation-garrison`, referenced by no territory and never returning. Expected behavior is revalidation against the new controller, release of obsolete defender locks, the documented withdrawal reaction, and never combining mutually hostile forces. | **Unresolved.** On controller change, invalidate/release the old reaction and rebuild defense solely from the current controller; cancel if the attacker now owns the target. End/return an existing occupation before every transfer, including Yield. Add same-time hostile-controller, attacker-now-controller and third-party Yield regressions. |
| P1 | A failed unopposed Capital entry receives repeatable pyrrhic battle Prestige | The Uncontrolled gate in `campaign.ts:191-195` counts all committed troops, not 200 garrison-eligible troops. The Uncontrolled resolver at `campaign.ts:576-596` maps failed assignment to `pyrrhic-capital`, and `campaignPrestigeDeltas` awards +8. A probe committed 200 Greyfen troops with `garrisonEligible:false`: after one day it produced no battle, left the Capital Uncontrolled and emitted `{greyfen: 8}`. After the intact force returns, another campaign can repeat the same result for another +8 and no casualties. Canonical pyrrhic Prestige belongs to an actual victory over a garrison; later entry requires assigning 200. | **Unresolved.** Require 200 claimant-owned, garrison-eligible troops before starting/finishing an Uncontrolled entry, or cancel a failed entry without battle Prestige. Keep `pyrrhic-capital` only for an actual battle victory and add a repeated-entry regression. |
| P1 | The Capital declared-claimant gate is still a caller assertion | `StartCampaignInput.declaredClaimant` (`campaign.ts:25-35`) and the registered parser (`module.ts:83-84`) trust a boolean. The war state has no authoritative candidacy fact or authorization. The same unchanged state rejected `false` and accepted `true`, starting `forged-true` against the Capital. This is the same class of bypass already repaired for defensive cause and AI Yield. | **Unresolved.** Replace the boolean with a trusted politics-owned/campaign-bound authorization or derive candidacy through the composed authoritative state. Add a raw-command forgery regression. |
| P1 | Capital defender victories emit the wrong Prestige deltas | `campaignPrestigeDeltas` special-cases every Capital defender victory as attacker `-8` and omits the defender (`campaign.ts:449-466`). A canonical Royal-Capital assault with 250 troops resolved as a major defender victory but returned `{greyfen:-8}`. A failed attacker should take the major-attacker loss `-6`; a claimant defender should also receive the major victory `+8`. The separate `-8 Capital loss` applies to a prior claimant who actually loses control (and should net against any same-battle victory if its surviving garrison collapses), not every failed attacker. These outputs can directly alter Council results. | **Unresolved.** Compute normal major/minor battle Prestige first, then layer Capital acquisition/loss deltas from before/after control. Cover Royal defense, claimant defense, defender-win garrison collapse and attacker victory. |
| P2 | Renard's withdrawal query incorrectly requires the demanding claimant to occupy Southmere | `threat.ts:210-216` defines `southmereOccupied` as `occupation.occupierId === candidateId`, and the wiki repeats that narrower rule. Canonical `world-and-actors.md` requires: Renard zero supporters; **Southmere occupied or Renard below 150**; demanding claimant controls Capital. A probe with Greyfen occupying Southmere, Edric controlling the Capital, Renard at 450 and zero supporters returned `credible:false`; canonically Edric's demand has all gates. | **Unresolved.** Test whether Southmere has any hostile occupation, keep demanding-claimant Capital control separate, and synchronize the wiki/regression. |

No P0 was found. All six findings are deterministic correctness/contract defects; none requires a
canonical design amendment or balance change.

## Acceptance tests independently verified

- **Pass:** Stored battle fortune, winner, casualties, RNG state and military state are byte-identical
  through save/reload and alternate time chunking.
- **Partial:** The numeric Stable/Ailing/Gravely Ill/Deathbed sanctions and persistent royal-casualty
  cap match design; the raw Capital candidacy assertion and invalid bases still bypass legality.
- **Partial:** Defender reactions pause outside two Order slots and AI Yield requires a current
  observer assessment; arbitrary allies and stale reactions violate the defender-flow contract.
- **Pass:** Ordinary battle formulas, exact-tie defender rule, persistent proportional casualties,
  garrison-ineligible sub-threshold hereditary victory, and post-battle/expiry threshold collapse
  match the authored rules.
- **Partial:** Occupation preserves legal title/voter state, locks 75, exposes 25% income/no recovery/
  no trait and supports withdrawal; third-party Yield can orphan the prior garrison.
- **Partial:** Royal/Occupied/Uncontrolled states and benefit revocation work in the covered ordinary
  cases; failed unopposed entry and simultaneous controller changes are exploitable.
- **Partial:** Current-state occupation leverage invalidates on withdrawal and generic Renard Pledge
  leverage is blocked; occupied allied bases and the exact Renard withdrawal constitution are wrong.
- **Pass:** Military Acclamation requires declaration, an Occupied Capital, 200 Capital troops and
  three non-Capital seats; contradictory multiple eligible claimants fail an invariant.
- **Pass:** The observer preview receives only explicit exact/band/unknown knowledge and never reads
  authoritative hidden force or fortune.
- **Fail:** The hostile correctness gate requires no P0/P1 exploit. Five P1 defects remain.

## Validation

| Command/check | Result | Evidence/notes |
|---|---|---|
| Diff/ownership audit `e98954d..ee1d9b3` | Pass | 28 files, all inside WP-022 owned production/test/wiki/log paths; concurrent WP-020/021/023 files excluded |
| `pnpm test:sim -- <WP-022 files>` | Pass but insufficient | Current shared-main run executed 30 files / 181 tests; every existing WP-022 test passed while the disposable hostile probes still reproduced |
| `pnpm typecheck` | Pass | No TypeScript diagnostic on the current shared-main snapshot |
| Vite SSR arbitrary-allies/occupied-base probes | Fail hostile gate | Accepted Ysabel 225 into Greyfen's remote attack; accepted enemy-occupied Abbeylands as Greyfen base |
| Vite SSR simultaneous-controller/Yield-transfer probes | Fail hostile gate | Combined Mara 200 + Greyfen 75 as one defense; orphaned Greyfen's old 75 garrison after Yield transfer |
| Vite SSR Uncontrolled-entry probe | Fail hostile gate | No battle, no control, +8 Prestige with 200 ineligible troops |
| Vite SSR candidacy/Capital-Prestige probes | Fail hostile gate | Caller `true` opened Capital; Royal defender victory emitted attacker -8 instead of major-loss -6 |
| Vite SSR Renard constitution probe | Fail | Third-party Southmere occupation did not satisfy the authored gate |
| Browser/build verification | Not run | WP-022 is headless and no integrated military UI exists; typecheck and deterministic target tests are the relevant local gates |

## Design, balance, or schema impact

- Canonical design changed: No
- Design amendment: none required
- Balance values changed: none
- Save/schema impact: no shared schema change reviewed; the JSON-compatible war state round-trips, but
  WP-029 still needs composed save validation for trusted politics/knowledge authorizations
- Wiki impact: the implemented page is materially inaccurate about safe simultaneous revalidation,
  valid allied bases and Renard's Southmere gate until findings are fixed

## Risks and deferred work

- Canonical mercenary size, two-band cap, 50/40 initial price, 20 renewal, seven-day expiry, one-day
  warning, expiry-before-control validation and mixed-garrison return scheduling are locally correct.
  WP-029 must apply the emitted Gold debits atomically with WP-020; until then the isolated handler
  does not itself prove affordability.
- AI Yield no longer accepts raw command power/relief fields, and defensive cause no longer accepts a
  raw boolean. WP-029/WP-023 must be the sole producers of the stored authorization/assessment facts
  and must not expose their constructors to player commands.
- The military public resolver queues a generic mandatory defender decision for AI and player alike.
  WP-029/WP-023 must route AI-owned reactions deterministically before the UI can present them to the
  player; the current campaign tests deliberately choose Mara's reaction through the generic command.
- Mara-first conquest frequency remains a WP-040 tuning question only after the correctness findings
  and atomic resource integration are closed.

## Integration notes

- Shared contracts touched: none
- Reconciliation/order constraints on `main`: WP-029 must consume military Gold/politics/knowledge
  effects once, but it must not be used to paper over unsafe public WP-022 inputs or stale troop state
- Follow-up packets: WP-022 remediation, then WP-029; WP-040 only for measured balance
- Integration-ready: **No**

## Final verdict — initial review

**Needs fixes.** The ordinary battle, garrison, expiry, observer-preview and Acclamation paths are
substantially implemented and deterministic, but five P1 correctness exploits remain: unauthorized
and remote allied forces/bases, stale simultaneous defenders and orphaned garrisons, repeatable
failed-entry Capital Prestige, caller-forged candidacy, and incorrect Capital battle Prestige. The
Renard withdrawal query also contradicts the locked constitution. WP-022 must remediate and rerun the
hostile suite before it is safe for WP-029 integration.

## Follow-up independent review — remediation `219b32f`

The follow-up review inspected the actual remediation commit rather than the accumulated Wave 2
range. Commit `219b32f262e9d4744af102096422a83eda048c05` changes only WP-022-owned production,
tests, wiki and logs. Current `main` was `08061d1ce17c209096b1077901338e09bd821ac4` while the
checks ran; an exact path comparison showed no change to any WP-022 production/test/wiki file after
`219b32f`, so every probe below is pinned to the remediation.

### Original finding disposition

| Severity | Original finding | Follow-up reproduction and disposition |
|---|---|---|
| P1 | Arbitrary/remote allied forces and enemy-occupied allied bases | **Fixed and verified.** Unauthorized adjacent aid now needs a campaign/side/provider/beneficiary authorization; a remote authorized Eastvale force is rejected for adjacency; an enemy-occupied allied seat returns `hasCampaignBase=false`. Stored aid and each provider base are checked again at resolution, with invalid contingents returned. |
| P1 | Stale simultaneous defenders and orphaned prior garrisons | **Fixed and verified.** The original two-campaign probe now fights only the current Greyfen 75-troop garrison, not Mara's stale 200; both stale Mara troops and the displaced Greyfen garrison become `returning`, and Edric becomes controller. A third-party Yield transfer returns the old 75 garrison. An additional same-attacker campaign cancels with no battle once its attacker already controls the target. |
| P1 | Failed Uncontrolled entry farms +8 Prestige | **Fixed and verified.** Start rejects 200 troops with `garrisonEligible:false`; resolution independently rechecks 200 claimant-owned eligible troops. Failed assignment maps to cancellation, not `pyrrhic-capital`. |
| P1 | Caller-forged `declaredClaimant` | **Fixed and verified.** The boolean was removed from `StartCampaignInput`; raw `true` is ignored and a current campaign/claimant-bound authorization is mandatory. The original unchanged war state now rejects the forged command. |
| P1 | Capital defender-victory Prestige | **Fixed and verified.** A 250-troop Royal assault resolves as a major defender victory with `{greyfen:-6}`. Claimant attack/victory and defender-win garrison-collapse regressions correctly layer ordinary battle Prestige and the separate -8 Capital-control loss. |
| P2 | Renard required the demanding claimant to occupy Southmere | **Fixed and verified.** With Greyfen occupying Southmere, Edric controlling the Capital, Renard at 450 and zero supporters, Edric's withdrawal query now returns `credible:true`; the wiki uses the canonical any-hostile-occupation rule. |

### New findings on the remediation

| Severity | Finding | Reproduction/evidence and expected behavior | Resolution/status |
|---|---|---|---|
| P1 | A Capital campaign does not revalidate the 250-troop attack minimum after allied aid becomes invalid | Start correctly accepted Greyfen 25 + authorized Edric 225. Edric's campaign-bound authorization expired before hour 72; `activeCampaignCommitments` returned Edric's 225, but `campaign.ts:792-795` continued directly to battle without repeating the `capitalMinimum` check from `campaign.ts:274-277`. The result was a 25-troop assault on the Royal Capital with `defender-victory`, rather than an explicit invalidation/cancellation. The packet and core Order rule require resolution-time revalidation when available force changes; the Capital gate is 250 until Uncontrolled. | **Unresolved.** After active attacker contingents are rebuilt, revalidate 250 troops for Royal/Occupied Capital and 200 claimant-owned eligible troops for Uncontrolled. Cancel, return survivors and emit the exact reason before any battle. Add expired authorization and lost aid-base Capital regressions. |
| P1 | Expiry of a mercenary-only primary campaign force throws from the scheduled battle resolver | A canonical Greyfen band was hired at hour 0, used as the sole force in a campaign started at hour 120, expired at hour 168 and was removed from its commitment by `availability.ts:153-174`. At hour 192, `activeCampaignCommitments` produced no active attacker allocations, but `resolveCampaign` reached `resolveBattle` (`campaign.ts:912`), which threw `battle requires non-zero forces on both sides` (`battle.ts:53`). A scheduled resolver failure can prevent time advancement instead of producing the required invalidation/fallback. | **Unresolved.** If active attacker force is zero after expiry/revalidation, cancel deterministically and return/release all surviving commitments before battle. Add a kernel-level contract-expiry-before-resolution regression proving the scheduled campaign completes/cancels without an engine error. |

Both new findings have the same missing post-filter force gate, but they are recorded separately because
one produces an illegal Capital battle and the other produces a scheduled-resolution failure/softlock.
No new P0, design defect or balance issue was found.

### Follow-up acceptance and validation

- The six original critic findings now pass their exact hostile reproductions.
- Attacker-now-controller cancellation passes and returns every later commitment without battle.
- Resolution-time expiration/loss of a non-primary aid authorization or provider base is detected;
  the aid commitment returns and a sub-garrison hereditary attempt cancels normally.
- Resolution-time Capital minimum and zero-primary-force invalidation still fail as described above.
- Battle formula/casualties, post-battle/expiry garrison collapse, ordinary occupation/withdrawal,
  observer-safe preview, deterministic reload/fortune and Acclamation remain green.
- Because the packet requires no P0/P1 hostile correctness exploit, WP-022 still fails its hostile
  acceptance gate despite the expanded maintained suite being green.

| Command/check | Follow-up result | Evidence/notes |
|---|---|---|
| Actual remediation diff audit | Pass | `git show 219b32f` touches 12 WP-022-owned files; current WP-022 paths are byte-identical to that commit |
| `pnpm test:sim` | Pass but insufficient | 30 files / 197 tests; no maintained test covers zero attacker force after contract expiry or post-aid Capital minimum |
| `pnpm test` | Pass | 8 files / 46 tests |
| `pnpm typecheck` | Pass | `tsc -b` completed without diagnostics |
| `pnpm wiki:check` | Pass | VitePress client/server build and page rendering completed |
| Six original Vite SSR probes | Pass | Aid/base, stale controller/Yield, failed entry, candidacy, Capital Prestige and Renard all match canon |
| Attacker-now-controller probe | Pass | Later same-attacker campaign cancelled; no battle; commitment returning |
| Aid expiry/provider-base-loss hereditary probes | Pass | Invalid Edric aid returned; campaign cancelled without occupation |
| Aid-expiry Capital probe | **Fail** | Continued with 25 attackers after authorized 225 returned |
| Mercenary-expiry campaign probe | **Fail** | Threw `battle requires non-zero forces on both sides` at scheduled resolution |

### Follow-up design, schema and integration impact

- Canonical design changed: No
- Design amendment: none
- Balance values changed: none
- Save/schema impact: authorization records extend the JSON-compatible war payload without changing
  the frozen shared schema; WP-029 remains responsible for composed validation/production
- Wiki impact: the updated page is correct for the six original findings, but its broad statement
  that force availability is revalidated is not yet true for the two post-filter cases
- Integration-ready: **No**

### Final follow-up verdict

**Needs fixes.** Remediation `219b32f` clears every original critic finding, including the requested
attacker-now-controller and current aid/base checks. It is not yet safe for integration because
resolution-time force filtering can still (1) bypass the canonical 250-troop Capital gate after aid
expiry and (2) crash a campaign whose sole mercenary force expires before battle. Close both with
kernel-level regressions, rerun the hostile/full gates, and request one final focused critic recheck.
