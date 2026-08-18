# Pass 04 — Final Consistency Attack

This pass rereads the amended canonical package as an implementer and an adversarial player. It targets remaining ambiguities rather than adding features.

## 1. The player has no defined Council vote after elimination

**Attack:** Never Declare, or enter a three-candidate ballot and get eliminated. Greyfen remains one of the six legal voters, but the rules only explain how AI lords choose between remaining candidates.

**Severity:** RED

**Amendment:** If the player is not an eligible remaining candidate and Greyfen's vote is not otherwise forced, succession pauses for a mandatory **Cast Greyfen's Vote** decision. The player selects one remaining candidate. This cannot restore the player's candidacy or convert the loss into a win; it only determines the historical victor. With one remaining candidate the vote is forced.

## 2. Threat calculation can make AI omniscient

**Attack:** Hide exact levies from Edric while the internal threat formula compares the player's true available army with Edric's exact defense.

**Severity:** RED information breach

**Amendment:** Each observer calculates military threat from their own knowledge projection:

- fresh Spy/direct campaign observation: exact known force;
- public army band: use the band's midpoint;
- stale intelligence: blend last observation halfway toward current public-band midpoint;
- own defense: exact.

AI Yield also uses expected effective power excluding hidden battle fortune. Fortune is never known before battle.

## 3. Public coercion and secret blackmail were conflated

**Attack:** Blackmail two lords privately while the UI labels both publicly Under Duress and the Church automatically knows what happened—or, conversely, gain Church Endorsement despite two publicly terrorized houses because the code only checks a hidden basis.

**Severity:** RED

**Amendment:**

- Military/occupation Threaten is public. Pledge displays **Under Duress** to everyone and counts toward the Church's public-coercion block.
- Secret blackmail is private. Publicly it appears as a normal Pledge; coercion basis is known only to the parties and anyone who later discovers the blackmail agreement.
- Church and rival reactions use known coercion, not omniscient truth.
- At death the blackmailed vote remains bound if the secret remains unexposed and leverage is valid.
- Exposing the blackmail secret removes that leverage immediately and releases the coerced Pledge unless another basis supports it.

Private blackmail can therefore fool institutions, but requires rare secrets and remains fragile.

## 4. Loan default is profitable free money

**Attack:** Borrow 80 Gold, spend it on a route that does not need Ysabel, then deliberately default for only Prestige and relationship loss.

**Severity:** RED

**Amendment:** At the 14-day due date, a mandatory decision occurs.

- **Repay:** pay 105 Gold.
- **Default:** current spendable Gold is seized down to zero, -12 Prestige, -25 Ysabel relationship, Greyfen income ×0.50 for the rest of the run, public Defaulted Debtor flag, and Ysabel receives one Debt Leverage use equivalent to devastating blackmail.

If the player lacks 105 Gold, only Default is available. The loan remains useful emergency liquidity but cannot be taken as an unpriced grant.

## 5. “One tier harder” is not implementable

**Attack:** Choose political access in the Merchant Loan event and ask Codex what one collateral tier means.

**Severity:** YELLOW

**Amendment:** Record `YsabelAccessDebt`:

- Escrow demand: 80 → 100 Gold.
- Chancellorship court budget: 40 → 60 Gold.
- Protection demand: 100 → 150 troops.

The flag is consumed when one of these accepted bargains applies.

## 6. Pledge shock never expires

**Attack:** Inflict a minor defeat in Ailing, wait three weeks, then use an unrelated tiny shock to break a Deathbed Pledge because the old shock remained forever.

**Severity:** YELLOW

**Amendment:** Numeric Pledge shocks are timestamped and expire after 10 full days. Automatic breakers, active Red Lines, agreement breaches and persistent public conditions do not expire while their cause remains. Reaffirming a Pledge through fulfilled shared risk clears expired entries but not active breaches.

## 7. Candidate preference still leaves Codex to invent half the politics

**Attack:** Implement the generic component ranges but choose arbitrary Desire, Fear and Legitimacy values. Different implementations produce completely different games while each claims to follow the design.

**Severity:** RED design incompleteness

**Amendment:** Add `candidate-evaluation.md` with exact component tables for Edric, Ysabel, Oswin, Mara and eliminated Renard, plus deterministic reason ordering.

## 8. Hold Court and Patronage relationship effects are unspecified

**Severity:** YELLOW

**Amendment:**

- First Hold Court: +6 relationship to each invited lord; diminished second Court +3.
- First Patronize Church: +8 Oswin relationship; later valid repetition +3.
- Abbey Endowment acceptance grants the same +8 Oswin relationship and Patronage flag but does not stack with a prior first Patronage.

## 9. Leaning maturation after switching candidates

**Attack:** Ysabel Leans Renard for ten days, flips to the player and immediately claims the old maturation time.

**Severity:** YELLOW

**Amendment:** `maturationStart` resets whenever `candidateId` changes or the lord becomes Unaligned. Only continuous Leaning toward the same candidate counts.

## 10. Event random outcomes remain partly vague

**Severity:** YELLOW

**Amendments:**

- Northern Raiders casualties: stored uniform integer 0–20.
- Unpaid Capital Guard ignored: stored result, 50% no change / 25% -25 garrison / 25% -50.
- Renard rumor blame: 50% stored success; success keeps Forgery hidden and gives Renard -15 relationship, failure gives player -5 Prestige and makes future discovery +20 percentage points more likely.
- Hawk Tournament: 50% high result / 50% low result, stored.
- Funeral temporary troops expire after three days and disappear from any Capital force; if their expiry drops a garrison below 200, control ends normally.

## 11. Same-time collateral and phase transition

**Attack:** A bargain resolves at the exact dawn Deathbed begins. Does its Ailing maturation/cost or Deathbed rule apply?

**Result:** Due Orders resolve before phase transition. Acceptance uses pre-transition state. Any later Request Declaration uses the new phase's four-day maturation requirement.

**Severity:** GREEN once scheduler ordering and current-phase maturation are read together.

## 12. Hidden blackmail and the forecast

**Attack:** Forecast labels a blackmailed public Pledge as safely voluntary because the player knows it is coercive.

**Amendment:** The player's own forecast may label support **Secretly Coerced** because the player knows the basis. Other lords' knowledge projections see only the public Pledge unless they discover the blackmail.

## Final result

After these amendments, the remaining uncertainty belongs to balancing rather than rule definition. No additional major system is needed. The complete package now specifies:

- who knows every decisive fact;
- who acts when timestamps collide;
- how every vote is cast, including the player's after elimination;
- how public terror differs from hidden blackmail;
- how old political shocks decay;
- how emergency debt is priced;
- exact per-lord candidate evaluation.