# AI, knowledge and events

WP-023 implements the deterministic living-world layer as pure TypeScript under
`src/sim/systems/` and observer-only projections under `src/sim/projections/knowledge/`. WP-029 will
connect its typed effects and initiative plans to the other Wave 2 domains.

## Rival Intent lifecycle

`chooseAndStartIntent` accepts one actor, the actor-owned `PlayerKnowledgeProjection`, an authored
Intent catalog, the phase, current PRNG state and scheduler sequence ID. Knowledge requirements and
target threat are evaluated inside the selector from that projection; callers cannot provide a
hidden-derived threat band or legality flag. The selector removes knowledge-ineligible and
unaffordable choices, applies personality/phase/known-threat modifiers, stores seeded ±5% near-tie
draws, then pays Gold and Influence and locks troops.

An actor with an active Intent cannot select another. Intent state stores visibility and invalidation
fallback. Invalidated work releases capacity but cannot be replaced until the next dawn; troop-loss
inputs are bounded by the committed and available force. Defense, ultimatums, bargains and mandatory
decisions pass through `recordReaction` without consuming the Intent. WP-029 must connect the
authored catalog's action IDs, costs and durations to the common domain action contracts; resolution
may consult reality to apply success, fallback or invalidation, but not to change what the AI knew.

## Observer knowledge and projections

A `KnowledgeLedger` stores timestamped observations rather than shadow copies of the game. Each fact
records observer, source, subject, field, value, confidence, observation time, stale window,
invalidation time and sequence ID. A newer observation invalidates the older fact for the same
observer/subject/field.

`buildPlayerKnowledgeProjection` accepts only:

- public realm facts;
- the observer's exact self-owned army/defense, agreements, Intent, support and known secrets;
- that observer's ledger.

Unknown Leanings, Intents and secrets remain `unknown`; an observer's own idle Intent is known-null.
Unknown armies use public bands. Only confirmed direct/Watch Court observations become exact army
counts. Watch Court is exact for seven days, then becomes a labeled stale estimate blended toward the
current public midpoint. Partial Find Dirt may reveal only a band, which yields to current public
information when stale.

Support projections distinguish public `Under Duress`, observer-known `secretly-coerced` support and
the ordinary voluntary appearance seen by uninformed rivals. Public snapshots cannot carry the
private-coercion label. Threat is derived separately for every observer using that observer's
military estimate and exact defense plus public occupation, Capital, supporters, public coercion and
offensive-war history. The projection has no input for future draws or private bargains between
other actors.

## Spy and secrets

Watch Court lasts three days, costs 20 Gold/8 Influence (15 Gold from Greyfen's adjacent Fen Roads)
and always records current Intent, Leaning and exact army with a seven-day freshness window.

Find Dirt lasts five days, costs 30 Gold/12 Influence and cannot start in Deathbed. Start-time
Influence, modifiers, seeded variance and detection roll determine secret/partial/none and detection.
Those draws are stored on the plan; reload, rescheduling or refresh reuses them. Repeated attempts add
20 detection percentage points within ten days, capped at 100. A detected attempt emits typed
`politics.adjust-relationship` and `knowledge.spy-alert` effects.

An opening creates exactly one Renard vulnerability and two distinct additional NPC secrets. Secret
facts track discoverers, evidence, one blackmail use and one exposure. Exposure returns the authored
content effects and emits `politics.release-secret-coercion` when private leverage had created
support; destroying evidence emits the same release hook.

## Openings and authored events

`createSeededOpening` deterministically stores the package ID, Renard vulnerability, two additional
secrets, opening effects and post-selection PRNG state. Validation requires at least three compatible
routes, distinct additional secrets and a real Renard vulnerability, while rejecting a pre-resolved
player victory.

The event engine consumes all 16 validated content definitions. It derives the six canonical ambient
slots (Days 6–10, 14–18, 22–26, 30–34, 38–42 and 45–49), stores weighted selection, and enforces
once-per-run/cooldown and one-interruption-per-24-hour rules. Mandatory follow-ups store due time and
resolved identity, preventing early or replayed decisions. Random choice results are stored and
conditional authored effects are reduced to only the chosen outcome. A legal zero-cost fallback is
used if conditions change. The dawn entry point requires a completed death check; if the King died
that dawn, ambient selection is suppressed.

Notification priority is structured data. Direct attack/demand, expiring debt, public support or
territorial change, scandal, phase, death and choices interrupt. Routine gifts, taxes and harmless
court activity stay in the feed.

## Determinism and integration evidence

Focused tests under `tests/sim/{ai,knowledge,events}/` cover:

- per-lord divergent belief snapshots and stale/invalid intelligence;
- knowledge-bound one-Intent capacity, actual charges/locks, next-dawn invalidation and reactions;
- same-seed replay plus bounded cross-seed opening/AI variation;
- non-rerolling Find Dirt/event outcomes and non-exact partial intelligence;
- guaranteed Renard intrigue, one-use blackmail and coercion release;
- death-before-ambient ordering, canonical cadence, repayment replay guards and event softlock probes;
- unknown-fact projection and a 120-routine-action notification sample.

All state returned by these APIs is JSON-compatible. WP-029 owns scheduler/module registration and
the concrete politics/war/time consumers for emitted effects; it must preserve the stored draws and
observer-only AI input boundary.
