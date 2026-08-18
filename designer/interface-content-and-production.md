# Interface, Content, Technical Contract and Production

## 1. Product definition

The first release is a complete desktop-browser game:

- title, new game and exact resume;
- integrated onboarding;
- 49–56 live minutes at1×;
- active rivals;
- every constitutional route;
- win/loss and detailed reconstruction;
- same/new seed replay;
- deterministic autosave;
- readable feedback and recoverable errors.

## 2. Interface principles

### Political, not dashboard-like

Use parchment map, heraldry, portraits, seals, ribbons, letters and proclamations. Avoid generic SaaS cards, opaque progress bars and hover-only facts.

### Consequences before commitment

Every confirmation shows duration, start cost, acceptance collateral, troops locked, visibility, known political/legal effects, cancellation loss, invalidation and intentional unknowns.

### Reasons, not totals

Lord inspector separates Attitude, Succession Position, Desire, Fear, Proof, bargain/collateral, public reasons and timestamped private intelligence. Relationship never visually equals vote.

## 3. Main screen

Minimum1280×720; preferred1440×900.

### Top

King/phase, week/day/prognosis, Gold, available/total Levies, Prestige, Claim band, Influence, pause/1×/2× and autosave.

### Left lords

Six portraits with crest/title, candidate marker, public support ribbon, public Under Duress icon, dispossession, relationship and unread direct message.

A private Leaning or secretly blackmailed Pledge appears only when the player knows it, with intelligence/secret icon and observation age. Other actors' UI projections do not receive that label.

### Center SVG map

Legal crest, occupation banner, conditions, campaign lines, adjacency and Capital state Royal/Occupied/Uncontrolled.

Selection exposes Wealth, exact known or banded Levies, Fort, trait, income/recovery, controller and garrison.

### Right inspector

Stable order: identity → state → reasons → agreements/intelligence → actions.

### Bottom

Two Orders with target, completion, resources, visibility and cancellation loss; chronicle filters All/Succession/War/Court/Intelligence.

## 4. Succession forecast

**IF THE KING DIED TODAY** receives only `PlayerKnowledgeProjection`.

Show candidates, self-votes, public support, known Leanings with timestamps, unknown houses, Claim/Church, Capital, Military Acclamation checklist, expected elimination/runoff, tie-breaks and verdict Favored/Contested/Unlikely/Constitutionally Blocked.

Styles distinguish public, fresh intelligence, stale intelligence, unknown and conditional.

The player's own private blackmail is labeled **Secretly Coerced**. To uninformed AI/Church projections it appears as a normal public Pledge.

No percentages or king score. Tests fail if forecast reads unknown Leaning, Intent, secret, exact army or private blackmail.

## 5. Decisions and events

Mandatory decision auto-pauses, explains trigger, previews known consequences and requires resolution.

Priority:

1. King's death/succession state;
2. direct defense;
3. expiring ultimatum, loan repayment or bargain;
4. phase transition;
5. ambient event;
6. tutorial.

Inside succession, **Cast Greyfen's Vote** pauses ballot resolution if the player is no longer eligible and more than one candidate remains. It clearly states that the player has already lost the Crown and is choosing only the historical victor.

Decision queue and selected/stored outcomes serialize.

## 6. Onboarding

- Prognosis: clock, pause, Orders and objective.
- Read board: Renard favorite; relationship≠support; nobles/Claim/Church/Capital differ.
- First initiative: suggest Watch Court, Research or Gift without forcing.
- Ailing: Declare, maturation and hardening.
- First Pledge/war: support levels or battle preview.

Never assumes one route.

## 7. Feedback

Every authoritative change appears through delta, reason, chronicle, map, icon, event or ending.

Examples:

- `Prestige +8 — Victory at Westmarch`
- `Ysabel's public Pledge remains, but you know it is secured by blackmail`
- `Edric's defeat shock expired after ten days`
- `Capital → Uncontrolled — only176 troops survived`
- `Greyfen income halved — default on the Merchant Syndicate`

## 8. Accessibility and controls

Space pause,1/2 speed, Escape nonmandatory close, full tab navigation, no color-only state,16px minimum body, labels+icons, reduced motion, WCAG AA. Browser hiding auto-pauses before scheduler advances.

## 9. Art and audio

Required: player crest/silhouette; King+five rival portraits; seven territory emblems; house/Crown/Church symbols; parchment map; King deterioration; seals/ribbons/condition icons; title key art.

Painterly medieval-manuscript realism, muted palette and readable heraldry. Audio is optional: clicks, pledge seal, phase/death bells, battle accent and ambience. Cut audio before clarity.

## 10. Ending report

### Header

Winner, route, death day, seed, live/paused time.

### Constitutional reconstruction

Military checklist or every ballot; every lord's vote/reasons; eliminations, released votes, player's Cast Greyfen decision and tie-break.

### Political/realm cost

Pledged/Committed/coerced support, private blackmail revealed to player, offices, escrow, policies, debt/default, Oathbreaker, hostile houses, wars, occupations, Capital, casualties, Greyfen, final ratings.

### Turning points and replay

Up to five decisive chronicle entries; new seed, same seed, title.

Ending labels: Crowned by Acclamation, Crowned by Council, Crowned by Church, Master of Capital, Rightful Heir, Crowned by Sword.

## 11. Stack

React, TypeScript strict, Vite, serializable reducer-style store, SVG, CSS, localStorage/IndexedDB and audited seeded PRNG. No backend/engine/canvas required.

## 12. Canonical serializable state

```ts
interface GameState {
  schemaVersion: number;
  buildVersion: string;
  seed: string;
  rngState: string;
  nextSequenceId: number;
  status: 'playing' | 'succession' | 'won' | 'lost';
  timeHours: number;
  speed: 0 | 1 | 2;
  king: KingState;
  playerId: LordId;
  lords: Record<LordId, LordState>;
  territories: Record<TerritoryId, TerritoryState>;
  relationships: Record<PairKey, RelationshipState>;
  supports: Record<LordId, SupportState>;
  church: ChurchState;
  agreements: AgreementState[];
  orders: OrderState[];
  aiIntents: Partial<Record<LordId, OrderState>>;
  secrets: SecretState[];
  knowledge: Record<LordId, KnowledgeState>;
  scheduledEvents: ScheduledItem[];
  pendingDecisions: DecisionState[];
  chronicle: ChronicleEntry[];
  flags: Record<string, boolean | number | string>;
  ending?: EndingState;
}
```

Nested state includes fractional economy/recovery, shock timestamps, maturationStart, contracts, Capital state, stored draws, blackmail-used/visibility, Debt Leverage, per-candidate offices and decision queue.

No authoritative state only in component/timer/animation.

## 13. Deterministic scheduler

`advanceTime(deltaHours)` finds next due item, advances, sorts by priority and sequenceId, resolves, stops for mandatory decision and repeats.

All random-dependent objects snapshot draws. This supports pause,2×, save/load, replay and instant tests.

## 14. Data-driven definitions

Data: lords, candidate evaluation values, territories, actions, bargains, secrets, events, shocks, phase/Church modifiers and endings.

Each action contains availability, preview, start cost, acceptance collateral, duration, visibility, resolution, fallback, AI permissions and chronicle templates.

Typed transitions remain authoritative.

## 15. Saves

Autosave each dawn, action start/cancel, mandatory decision and before/after succession. Keep current+previous checkpoint; schema migration and validation. Restore decision queue, sequence IDs, fractional values and draws exactly.

## 16. Debug panel

Advance time, force phase/death, inspect truth versus each actor knowledge, candidate evaluation reasons, scheduler sequence, Orders, resources, events, save JSON, succession, RNG log, Capital Uncontrolled and invariant suite.

## 17. Tests

### Unit

- costs/anti-spam;
- same-time sequence;
- collateral acceptance;
- maturation/reset/phase boundary;
- shock expiry;
- Pledge/Commitment/defection;
- public versus private coercion;
- Church and fraud repair;
- exact candidate evaluation opening checks;
- secret consequences;
- battle/casualty/Yield;
- observer-limited threat;
- fractional economy;
- garrison/expiry/Uncontrolled Capital;
- ballots, sole candidate, manual Greyfen vote, every tie-break;
- Acclamation;
- knowledge-safe forecast;
- loan repayment/default;
- save determinism.

### Scenarios

Four-vote win; Church tie; Capital tie; Claim tie; Sword; Renard despite liking player; Edric runoff; landless win; coercion breaks; Commitment resists; same-dawn death; contract collapses Capital; pyrrhic Capital; Forgery/Penance; default consequences; eliminated player chooses historical winner; same seed reproduces.

### Simulation

Detect unwinnable package, dominant chain, automatic Renard, impossible military route, Pledge churn, overload, softlocks, universal Mara-first and late declaration dominance.

## 18. Balance targets

First-time player understands loss; no deterministic skilled opener; no package Renard>75% against varied competent policies; Coalition, legitimacy/intrigue and military each≥15% targeted wins; typical12–20 initiatives,0–3 wars,4–8 direct choices; Deathbed always at least three high-value legal actions in nonterminal state.

## 19. Four-day production

Day1 state/scheduler/map/economy/Orders/declaration/succession/debug. Day2 support/bargains/Claim/Church/AI/war/save. Day3 events/art/forecast/tutorial/chronicle/ending. Day4 freeze, simulation, balance, bugs, deployment and QA.

Cut audio, event art, portrait variants, ambient events, one opening package, detection nuance and flourishes—in that order.

Never cut exact succession, support levels/maturation/collateral, one-Intent AI, Royal Authority, casualties/garrisons/threat, Capital, deterministic scheduler/save, ending explanation, pause/reactions.

## 20. Definition of done

No critical undefined state; every action preview/result; every ending reconstructed; README tests pass; at least ten complete runs; static deployment; new player can start, finish, understand and replay.