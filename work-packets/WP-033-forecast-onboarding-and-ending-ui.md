# WP-033 — Succession Forecast, Onboarding and Ending UI

- **Status:** Blocked by WP-029
- **Wave:** 3
- **Execution:** Parallel-safe within Wave 3
- **Depends on:** WP-029
- **May run with:** WP-030, WP-031, WP-032 and WP-034 when ready
- **Must not run with:** WP-039 or any Wave 4 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$ui-audit`, `$critic`
- **Critic:** Required
- **Integrator:** WP-039
- **Release impact:** Playable beta candidate

## Objective

Build the interfaces that teach and resolve the game: knowledge-safe “If the King Died Today” forecast, route-neutral contextual onboarding, phase/tutorial guidance, and a complete ending reconstruction that explains exactly how the crown was won or lost and what it cost.

## Canonical inputs

- [`designer/interface-content-and-production.md`](../designer/interface-content-and-production.md)
- [`designer/politics-and-succession.md`](../designer/politics-and-succession.md)
- [`designer/game-rules.md`](../designer/game-rules.md)
- [`designer/ai-information-events.md`](../designer/ai-information-events.md)
- [`designer/art/stained_glass_character_variant_prompt.md`](../designer/art/stained_glass_character_variant_prompt.md)
- frozen knowledge-safe forecast and ending projections from WP-029
- UI foundation from WP-012/WP-019

## Owned paths

Expected ownership:

- `src/ui/game/forecast/**`
- `src/ui/game/onboarding/**`
- `src/ui/game/ending/**`
- feature fixtures/stories under those directories;
- `tests/ui/forecast/**`, `tests/ui/onboarding/**`, `tests/ui/ending/**`;
- `tests/e2e/forecast-ending/**`;
- approved placeholder raster files under `public/assets/placeholders/forecast-ending/**` only;
- `wiki-site/development/onboarding-and-endings.md` or another disjoint page;
- `logs/agents/WP-033/**`.

Do not edit app shell/store, map, lord/action inspector, production asset manifest, simulation, root config or shared wiki navigation.

## Deliverables

### 1. Knowledge-safe succession forecast

Implement **IF THE KING DIED TODAY** using only the frozen player-knowledge projection.

Show:

- legal candidates;
- candidate self-votes;
- public Pledges/Commitments/Under Duress as publicly known;
- known private Leanings/secret coercion only with source and observation age;
- unknown houses explicitly;
- public Claim band/exact display where permitted;
- Church position/reasons;
- Capital state/control;
- Military Acclamation checklist;
- expected first ballot, elimination/runoff and applicable tie-break order;
- verdict: Favored, Contested, Unlikely or Constitutionally Blocked;
- reasons and uncertainty rather than a percentage.

Do not compute a king score or infer hidden votes. When hidden information could change the result, state that directly.

### 2. Forecast state language

Create consistent non-color-only treatments for:

- public certainty;
- fresh intelligence;
- stale intelligence;
- player-held secret knowledge;
- unknown;
- conditional on current leverage/contract;
- constitutionally impossible;
- military override possible/not possible.

Show the timestamp/age of intelligence in plain language. Never display exact AI utility values in normal play.

### 3. Contextual onboarding framework

Implement route-neutral onboarding milestones:

1. prognosis, clock, pause/speed, two Orders and objective;
2. read the board: Renard is favorite; relationship differs from support; nobles/Claim/Church/Capital play different roles;
3. first initiative suggestions such as Watch Court, Research or Gift without forcing one;
4. Ailing: candidacy, Leaning maturation, Proof/collateral and hardening;
5. first Pledge/war: support levels or battle/occupation consequences;
6. Deathbed: uncertainty, short actions and succession forecast.

Requirements:

- contextual and dismissible where not mandatory;
- never consumes simulation time by itself;
- persists completion state as non-authoritative preference/progress, not game rules;
- can be reopened from help;
- works when the player takes an unexpected route or loses Greyfen early;
- avoids huge walls of text and generic tour popovers.

### 4. Help/glossary surfaces

Create concise, linked explanations for:

- Gold, Levies, Prestige, Claim and Influence;
- Leaning/Pledged/Committed/Under Duress;
- Proof, Red Line and collateral;
- legal owner versus occupier;
- Church Endorsement;
- Council and Acclamation;
- public/fresh/stale/private/unknown information.

Use the maintained wiki for deep details, but the game must remain understandable offline and without opening documentation.

### 5. Phase/death teaching moments

Render phase-transition guidance through the existing decision/notification handoff:

- explain what just unlocked/changed;
- show no new rules that are not canonical;
- avoid blocking the player with repetitive tutorials on replay;
- provide reduced-motion version;
- keep Deathbed urgency rather than turning it into a long tutorial pause.

### 6. Ending report

Render the complete structured ending projection.

Header:

- winner;
- player win/loss;
- route label;
- death day;
- seed;
- live and paused time where tracked;
- exact build version.

Constitutional reconstruction:

- Military Acclamation checklist or every Council ballot;
- each lord’s vote and ordered reasons;
- bound versus free vote;
- eliminations and released votes;
- player’s historical Greyfen vote when applicable;
- exact tie-breaks in order;
- decisive Church/Capital/Claim/Commitment facts.

Political/realm cost:

- voluntary/Committed/coerced support;
- private blackmail known to player;
- offices and policies promised;
- escrow/debt/default;
- Oathbreaker/betrayals;
- hostile houses;
- wars, occupations, Capital state and casualties;
- Greyfen status;
- final resources/ratings.

Turning points/replay:

- up to five decisive chronicle entries with links/details;
- New Seed;
- Same Seed;
- return to title;
- no post-coronation simulation promise.

### 7. Ending labels and narrative restraint

Support canonical labels such as Crowned by Acclamation, Crowned by Council, Crowned by Church, Master of Capital, Rightful Heir and Crowned by Sword only when structured ending facts warrant them.

Do not generate free-form runtime prose or claim a route not supported by facts. Use authored templates and variable inserts.

### 8. Fixtures and tests

Create fixtures/stories for:

- Renard favored with hidden Ysabel Leaning;
- player Contested with stale intelligence;
- Constitutionally Blocked undeclared player;
- player close to Acclamation but missing Capital garrison;
- public Under Duress versus secretly coerced support;
- three-candidate runoff;
- Church, Capital, Claim and earlier-declaration ties;
- Coalition win;
- Rightful/Church win;
- Puppetmaster/intrigue win;
- Military Acclamation;
- dispossessed Council win;
- player eliminated and casting historical vote;
- Renard victory with a friendly relationship to player;
- long turning-point copy and zero-turning-point fallback.

## Implementation contract

- Forecast receives only `PlayerKnowledgeProjection`; tests should make raw authoritative state unavailable.
- Ending receives frozen structured `EndingState`; it does not recompute succession.
- Onboarding never changes authoritative state or chooses a route for the player.
- No percentages, king points or hidden exact utility.
- Use bespoke political/letter/ledger composition and raster assets only.
- All actions/replay controls dispatch app callbacks rather than resetting state locally.

## Acceptance tests

- [ ] Forecast cannot access or display undiscovered Leaning, Intent, secret, exact army, private bargain or future draw.
- [ ] Known/stale/unknown/conditional states are understandable without color.
- [ ] Acclamation and Council forecast explanations match their input fixtures.
- [ ] Onboarding can be skipped/reopened and remains correct for nonstandard routes/dispossession.
- [ ] Every canonical ending scenario reconstructs all votes/tie-breaks/costs without recomputing rules.
- [ ] Player historical vote screen states clearly that the Crown is already lost.
- [ ] Same/New Seed/title callbacks are exposed for WP-039 integration.
- [ ] Keyboard, focus, reduced motion, axe and both target viewport tests pass.
- [ ] No SVG/vector/icon-font asset or prohibited icon library appears in owned paths.
- [ ] `$ui-audit` and independent critic findings are resolved.
- [ ] Wiki page is synchronized.

## Required evidence

- screenshots for forecast uncertainty and every major ending route;
- hidden-information test proving raw truth is inaccessible;
- full keyboard onboarding→forecast→ending fixture trace;
- ending reconstruction snapshots;
- vector-prohibition search;
- implementer/auditor/critic logs.

## Agent topology

One lead owns projection-to-presentation semantics. Disjoint sub-agents may work on onboarding copy/flows and ending fixtures, but forecast uncertainty and ending fact mapping must remain under one owner.

The UI auditor/critic should attack hidden information leakage, king-score creep, misleading labels, route-biased onboarding, unreadable reconstruction, generic modal/report styling and replay control edge cases.

WP-039 wires the real store/decision flow and integrated visual composition.

## Logging

Create:

- `logs/agents/WP-033/implementer-<name>.md`
- `logs/agents/WP-033/auditor-<name>.md`
- `logs/agents/WP-033/critic-<name>.md`

## Completion handoff

Document forecast/ending input contracts, onboarding milestones/preferences, replay callbacks, screenshots and integration risks. State integration readiness.

## Character portrait consumption amendment — 2026-08-19

The five rival full-body masters under `assets/characters/` are canonical production identity art. WP-034 generates the dedicated close portrait family from those masters using [`designer/art/stained_glass_character_variant_prompt.md`](../designer/art/stained_glass_character_variant_prompt.md).

Use these default semantic slots:

- **Succession forecast candidate/house rows:** `tight`.
- **Compact ballot/reconstruction rows:** `tight`.
- **Onboarding cast introductions and character teaching moments:** `bust`.
- **Ending header / major winner-loser character emphasis:** `bust` by default.
- **Large ending tableau or deliberate showcase moment:** `full` only where the composition has enough space and the side-facing full figure adds value.

Do not mechanically crop the existing side-facing full-body masters into release closeups. `bust` and `tight` are dedicated front-facing/near-front generated images with stronger stained-glass construction across face/hair and preserved identity/costume cues.

Because WP-033 may run before WP-034 is integrated, build against semantic `full`/`bust`/`tight` asset slots and approved raster fixtures. WP-039 connects those slots to the production manifest. Do not hardcode source filenames.

Ending and onboarding screenshots must be re-run with the production generated portraits before WP-039 closes so portrait density, stained-glass facial detail and character recognition are proven in the real layouts.
