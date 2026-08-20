# Endings

WP-021 produces structured constitutional ending input without React or post-hoc log parsing.
`SuccessionReconstruction` records the supplied Military Acclamation result, candidate validations,
legal candidate list, every Council ballot, all six vote records, released Support, tallies, runoff
elimination, every attempted tie-break and the first decisive rule.

Each vote stores its source—self, binding, exact evaluation, Greyfen manual choice or sole-candidate
acclamation—and ordered supplied/constitutional reasons. Dispossession is retained on the voter record
as evidence that land loss did not erase title or vote.

The covered reconstructions include:

- voluntary coalition majority;
- Church, Capital, Commitment, Claim, Prestige and declaration-order tie paths;
- three-candidate runoff with released-support reevaluation;
- a dispossessed Greyfen victory;
- player elimination followed by a historical Greyfen vote;
- sole-candidate 6–0; and
- Military Acclamation without a Council ballot.

When Greyfen is eliminated or never declared, resolution returns `awaiting-greyfen-vote` only while
multiple candidates remain. The decision is explicitly marked `playerCannotWin: true`; casting that
vote can choose history's recipient but cannot restore Greyfen's candidacy or convert the loss to a
win.

WP-029 will add integrated resource, event, war and seed/replay context. WP-033 will render the
chronicle and ending report. Those packets should consume the reconstruction rather than recomputing
votes or assembling explanations from hidden state.
