# WP-031 — Lords, Politics, Intelligence and Action UI

- **Status:** Blocked by WP-029
- **Wave:** 3
- **Execution:** Parallel-safe within Wave 3
- **Depends on:** WP-029
- **May run with:** WP-030, WP-032, WP-033 and WP-034 when ready
- **Must not run with:** WP-039 or any Wave 4 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$ui-audit`, `$critic`
- **Critic:** Required
- **Integrator:** WP-039
- **Release impact:** Playable beta candidate

## Objective

Build the character-political interface through which the player understands and acts on the succession crisis: lord rail, lord inspector, attitude versus support, proof/red lines, agreements, intelligence, action selection, previews, bargains, coercion and target workflows.

The UI must make people and obligations—not abstract points—the center of play.

## Canonical inputs

- [`designer/politics-and-succession.md`](../designer/politics-and-succession.md)
- [`designer/candidate-evaluation.md`](../designer/candidate-evaluation.md)
- [`designer/game-rules.md`](../designer/game-rules.md)
- [`designer/interface-content-and-production.md`](../designer/interface-content-and-production.md)
- [`designer/art/stained_glass_character_variant_prompt.md`](../designer/art/stained_glass_character_variant_prompt.md)
- UI foundation and raster contract from WP-012/WP-019
- commands/projections/action preview contract frozen by WP-029

## Owned paths

Expected ownership:

- `src/ui/game/lords/**`
- `src/ui/game/politics/**`
- `src/ui/game/inspector/**`
- `src/ui/game/actions/**`
- feature stories/fixtures under those directories;
- `tests/ui/politics/**`, `tests/ui/actions/**`, `tests/e2e/actions/**`;
- approved lord/action placeholder raster files under `public/assets/placeholders/lords/**` and `public/assets/placeholders/icons/actions/**` only;
- a disjoint wiki page such as `wiki-site/development/political-interface.md`;
- `logs/agents/WP-031/**`.

Do not edit map, app shell/store, operational top bar/orders/chronicle, forecast/onboarding/ending, production asset manifest, simulation or shared configs.

## Deliverables

### 1. Lord rail

Render all six great lords with:

- raster portrait/crest;
- title and candidate marker;
- public support state/ribbon;
- public Under Duress state when known publicly;
- private Leaning/secret coercion only when the player knows it, with source/age treatment;
- dispossession;
- relationship descriptor distinct from support;
- unread direct demand/message;
- current selected/focus state.

Unknown private position must remain **Undeclared/Unknown**, not be inferred from authoritative truth.

### 2. Stable lord inspector hierarchy

Use the canonical order:

1. identity and territorial position;
2. personal attitude;
3. succession position;
4. desire, fear, Proof and Red Line;
5. ordered public reasons;
6. agreements/collateral/obligations;
7. intelligence and observation age;
8. legal actions.

Show why a friendly lord may support Renard, why an enemy may be coerced into the player’s camp, and what would invalidate support. Avoid a single relationship meter dominating the panel.

### 3. Reasons and uncertainty

Render structured projection reasons with clear provenance:

- public fact;
- fresh intelligence;
- stale intelligence;
- player-owned secret knowledge;
- conditional/future requirement;
- unknown.

Do not calculate new political conclusions in UI. Never expose hidden exact evaluation scores in normal play; debug-only views remain WP-032.

### 4. Action catalog and targeting

Present only legal/contextually useful actions for the selected lord/territory while allowing the player to inspect disabled actions and reasons.

Support:

- direct target selection from inspector;
- map-target handoff through a frozen callback contract;
- variant choice such as Gift amount, Spy mode or Claim project;
- cancel/escape and preserved selection;
- phase locks and target cooldowns;
- contextual actions such as Declare, March, Penance, Break Agreement and Withdraw Occupation when relevant.

Avoid a giant universal action grid. Group actions by political intent and current relevance.

### 5. Consequence-first action preview

Before commitment, every action preview must show projection-provided:

- target;
- duration and completion day/phase risk;
- start cost;
- acceptance-time collateral;
- Gold/Influence/troops locked;
- visibility/publicity;
- known relationship, support, legal, Church, war or condition effects;
- cancellation loss;
- invalidation/fallback;
- intentional unknowns;
- Order-slot impact.

The confirm action sends one typed command. UI never pays resources optimistically or predicts authoritative success beyond projection.

### 6. Bargain and support workflows

Implement readable flows for:

- viewing what a lord actually requires;
- proposing one legal term/collateral package;
- unique office reservation and duplicate-office rejection;
- acceptance-time validation;
- request for public declaration after mature Leaning;
- premature request failure/cooldown explanation;
- Commitment/shared-risk state;
- agreement fulfillment/breach/break confirmation;
- current political debt and ending obligation preview.

A promise alone must never visually imply a secured Pledge.

### 7. Threat and secret workflows

Display leverage and risk without omniscience:

- known military/occupation/secret leverage sources;
- public military coercion versus private blackmail;
- support labeled Under Duress or Secretly Coerced according to player knowledge;
- conditional warning that support ends if leverage disappears;
- Expose Secret consequence preview;
- no secret shown before discovery;
- no exact success percentage.

### 8. Claim and Church actions

Implement action/political surfaces for:

- Research Lineage;
- Forge Royal Descent with fraud-risk warning but no undiscovered future outcome leak;
- Patronize Church;
- Church state/reasons and Oswin distinction;
- Forgery Evidence once known;
- Penance after exposure;
- candidacy declaration and Laughable Pretender warning.

### 9. States, accessibility and stories

Provide realistic stories/tests for:

- each rival selected;
- friendly but Renard-supporting Ysabel;
- Edric Proof unmet/met/Red Line active;
- Oswin versus Church disagreement;
- Mara bargain with permanent Greyfen cost;
- Pledged, Committed, public Under Duress and privately blackmailed support;
- stale Leaning intelligence;
- dispossessed lord;
- full Order slots;
- action invalidated between preview and confirmation;
- long copy and low-height viewport;
- keyboard-only action/bargain flow;
- reduced motion and missing raster assets.

## Implementation contract

- Components consume frozen projections and dispatch commands; no authoritative mutation.
- Relationship, support, Church, Claim and threat remain visually distinct.
- No percentage/score that the design forbids.
- No hidden facts obtained through raw GameState.
- All icons/portraits are raster through approved components.
- Use Radix behavior wrappers and bespoke political styling; no themed kit or dashboard pattern.
- Confirmation UI must remain readable under pause and cannot advance the simulation itself.

## Acceptance tests

- [ ] Lord rail accurately distinguishes public, known private, stale and unknown support information.
- [ ] Inspector makes attitude≠vote understandable in canonical fixtures.
- [ ] Every canonical action is discoverable when legal and explains disabled state when useful.
- [ ] Preview displays all required cost/collateral/visibility/cancellation/fallback fields.
- [ ] Bargain flow cannot reserve duplicate office or imply Pledge before proof/collateral.
- [ ] Threat/blackmail visibility never leaks undiscovered secrets.
- [ ] Keyboard, focus return, axe, reduced motion and target-cancel flows pass.
- [ ] No authored SVG/vector/icon-font asset or prohibited icon library exists in owned paths.
- [ ] Storybook and Playwright visual/interaction tests pass at target viewports.
- [ ] `$ui-audit` and independent critic findings are resolved.
- [ ] Wiki page is synchronized.

## Required evidence

- screenshots of canonical political states;
- complete keyboard action/bargain trace;
- action-preview field contract test;
- hidden-information regression test;
- vector-prohibition search;
- implementer/auditor/critic logs.

## Agent topology

One lead owns inspector/action workflow. Disjoint sub-agents may handle lord rail stories and bargain interaction tests, but all political reason/visibility behavior uses one projection contract.

The UI auditor/critic should attack hidden-information leakage, misleading support, generic card-grid composition, overloaded inspector, confirm/cancel focus, low-height usability and raster asset failures.

WP-039 integrates map targeting, operational shell, decisions and production assets.

## Logging

Create:

- `logs/agents/WP-031/implementer-<name>.md`
- `logs/agents/WP-031/auditor-<name>.md`
- `logs/agents/WP-031/critic-<name>.md`

## Completion handoff

Document component/action workflow APIs, required shell/map callbacks, projection assumptions, screenshots and known integration risks. State integration readiness.

## Character portrait consumption amendment — 2026-08-19

The five rival identity masters under `assets/characters/` are approved production full-body art. WP-034 owns their generated portrait family. WP-031 must consume semantic character slots rather than hardcoded files or arbitrary CSS crops.

Use these defaults:

- **Lord rail:** `bust` where the composition has enough space; `tight` only in genuinely compact/low-height states.
- **Lord inspector identity header:** `bust`.
- **Political conversation / bargain / threat presentation:** `bust`.
- **Very compact list/inline identity treatment:** `tight`.
- **Full figure:** reserved for an intentionally large showcase composition; never jam a side-facing full-body image into a small card.

`bust` and `tight` are dedicated generated front-facing/near-front portraits defined by [`designer/art/stained_glass_character_variant_prompt.md`](../designer/art/stained_glass_character_variant_prompt.md), with stronger facial stained-glass construction than the full-body masters. Do not manufacture production variants by cropping the side-facing master.

Because WP-031 and WP-034 run in parallel, WP-031 may use temporary raster fixtures that match the frozen `full`/`bust`/`tight` slot dimensions. It must not take ownership of production generation or manifest filenames. WP-039 replaces fixtures through the manifest contract.

Add visual QA specifically proving that the lord rail remains immediately legible with the actual generated cast, and that Edric/Oswin remain distinct at the smallest portrait treatment through visible martial versus ecclesiastical costume cues.
