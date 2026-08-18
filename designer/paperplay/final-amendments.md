# Final Paperplay Amendments

**Status:** Incorporated into canonical design  
**Scope result:** No new major system required  
**Remaining uncertainty:** balance tuning and content pacing only

This file is the audit trail between the first complete design pass and the final locked package. The canonical rules live in the parent `/designer` files; this document explains why they changed.

## 1. Political resource economy

### Hole

The first Influence economy made the intended coalition and legitimacy routes arithmetically impossible without event luck.

### Final rule

- Passive Influence: +1 every dawn.
- Declare Candidacy: 15 Influence.
- Offer Bargain: 8 Influence at start.
- Request Declaration: 8 Influence.

Three voluntary kingmakers still require at least 63 Influence before Spy, Threaten or recovery actions, so political capacity remains restrictive.

## 2. Late-declaration burst

### Hole

Lower political costs allowed a hidden player to Declare in Deathbed and purchase several immediate Pledges before rivals could respond.

### Final rule

Continuous Leaning maturation:

- Ailing 2 days;
- Gravely Ill 3 days;
- Deathbed 4 days.

Current phase requirement applies, and maturation resets when the preferred candidate changes. Shared-risk Commitment events can waive maturation for one lord.

## 3. Promises and collateral

### Hole

A future office or policy promise remained too close to a free postgame debt.

### Final rule

- Future reward alone: Leaning value only.
- Pledge: Proof + accepted present collateral + maturation.
- Collateral applies only when the target accepts the bargain at resolution.
- Accepted collateral becomes an Agreement obligation and cannot be cancelled as an Order.
- Marshal and Chancellor are unique per candidate's prospective government.

## 4. Oswin and Church route affordability

### Hole

The legitimacy route paid twice for Church Patronage through both the base action and Oswin's bargain.

### Final rule

- Abbey Endowment: 60 Gold and itself creates Patronage.
- Church Immunities: permanent 20% reduction to Raise Taxes proceeds plus the normal 50-Gold Patronize Church action; no extra cash payment.

## 5. Intrigue route availability

### Hole

A seeded run could contain no Renard secret, deleting the Puppetmaster strategy before play began.

### Final rule

Every run contains exactly one of three Renard vulnerabilities plus two secrets among the other NPCs. The vulnerability varies, but intrigue against the favorite always exists.

Repeated Find Dirt raises detection risk rather than discovery defense, so persistence remains possible at escalating political danger.

## 6. Forgery failure and repair

### Hole

Repairing exposed Forgery depended on drawing one ambient event.

### Final rule

Contextual **Confess and Seek Penance**:

- 3 days;
- 40 Gold;
- 10 Influence;
- -5 Prestige;
- removes fraud-based Condemnation to at most Skeptical;
- restores no Claim, Pledge or relationship.

The Rumor event remains a cheaper pre-exposure off-ramp.

## 7. War snowball and Yield

### Hole

Without a hard Yield rule, cautious AI could surrender weak seats and let an overwhelming player paint the map without casualties.

### Final rule

AI Yield requires known expected attacker power at least 1.75× defense, no allied relief and no hidden fortune. Personality may raise, never lower, the threshold.

Occupation remains 25% income, no levies/trait and 75 troops locked. Legal lords remain voters.

## 8. Capital pyrrhic state

### Hole

A claimant could defeat the Capital garrison but lack 200 survivors, while the design implausibly restored control to the destroyed royal guard.

### Final rule

The Capital becomes **Uncontrolled**:

- no income;
- no tie-break;
- no Military Acclamation credit;
- later declared claimant can one-day March and assign 200 troops without another battle.

## 9. Deterministic same-time resolution

### Hole

Two Orders at the same timestamp could resolve according to object iteration and produce inconsistent elections.

### Final rule

Every scheduled item receives a monotonic sequenceId. Resolve by timestamp, priority class, then lower sequenceId.

Orders resolve before phase transition and death at the same dawn. Contracts and timed conditions expire before death.

## 10. Bargain and Request invalidation

### Hole

A player could lose full collateral to a bargain that became impossible during negotiation, or receive an arbitrary cooldown when a valid Request was invalidated externally.

### Final rule

- Bargain start charges negotiation Influence only.
- Collateral applies on accepted resolution.
- Externally invalidated Request costs -2 relationship and no cooldown.
- Premature Request costs -4 and seven-day cooldown.

## 11. Defection and Commitment

### Hole

A challenger could bypass Pledge inertia by opening a fresh bargain, or overwrite a genuine Commitment with ordinary coercion.

### Final rule

Defection negotiation requires half-inertia shock, Opportunistic collapse, known breach/Red Line or valid coercion. Voluntary defection breaks the old Pledge, resets to Leaning and matures again.

A valid Commitment cannot be replaced by ordinary bargain or coercion.

## 12. Political shock lifetime

### Hole

An old minor defeat could remain forever and combine with an unrelated late event to break a Pledge.

### Final rule

Numeric shocks expire after 10 full days. Active Red Lines, breaches and persistent public conditions remain while their causes remain.

## 13. Public coercion versus private blackmail

### Hole

The design simultaneously implied that all coercion was public and that blackmail was secret, creating impossible Church and AI knowledge.

### Final rule

- Military/occupation Threaten: public Under Duress, known to everyone, counts toward Church coercion block.
- Secret blackmail: private basis, public Pledge appears ordinary to uninformed actors.
- Church and AI react only to known coercion.
- Player forecast labels their own blackmail Secretly Coerced.
- Exposing the secret removes blackmail leverage and releases the Pledge unless another basis exists.
- One secret supports one successful blackmail agreement.

## 14. Observer-limited threat

### Hole

AI threat calculations could use the player's exact hidden army despite the information rules.

### Final rule

Each observer uses:

- exact fresh intelligence/direct observation;
- public army-band midpoint;
- stale intelligence blended toward current midpoint;
- exact own defense;
- no hidden battle fortune.

Threat can differ between lords because their information differs.

## 15. Loan exploit

### Hole

Borrowing 80 Gold and deliberately defaulting was profitable when only Prestige and relationship were lost.

### Final rule

At 14-day due date:

- Repay 105 Gold; or
- Default: spendable Gold to zero, -12 Prestige, -25 Ysabel relationship, Greyfen income halved for rest of run, public Defaulted Debtor and one Debt Leverage use for Ysabel.

The event appears only early enough for repayment to precede all death dates.

Political Access alternative now has exact collateral increases: Escrow +20 Gold, Chancellorship budget +20 Gold or Protection +50 troops.

There is no launch-scope debt-repair action after default; Ysabel's voluntary-support Red Line lasts for the remainder of that run.

## 16. Player's Council vote

### Hole

If the player never Declared or was eliminated, Greyfen still had one of six votes but no rule for casting it.

### Final rule

Succession pauses for **Cast Greyfen's Vote** when more than one candidate remains. The player chooses the historical winner but cannot regain candidacy or convert the loss into a win. With one candidate, Greyfen's vote is forced.

## 17. Exact candidate evaluation

### Hole

Generic component ranges still left Codex free to invent Desire, Fear and Legitimacy values, potentially producing a different political game.

### Final rule

`candidate-evaluation.md` now defines exact per-lord:

- Claim and Church values;
- Desire/conduct modifiers;
- threat response;
- Proof;
- Red Lines;
- hysteresis;
- tie behavior;
- explanation ordering.

Opening Leanings are covered by unit-test examples.

## 18. Fractional economy

### Hole

Integer rounding could erase occupation income and distort stacked levy modifiers.

### Final rule

Gold and levy recovery use fractional accumulators. The top bar displays whole spendable values; tooltips show exact rates.

## 19. Event closure

The final pass fixed exact event behavior:

- Raiders casualties uniformly 0–20;
- ignored Capital Guard result 50% none / 25% -25 / 25% -50;
- Tournament 50/50 high/low;
- Rumor blame 50% with exact failure penalty;
- Funeral troops expire absolutely after three days;
- Merchant repayment and default are mandatory decisions;
- Great Council reveals only current Leanings, not Intents or secrets.

## 20. Final route result

Paperplay demonstrated legal wins through:

- four-vote voluntary coalition;
- Church-backed legitimacy causing unpledged votes;
- Renard scandal plus Capital 3–3 tie-break;
- Military Acclamation;
- Council victory while dispossessed.

The late-hoarder strategy failed after maturation, and promise spam, relationship-maxing, repeat Claim, free occupation, repeated blackmail and reload RNG did not produce dominant wins.

## 21. Remaining tuning questions

These are not missing rules and should be answered through implementation simulation:

- How often Mara is the first supporter.
- Renard's win rate by opening package.
- Whether Military Acclamation casualty/Gold demands are too narrow.
- Whether Ysabel changes sides too often or too rarely.
- Whether Deathbed reliably provides at least three high-value actions.
- Whether six ambient events create the right interruption cadence.
- Whether the 49–56 minute distribution feels tense rather than arbitrary.

## 22. Lock statement

The design is ready for implementation. New mechanics should not be added during the four-day build unless an automated invariant failure or a complete human run demonstrates that a canonical route cannot function.

Feature work should now yield to implementation, simulation, UX clarity and tuning.