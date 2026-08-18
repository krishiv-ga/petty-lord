# Pass 03 — Timing, State and UX Edge Cases

This pass attacks simultaneous events, invalid Orders, hidden information, save/load and rules that were still ambiguous after the complete runs.

## 1. Two Orders complete at the same timestamp

**Case:** Player's Expose Secret and Renard's Request Declaration both complete at dawn. The exposure would make the target refuse Renard.

**Hole:** The phase-level priority order did not specify ordering inside the same class.

**Severity:** RED

**Amendment:** Every scheduled item receives a monotonically increasing `sequenceId` when created. Resolve by:

1. due time;
2. event priority class;
3. lower sequenceId.

Earlier-started work therefore resolves first. Exact ties never depend on object iteration order.

## 2. Leaning crosses into a harder phase

**Case:** Ysabel begins Leaning one day before Gravely Ill. The Ailing maturation rule is two days; Gravely requires three.

**Hole:** The player could start a Leaning just before a phase transition and use the easier old requirement.

**Severity:** YELLOW

**Amendment:** Request Declaration uses the current phase's maturation requirement. Time already spent Leaning counts, but the higher current requirement applies. Deathbed therefore always requires four total days unless a shared-risk trigger waives maturation.

## 3. Offer Bargain charges collateral before acceptance

**Case:** Player begins Ysabel's 80-Gold escrow negotiation. During the two-day Order, Ysabel becomes Committed to Renard.

**Hole:** If collateral were paid at Order start, the player could lose 80 Gold to a bargain the target can no longer accept.

**Severity:** RED

**Amendment:** Offer Bargain pays only its 8 Influence negotiation cost at start. Collateral, policy concessions, troop locks and office reservation apply at resolution only if the target accepts. If the target becomes unavailable, Influence is lost but collateral is untouched.

## 4. Request Declaration target stops Leaning mid-Order

**Case:** The player starts the request; Renard wins a major battle before it completes.

**Amendment:** Revalidate at resolution.

- If the target still Leans and all gates pass: Pledge.
- If Leaning was lost through external events: fail, -2 relationship, no seven-day refusal cooldown.
- If the request was premature when started: normal -4 and cooldown.

This distinguishes bad timing from player spam.

## 5. Threat leverage disappears during the threat

**Case:** Player begins threatening Ysabel with superior force; those mercenaries leave before resolution.

**Amendment:** Credible leverage must exist both at start and resolution. If it disappears, Threaten fails, costs remain spent and the target relationship penalty still applies.

## 6. Blackmail secret can be used repeatedly

**Case:** Threaten Ysabel with Embezzlement every phase without exposing it.

**Hole:** A single secret could generate unlimited concessions.

**Severity:** YELLOW

**Amendment:** A secret can create one successful private blackmail agreement. It gains `usedAsBlackmail=true`. The holder may still expose it later, but cannot use it for another Threaten success.

## 7. Pledged lord is courted as though unaligned

**Case:** Ysabel is Pledged to Renard. Player offers escrow and immediately starts normal defection maturation.

**Hole:** Existing Pledge inertia could be bypassed through a new bargain.

**Severity:** RED

**Amendment:** A voluntary defection negotiation is available only when at least one is true:

- current Pledge has accumulated at least half the phase's break-shock requirement;
- current Pledge basis is Opportunism and the challenger leads Viability by at least 10;
- challenger has valid coercive leverage;
- current candidate violated a known agreement or Red Line.

A valid Commitment cannot be replaced by voluntary bargaining or ordinary coercion. If a defection bargain succeeds, the old Pledge breaks publicly first, then the lord becomes Leaning toward the challenger and must mature normally.

## 8. Mercenary contract expires on death dawn

**Case:** Capital has exactly 200 troops, 100 of whom are unpaid mercenaries expiring that dawn.

**Result:** Timed condition/contract expiry occurs before death check. Mercenaries leave, the garrison drops below 200 and Capital control ends before succession.

**Severity:** GREEN

This is fair because the player receives a renewal warning one day earlier.

## 9. Pyrrhic victory at the Capital

**Case:** Player defeats the royal guard but has only 170 survivors, below the 200 hold requirement.

**Hole:** The original rule returned control to the royal administration even though its garrison had just been defeated.

**Severity:** YELLOW

**Amendment:** The Capital becomes **Uncontrolled**.

- no claimant receives income or tie-break;
- royal garrison is zero;
- a later claimant may complete a one-day March and occupy it by assigning 200 troops, without another battle;
- the original victor gains battle Prestige but not Usurper/Capital-control benefits.

## 10. Two claimants attack the Capital simultaneously

**Case:** Player and Renard campaigns complete at the same dawn.

**Result after sequenceId rule:** The earlier-created campaign resolves first. The later campaign revalidates against the resulting controller or Uncontrolled state. The later attacker receives any documented withdrawal reaction before resolution if the target fundamentally changed.

**Severity:** GREEN after Test 1 amendment.

## 11. Fractional occupation income disappears

**Case:** Occupying Westmarch yields 25% of Wealth 2 = 0.5 Gold/day. Integer flooring would give zero forever.

**Hole:** Occupation value and economic modifiers could vanish or combine incorrectly.

**Severity:** YELLOW

**Amendment:** Gold income and levy recovery use fractional accumulators.

- Add the fractional amount daily.
- Convert whole units into spendable Gold/available levies when the accumulator crosses 1.
- UI top bar shows whole spendable units; territory tooltip shows exact projected daily rate.

No per-day minimum is applied to levy recovery. This also makes Charter + Tax Strain stack correctly.

## 12. Merchant Loan becomes free money near death

**Case:** Loan event appears on elapsed Day 46; repayment is due 14 days later, after the game ends.

**Severity:** RED

**Amendment:** Merchant Loan is eligible only during Stable or Ailing and no later than elapsed Day 27. Its 14-day due date therefore always precedes the earliest possible death.

## 13. Fraud repair event never appears

**Result:** Already solved by contextual Confess and Seek Penance. Event E14 remains an optional cheaper pre-exposure choice.

**Severity:** GREEN after Pass 01 amendment.

## 14. Funeral Council choice leaks every hidden system

**Case:** E16 refreshes every private Leaning and accidentally reveals all future intentions.

**Amendment:** “Demand a Great Council be ready” reveals the current Leaning of every unpledged lord at that moment only. It reveals no Intent, bargain, secret or future decision. The observation is timestamped and can become stale normally.

## 15. Succession forecast uses true AI state

**Case:** UI predicts Ysabel's vote despite the player having no intelligence.

**Severity:** RED UX/information breach

**Amendment:** Forecast receives a player-knowledge projection, never authoritative hidden state. Automated tests compare the forecast input against the player's knowledge set and fail if unknown Leanings or secrets are accessed.

## 16. Find Dirt stats change after Order begins

**Case:** Player spends Influence after starting Find Dirt, lowering the resolution formula.

**Amendment:** Spy power, target defense and seeded factor snapshot at Order creation. Later resource changes do not alter the check.

## 17. Repeated Spy anti-spam destroys discovery odds

**Result:** Already amended: repeat pressure increases detection risk, not target defense. Exact success check remains unchanged.

## 18. One candidate remains

**Case:** Player forces Renard to withdraw; Edric never declared.

**Hole:** The Council procedure assumed at least two candidates.

**Severity:** RED

**Amendment:** If exactly one eligible candidate remains, all six lords cast a required acclamation vote for that candidate; there is no abstention and the candidate is crowned 6–0. Reaching sole-candidate state already requires extreme political/military dominance.

Zero eligible candidates cannot occur because Renard can withdraw only in response to another declared claimant.

## 19. Edric declares while Under Duress

**Result:** Already amended: any valid Pledge blocks declaration. Once coercive leverage disappears and the Pledge releases, Edric may check candidacy at the next dawn.

## 20. Commitment is overridden by coercion

**Case:** Mara is Committed to the player; Renard occupies Westmarch and Threatens her into voting Renard.

**Hole:** Under ordinary rules, occupation is credible leverage.

**Severity:** YELLOW

**Amendment:** A valid Commitment cannot be replaced by an Under Duress Pledge. Coercion can force non-vote concessions or create a Commitment-breaking political shock, but the support changes only if the authored Commitment breaker/Red Line activates.

## 21. Unique office means globally unique

**Result:** Clarified as per-candidate prospective government. Store office reservations under candidate ID.

## 22. Legal lord has no base after Yield

**Case:** Ysabel yields Eastvale but retains 240 levies. Where are they?

**Amendment:** Yielding levies become a mobile dispossessed retinue. They remain unavailable for campaigns until Ysabel gains allied basing rights, but they can defend the ally's seat if a specific protection agreement permits. They still count when judging whether occupation-based coercion is stable only if physically based adjacent to Eastvale.

## 23. AI yields too readily

**Result:** Yield threshold fixed at 1.75× known effective power and no allied relief. Personal courage can increase the threshold; it cannot lower it below 1.75 for AI.

## 24. Garrison control and coerced vote on the same dawn

**Case:** Westmarch mercenary garrison expires, breaking occupation and Mara coercion on the King's death dawn.

**Result:** Contract expiry → control recalculation → coercion validation → Church/support updates → death. Mara's coerced vote breaks before the ballot.

**Severity:** GREEN once explicit resolution ordering is implemented.

## 25. Phase transition and Order duration

**Case:** A three-day diplomatic Order begins one hour before Deathbed. Does it shorten retroactively?

**Amendment:** Duration is fixed at Order creation. Deathbed's one-day reduction applies only to Orders started in Deathbed. Existing Orders keep their scheduled completion.

## 26. Long scheme begins one hour before Deathbed

**Result:** Legal. It may finish after Deathbed begins because only starting new long schemes is locked. The player took the timing risk.

## 27. Player loses all Gold while dispossessed

**Case:** No income, no allied base, no Gold for schemes.

**Result:** The player can still gain passive Influence, use no-Gold political reactions, break agreements, request support where conditions already exist and vote. This can become a strategically lost run without becoming a software softlock.

**Severity:** GREEN

The game is not required to guarantee a comeback from every failed position.

## 28. Player never declares

**Result:** At death the player is not eligible. Renard/Edric succession resolves normally and the loss report states that the player never entered the contest.

## 29. Ambient event and death on same dawn

**Result:** Death check occurs before ambient event selection. The event does not appear. Mandatory decisions already pending would have paused the clock before reaching the dawn.

## 30. Save with queued mandatory decisions

**Amendment:** Save serializes the full decision queue and current priority. On load, the game resumes paused with the same top decision. Choices and random outcomes are already stored.

## 31. Browser tab backgrounding at 2×

**Result:** Visibility change auto-pauses before additional scheduler advancement. Returning to the tab does not simulate elapsed wall-clock time.

## 32. Secret consequences are still examples, not rules

**Hole:** World design named secrets but did not specify exact mechanical consequences for each.

**Severity:** RED for implementation clarity

**Amendment:** Add a canonical secret-consequence table to `balance-sheet.md`, including Claim, Prestige, Church, relationship and support-shock effects.

## 33. Order collateral and cancellation

**Case:** Player cancels an accepted Border Aid bargain by cancelling the associated troop lock.

**Amendment:** Once collateral is accepted, it is an Agreement obligation, not a cancellable Order. Breaking it uses Break Agreement, applies full breach consequences and can trigger a Red Line.

## 34. Capital becomes Uncontrolled one hour before death

**Result:** No Capital tie-break and no Military Acclamation. Council proceeds. This is harsh but fully visible through the map, forecast and garrison warning.

## Pass conclusion

The edge-case pass produced several important rule closures:

- deterministic same-time sequencing;
- phase-aware Leaning maturation;
- collateral only on accepted bargain;
- defection gates for already-Pledged lords;
- one-use blackmail;
- Uncontrolled Capital state;
- fractional economy/recovery accumulators;
- early-only loan event;
- knowledge-safe forecast;
- sole-candidate acclamation;
- Commitment protection from ordinary coercion;
- exact secret consequences.

None expands the strategic scope. Most reduce implementation ambiguity and prevent the UI or scheduler from becoming the source of exploits.