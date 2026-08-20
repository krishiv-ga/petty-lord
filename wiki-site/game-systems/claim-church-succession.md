# Claim, Church and succession

WP-021 implements the legal and ecclesiastical constitution without an additive king score. Claim is
a bounded public rating, the Church makes a distinct institutional judgment, and succession resolves
through Military Acclamation or explicit Council ballots.

## Claim and fraud

`src/sim/systems/claim` keeps safe and fabricated Claim sources separately while projecting a bounded
0…100 rating and the exact None, Dubious, Plausible, Strong, Excellent and Overwhelming bands.

- Research Lineage is a six-day, 35 Gold / 12 Influence, once-per-run project for +12 safe Claim.
- Forge Royal Descent is an eight-day, 50 Gold / 25 Influence, once-per-run project for +25 fabricated
  Claim and one Forgery Evidence secret.
- Neither project may start in Deathbed; already-started work may finish.
- Exposure removes up to 20 fabricated Claim, costs 10 Prestige, creates the exact support shocks,
  activates Oswin's fraud Red Line and condemns the candidate.
- The authored Rumor confession is a pre-exposure off-ramp only.
- Penance costs 40 Gold, 10 Influence, three days and 5 Prestige. It removes fraud condemnation and
  caps the Church at Skeptical, but restores no Claim, trust, Relationship or Support.

Project status and Forgery state are serializable, so save/load cannot repeat a project or evidence.

## Church consideration

`src/sim/systems/church` emits a structured case with Claim, Oswin, Patronage, conduct, Favorite,
condemnation, coercion and Penance reasons. Oswin's Pledge or Commitment is one input to the Church;
he is never the institution itself.

Endorsement requires Ailing or later, Plausible+ Claim, no Condemnation, case at least 6 and fewer than
two coercions known to the Church. The sole endorsement is recalculated by highest case, exact Claim,
then Oswin's preference; an unresolved tie withholds endorsement. Public coercion is known. Secret
blackmail counts only when WP-023 says the institution learned it.

Patronize Church grants one institutional case benefit and one full Oswin relationship benefit. It is
unavailable again inside 21 days; later repetition grants only the smaller relationship effect. Abbey
Endowment shares the same one-time institutional and relationship benefits instead of double-stacking.
Completion and cooldown timestamps use finite elapsed days, including off-dawn fractional days from
the hourly scheduler; rounding to dawn cannot shorten or extend the 21-day lock.

## Succession constitution

`resolveSuccession` in `src/sim/systems/succession` receives already validated candidate, Support,
Church, Capital and Military Acclamation facts. It imports none of those systems' private state.

Resolution is deterministic:

1. Record candidate/support validation reasons.
2. Accept one supplied legal Military Acclamation winner and stop, or convene Council.
3. Give all six legal lords a vote even when dispossessed.
4. Apply candidate self-votes and valid Pledge/Commitment bindings.
5. Ask the pure exact-evaluation callback for unbound and released votes.
6. Crown at four of six.
7. With three candidates and no majority, eliminate the lowest; break an elimination tie by fewer
   Commitments, lower Claim, lower Prestige, then later declaration.
8. Resolve a final 3–3 by sole Church Endorsement, Capital control, more Commitments, exact Claim,
   Prestige, then earlier declaration.
9. If Greyfen is no longer a candidate and more than one candidate remains, return a mandatory manual
   vote decision with `playerCannotWin: true`.

The exact Council evaluator normally excludes a candidate who crosses that voter's Red Line. If both
finalists are excluded, the Constitution still forces a vote: no current violence against the
voter's own seat, then Relationship, exact Claim and earlier declaration. This fallback is explicit
in the vote reasons rather than silently turning the voter Unaligned.

One legal candidate receives a forced 6–0 acclamation. Declaration precedence includes scheduler
`sequenceId`, so simultaneous declaration timestamps remain totally ordered.

## Public integration contract

WP-029 supplies the actual Acclamation query from WP-022, active leverage revalidation, Support and
agreement validation, Church reconsideration, exact unbound evaluator and death trigger. The output is
either a resolved winner or an awaiting-Greyfen-vote decision plus a complete reconstruction. No
integration may replace that procedure with a generic candidate score.
