# Interface, Content, Technical Contract and Production

## 1. Product definition

The first release is a complete desktop-browser game, not a systems demo.

A complete run includes:

- title screen;
- new game and exact resume;
- integrated onboarding;
- 49–56 live minutes of simulation at 1×;
- active rival behavior;
- all constitutional victory paths;
- win/loss resolution;
- detailed ending reconstruction;
- replay with new or same seed;
- deterministic autosave;
- readable feedback and recoverable errors.

## 2. Interface principles

### Political rather than dashboard-like

Use an illustrated parchment map, heraldry, portraits, seals, ribbons, letters and proclamations. Avoid generic SaaS cards, tiny icon grids, opaque progress bars and information available only on hover.

### Consequences before commitment

Every action confirmation shows:

- duration;
- start cost;
- collateral applied on acceptance;
- troops locked;
- public/private visibility;
- known relationship/support/legal consequences;
- cancellation loss;
- invalidation conditions;
- explicitly unknown outcomes.

### Reasons rather than unexplained numbers

Every lord inspector separates:

- Personal Attitude;
- Succession Position;
- What They Want;
- What They Fear;
- Proof progress;
- active bargain/collateral;
- public reasons;
- private intelligence with observation date.

High relationship must never visually imply a guaranteed vote.

## 3. Main screen

Target minimum viewport: 1280×720. Preferred: 1440×900.

### Top bar

- King portrait and health phase;
- current week/day and qualitative prognosis;
- Gold;
- available/total Levies;
- Prestige;
- Claim with band;
- Influence;
- pause, 1×, 2×;
- autosave/menu state.

Resource deltas briefly animate with a source reason.

### Left rail — great lords

Six compact portraits including player:

- crest and title;
- declared-candidate marker;
- public Pledge/Commitment ribbon and basis icon;
- Dispossessed/occupied warning;
- relationship descriptor toward player;
- unread direct-message marker.

Private Leaning appears only when known, with an eye/intelligence icon and age.

### Center — fixed SVG kingdom map

Seven territories show:

- legal lord crest;
- occupation overlay and occupier banner;
- temporary conditions;
- public campaign route;
- Capital state: Royal, Occupied or Uncontrolled;
- military adjacency highlights during action setup.

Selection reveals Wealth, exact known or banded Levies, Fortification, trait, income rate, recovery rate, legal lord, physical controller and garrison.

### Right inspector

Contextual but structurally stable:

1. identity;
2. current state;
3. reasons/evidence;
4. agreements/intelligence;
5. available actions.

Handles lord, territory, candidate, agreement, secret, action setup and forecast detail.

### Bottom

#### Two Order slots

Each shows:

- action;
- target;
- completion time;
- committed resources;
- visibility;
- cancellation consequence.

#### Chronicle

Filters: All, Succession, War, Court, Intelligence.

Routine AI activity remains here rather than interrupting.

## 4. Succession forecast

The Crown overlay presents **IF THE KING DIED TODAY** using only a `PlayerKnowledgeProjection`.

It shows:

- declared candidates;
- self-votes;
- public Pledges/Commitments;
- known private Leanings with timestamps;
- unknown houses;
- Claim and Church stance;
- Capital controller;
- Military Acclamation checklist;
- expected elimination/runoff using known state;
- conditional tie-break chain;
- qualitative verdict: Favored, Contested, Unlikely, Constitutionally Blocked.

Information styles must distinguish:

- locked public state;
- expected from fresh intelligence;
- stale intelligence;
- unknown;
- conditional constitutional result.

Never show percentage or aggregate king score.

Example:

> Renard would lead the known first ballot. Ysabel leaned toward you when observed three days ago. A 3–3 final ballot would currently favor Renard through sole Church Endorsement.

A unit test must fail if forecast code accesses an unknown Leaning, secret, Intent, exact army or bargain.

## 5. Event and decision presentation

Major events appear as letters, reports, proclamations or council scenes.

A mandatory event:

- auto-pauses;
- explains why it occurred;
- presents 2–3 choices where applicable;
- previews known direct consequences;
- labels deliberate uncertainty;
- cannot be dismissed without resolution.

Decision priority:

1. King's death;
2. direct military defense;
3. expiring ultimatum/bargain;
4. phase transition;
5. ambient event;
6. tutorial prompt.

Lower-priority decisions queue. Queue and selected outcomes serialize into saves.

## 6. Onboarding

Tutorial is embedded in the first run and can later be disabled.

### Prognosis

Explain eight-week estimate, continuous time, pause, objective and two Orders. Require one pause/unpause interaction.

### Read the board

Highlight Renard and forecast. Explain:

- Renard is favorite;
- relationship is not support;
- player is not yet a candidate;
- nobles, Claim, Church and Capital have different jobs.

### First initiative

Offer three non-forcing suggestions:

- Watch Court;
- Research Lineage;
- send Gift.

Player may choose any legal action.

### Ailing transition

Explain declaration, public Pledges, maturation and political hardening.

### First Pledge or war

Explain Leaning/Pledged/Committed or battle preview, whichever arrives first.

Tutorial never assumes one strategy.

## 7. Feedback contract

Every authoritative state change produces at least one visible explanation through:

- resource delta;
- highlighted lord reason;
- chronicle entry;
- map overlay;
- support/condition icon;
- major event;
- ending reconstruction.

Examples:

- `Prestige +8 — Victory at Westmarch`
- `Edric: Neutral → Cordial — You demonstrated strength`
- `Oswin refuses — your Claim is Plausible, but the attack on Abbeylands activates his Red Line`
- `Ysabel's coerced Pledge ended — Eastvale is no longer occupied`
- `Capital: Occupied → Uncontrolled — only 176 troops survived to hold it`

No decisive mutation may happen only inside code.

## 8. Accessibility and controls

- Space: pause/unpause.
- 1 / 2: speed.
- Escape: close nonmandatory overlay.
- Full keyboard/tab operation.
- No information by color alone.
- Minimum 16 px body text at target viewport.
- Text labels plus symbols for support/occupation.
- Reduced-motion mode.
- Audio never required for warning.
- WCAG AA contrast for core text.

When browser visibility changes to hidden, pause before further scheduler advancement.

## 9. Audio priority

Optional minimum set if ahead:

- parchment clicks;
- seal stamp for Pledge;
- phase bell;
- battle report accent;
- death bell;
- subdued map ambience.

Cut audio before rules clarity, endings or onboarding.

## 10. Art assets

### Required

- customizable player crest and silhouette rather than fixed player portrait;
- King, Edric, Ysabel, Renard, Oswin and Mara portraits;
- seven territory vignettes/emblems;
- six house crests, Crown and Church marks;
- parchment map background;
- King deterioration variants/overlays;
- UI frames, seals, ribbons and condition icons;
- title key art.

### Optional

- event illustrations;
- alternate expressions;
- ambient candle/smoke;
- unique route-ending art.

### Direction

Painterly medieval-manuscript realism, strong silhouette, muted palette, readable heraldry, no modern photographic costume look.

- Edric: direct, martial, weathered.
- Ysabel: observant, controlled, wealthy.
- Renard: polished confidence.
- Oswin: austere and politically alert.
- Mara: provincial authority and defiance, not generic bandit.
- King: visibly declining body and authority.

## 11. Ending report

Essential because simulation stops at coronation.

### Header

- winner;
- exact mechanical route/title;
- death day;
- seed;
- live and paused time.

### Constitutional reconstruction

- Military Acclamation checklist or every ballot;
- each lord's vote;
- dominant vote reasons;
- candidate elimination;
- released/reassigned votes;
- tie-break used.

### Political cost

- Pledged versus Committed supporters;
- coercion;
- reserved offices;
- escrow;
- Charters/immunities;
- Oathbreaker and conduct history;
- hostile houses.

### Realm cost

- wars;
- occupations;
- Capital state;
- levy/mercenary casualties;
- Greyfen conditions;
- final Claim, Prestige and Church stance.

### Turning points

Select up to five highest-impact chronicle entries.

### Replay

- new seed;
- same seed;
- title.

## 12. Ending labels

- **Crowned by Acclamation:** four votes before final runoff.
- **Crowned by Council:** final ballot 4–2 or better.
- **Crowned by the Church:** 3–3, sole Endorsement.
- **Master of the Capital:** 3–3, Capital control.
- **The Rightful Heir:** later tie-break through Claim.
- **Crowned by the Sword:** Military Acclamation.

Losses explain whether player never declared, was eliminated, lost ballot, lost tie-break or missed an explicit Acclamation condition.

## 13. Recommended implementation stack

- React;
- TypeScript strict;
- Vite;
- serializable reducer-style store, e.g. Zustand;
- SVG map/campaign lines;
- CSS animations;
- localStorage or IndexedDB autosave;
- small audited seeded PRNG.

No backend, game engine or canvas renderer required.

## 14. Canonical serializable state

Names may vary; concepts may not.

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

Required nested state includes:

- fractional Gold accumulators;
- per-territory fractional levy-recovery accumulators;
- Pledge shock/maturation timestamps;
- contract expiry;
- Capital Royal/Occupied/Uncontrolled state;
- stored battle/Spy draws;
- blackmail-used flags;
- per-candidate office reservations;
- decision queue.

No authoritative state may live only in a React component, browser timeout or animation callback.

## 15. Deterministic simulation engine

Use an event scheduler, never independent wall-clock timers.

`advanceTime(deltaHours)`:

1. find next due timestamp;
2. advance to it;
3. sort due items by priority then `sequenceId`;
4. resolve using canonical transition functions;
5. stop if a mandatory decision appears;
6. repeat until requested delta consumed or paused.

This enables pause, 2×, save/load, deterministic replay, instant test advancement and no timer drift.

All random-dependent objects snapshot their draws at creation where practical.

## 16. Data-driven definitions

Data, not UI branches:

- lords/personality weights;
- territory/adjacency;
- action costs/durations;
- bargains;
- secrets/consequences;
- events;
- support shocks;
- phase modifiers;
- Church modifiers;
- endings.

Each action definition includes:

- availability predicate;
- preview builder;
- start cost;
- acceptance collateral if applicable;
- duration;
- visibility timeline;
- resolution;
- invalidation fallback;
- AI permissions;
- chronicle templates.

Typed transition code remains authoritative.

## 17. Save behavior

Autosave:

- every dawn;
- player action start/cancel;
- every mandatory decision;
- before/after succession.

Maintain current save and previous checkpoint. Include schema version/migration. Validate on load. If current is invalid, offer previous checkpoint with transparent warning.

Queued decisions, sequence IDs, fractional accumulators and random draws must restore exactly.

Save editing is not a security concern.

## 18. Debug tooling

Development build hidden panel:

- advance hour/day;
- force phase/death;
- inspect true state versus each actor's knowledge;
- inspect candidate evaluation reasons;
- inspect scheduler ordering/sequenceId;
- complete/cancel Orders;
- set resources;
- force event eligibility;
- export/import save JSON;
- run succession now;
- show RNG draw log;
- set Capital Uncontrolled;
- validate invariant suite.

## 19. Automated tests

### Unit

- action availability/cost/anti-spam;
- same-time scheduler sequence;
- bargain acceptance versus collateral timing;
- Leaning maturation across phase boundary;
- Pledge/Commitment/defection/coercion transitions;
- Church Endorsement and fraud repair;
- exact secret consequences;
- battle/casualty bounds;
- Yield threshold;
- fractional economy/recovery;
- occupation/garrison/mercenary expiry;
- Uncontrolled Capital;
- Council ballots, sole candidate and every tie-break;
- Military Acclamation;
- knowledge-safe forecast;
- save/load determinism.

### Scenario

- four-vote first ballot;
- Church 3–3 win;
- Capital 3–3 win;
- Claim tie-break;
- Military Acclamation;
- Renard victory despite liking player;
- Edric declaration/runoff;
- player wins while dispossessed;
- coerced vote breaks with leverage;
- Commitment resists ordinary coercion;
- King dies on Order-completion dawn;
- mercenary expiry ends Capital control before death;
- pyrrhic Capital becomes Uncontrolled;
- exposed Forgery breaks Oswin then Penance repairs Condemnation;
- late loan event cannot occur;
- same seed/repeated choices reproduce result.

### Simulation

Hundreds of seeded runs with scripted policy families to detect:

- unwinnable package;
- dominant action chain;
- automatic Renard win;
- impossible military route;
- pledge oscillation;
- event/notification overload;
- resource/dispossession softlock;
- universal Mara-first coalition;
- late-declaration dominance.

## 20. Balance targets

- First-time attentive player understands why they lost.
- Skilled player lacks deterministic opening win.
- No package gives Renard >75% against varied competent scripted policies after tuning.
- Coalition, legitimacy/intrigue and military targeted policies each achieve at least 15% after tuning.
- At least two private Leanings commonly move; public Pledge breaks average below two per run.
- Typical run: 12–20 initiatives, 0–3 wars, 4–8 direct decision events.
- Any nonterminal Deathbed position has at least three legal high-value actions.

## 21. Four-day production order

### Day 1 — complete loop

State, scheduler, map data, economy, Orders, declaration, exact succession, debug panel. A full run must force-advance to ending.

### Day 2 — interaction/opposition

Support, bargains, coercion, Claim/Church, one-Intent AI, war/occupation/Capital, save/load. A normal run must be playable end-to-end.

### Day 3 — content/presentation

Events, portraits/map art, forecast, onboarding, chronicle, ending. Audio only if ahead.

### Day 4 — freeze

No new systems. Automated simulations, full manual runs, balance, bugs, desktop responsiveness, deployment, copy/art QA.

## 22. Cut order

Cut first:

1. optional audio;
2. event illustrations;
3. portrait variants;
4. ambient events down to minimum eight plus phase events;
5. one opening package;
6. nuanced detection presentation while retaining Watch/Secrets;
7. visual flourishes.

Never cut:

- exact succession;
- Leaning/Pledged/Committed;
- maturation and present collateral;
- one-Intent AI;
- Royal Authority;
- casualties/garrisons/threat;
- Capital rules including Uncontrolled;
- deterministic save/RNG/scheduler;
- ending explanation;
- pause/reactions.

## 23. Definition of done

- No critical state undefined.
- Every action previews and explains consequences.
- Every ending reconstructs the constitution.
- README non-negotiable tests pass.
- At least ten complete runs across seeds.
- Static-site deployment works.
- New player can begin, finish, understand and restart without developer guidance.