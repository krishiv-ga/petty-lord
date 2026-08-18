# Interface, Content, Technical Contract and Production

## 1. Product definition

The first release is a complete desktop-browser game, not a feature demo.

A complete run must include:

- title screen;
- new game and resume;
- integrated onboarding;
- full 49–56 minute simulation;
- active rival behavior;
- all succession routes;
- win and loss resolution;
- detailed ending report;
- restart with a new seed;
- deterministic autosave;
- readable feedback and error handling.

## 2. Interface principles

### Political, not administrative-dashboard

The interface should feel like a medieval ruler's map table and correspondence desk.

Use:

- illustrated parchment map;
- heraldry;
- portraits;
- seals and ribbons for Pledges;
- letters and proclamations for major events;
- chronicle language for system feedback.

Avoid:

- generic SaaS cards;
- excessive spreadsheets;
- neon data visualization;
- unexplained progress bars;
- rows of tiny icon-only buttons;
- hidden hover-only information.

### Explain consequences before commitment

Every action confirmation shows:

- time;
- Gold/Influence cost;
- troops locked;
- public/private visibility;
- known relationship and support consequences;
- legal/Royal Authority consequences;
- conditions that may invalidate the action.

Unknown outcomes should be identified as unknown rather than omitted.

### Explain political state through reasons

A lord panel separates:

- Personal Attitude;
- Succession Position;
- What They Want;
- What They Fear;
- Proof progress;
- Active Bargain;
- Public reasons;
- Known private intelligence and its age.

No lord panel should imply that a high relationship automatically means a vote.

## 3. Main-screen layout

Target minimum viewport: 1280×720. Preferred: 1440×900.

### Top bar

- King portrait and health phase;
- current week/day and approximate prognosis;
- Gold;
- available/total Levies;
- Prestige;
- Claim with band label;
- Influence;
- pause, 1× and 2× controls;
- menu/save indicator.

Resource changes animate briefly and create a reason tooltip.

### Left rail — great lords

Six compact portrait entries including the player.

Each shows:

- heraldry;
- name/title;
- candidate marker, if declared;
- public Pledge/Commitment ribbon;
- dispossessed/occupied warning;
- relationship descriptor toward the player;
- unread direct-message marker.

A private Leaning is never shown here unless intelligence reveals it, in which case it is marked with an eye icon and observation age.

### Center — kingdom map

A fixed SVG map containing seven territories.

Each territory shows:

- legal lord's crest;
- occupation overlay and occupier banner;
- Wealth, available levy band and Fortification on selection;
- temporary-condition icon;
- active campaign route if public;
- adjacency highlight when selecting a military action.

The map is the primary navigation object. Clicking a territory selects its lord and physical state.

### Right inspector

Context-sensitive panel for:

- lord;
- territory;
- candidate;
- agreement;
- secret;
- action setup;
- succession forecast.

The panel keeps one stable hierarchy: identity, current state, reasons, available actions.

### Bottom bar

#### Order slots

Two large slots showing:

- action name;
- target portrait/crest;
- time remaining;
- committed resources;
- public/hidden state;
- cancel button and exact cancellation loss.

#### Chronicle

Scrollable event feed with filters:

- All;
- Succession;
- War;
- Court;
- Intelligence.

Routine AI actions remain here rather than opening modals.

## 4. Succession forecast screen

The forecast is a full overlay reachable from the Crown icon.

It contains:

- each declared candidate in a column;
- public Pledged/Committed voters;
- candidate self-vote;
- known Leanings with intelligence timestamps;
- unknown houses;
- Claim and Church stance;
- Capital controller;
- military-acclamation progress;
- projected elimination/runoff path using only known information;
- current qualitative verdict.

The screen must distinguish:

- **Locked by public state**;
- **Expected from intelligence**;
- **Unknown**;
- **Conditional tie-break**.

Example language:

> If the King died today, Renard would lead the first ballot. Your intelligence suggests Ysabel may defect, but the report is eight days old. A 3–3 runoff would currently favor Renard through Church endorsement.

## 5. Major-event presentation

Major events appear as letters, proclamations, reports or council scenes.

A major event:

- auto-pauses;
- clearly states why it occurred;
- presents 2–3 choices;
- previews known direct consequences;
- hides only consequences that are intentionally uncertain;
- cannot be dismissed without choosing.

Modal priority:

1. King's death;
2. direct military defense;
3. time-limited ultimatum/bargain;
4. phase transition;
5. ambient choice event;
6. tutorial prompt.

Lower-priority events queue behind higher-priority ones. The clock remains paused until the queue contains no mandatory decision.

## 6. Onboarding

The tutorial is integrated into the first run and can be disabled later.

### Beat 1 — The prognosis

At game start, explain:

- eight-week estimate;
- continuous time and pause;
- objective: be crowned when the King dies;
- two Order slots.

The player must pause/unpause once.

### Beat 2 — Read the board

Highlight Renard, then the succession forecast.

Explain:

- Renard is favorite;
- public support is not relationship;
- the player is not yet a candidate;
- Claim, Church, noble votes and Capital have distinct roles.

### Beat 3 — Begin an initiative

Prompt the player to inspect three suggested openings without forcing one:

- Watch a rival court;
- Research Lineage;
- cultivate a lord with a Gift.

The player selects any legal Order.

### Beat 4 — First phase transition

When Ailing begins, explain Declare Candidacy and the danger of waiting while Pledges harden.

### Beat 5 — First public Pledge or war

Show the difference between Leaning, Pledged and Committed, or the battle preview if war occurs first.

Tutorial text must never assume a particular route.

## 7. Feedback requirements

Every state change creates at least one of:

- floating delta near the relevant resource;
- highlighted reason in lord panel;
- chronicle entry;
- map overlay;
- public ribbon/condition icon;
- major event.

Examples:

- `Prestige +8 — Victory at Westmarch`
- `Edric: Neutral → Cordial — You demonstrated strength`
- `Oswin remains with Renard — Your Claim is plausible, but your attack on Abbeylands violates his Red Line`
- `Ysabel's Pledge broke — Your army no longer exceeds Eastvale's defense`

No important change may occur only inside an invisible reducer.

## 8. Accessibility and controls

- Space: pause/unpause.
- 1 and 2: speed controls.
- Escape: close non-mandatory overlay.
- Tab navigation for all actionable UI.
- No information conveyed by color alone.
- Minimum body text 16 px at target viewport.
- Portrait support states include text labels and icons.
- Reduced-motion mode disables map pulses and resource-count animations.
- Audio is optional and never required for warning.
- Contrast must meet WCAG AA for core text.

## 9. Audio

Audio is a low-priority polish layer.

Minimum useful set if time permits:

- parchment/UI clicks;
- seal stamp for Pledge;
- distant bell at phase change;
- restrained battle report hit;
- death bell;
- low ambient court/map loop.

Cut audio before cutting rules clarity, endings or onboarding.

## 10. Art asset list

All art can be generated and then manually selected without requiring animation rigs.

### Required

- player silhouette/customizable crest rather than a fixed face;
- portraits: King, Edric, Ysabel, Renard, Oswin, Mara;
- seven territory vignettes or map emblems;
- six house crests plus Crown and Church symbols;
- parchment map background;
- phase-state variants for the King portrait, achievable through cropping/overlays if necessary;
- UI frames, seals, ribbons and condition icons;
- title-screen key art.

### Optional

- event-specific small illustrations;
- alternate portrait expressions;
- animated candle/smoke ambience;
- bespoke ending art for each coronation route.

### Art direction

Painterly medieval manuscript realism with strong silhouettes, limited muted palette, readable heraldry and no photorealistic modern costume styling.

Portraits should communicate personality before text:

- Edric: martial, direct, weathered;
- Ysabel: controlled, observant, wealthy;
- Renard: polished favorite with cultivated confidence;
- Oswin: austere and politically alert rather than saintly;
- Mara: defiant provincial ruler, not generic bandit queen;
- King: visibly deteriorating authority.

## 11. Ending report

The ending report is essential because the game ends immediately at succession.

### Header

- winner;
- route/title;
- exact day of death;
- run seed;
- total real and paused time.

### Succession reconstruction

- every ballot, in order;
- every lord's vote;
- dominant reasons for the vote;
- candidate elimination;
- tie-break used, if any;
- Military Acclamation conditions, if used.

### Political cost

- active promises and offices;
- Gold still in escrow;
- public concessions;
- Oathbreaker/coercion history;
- supporters who were Pledged versus Committed;
- houses that consider the new reign illegitimate.

### Realm cost

- wars fought;
- territories occupied;
- levy and mercenary casualties;
- Greyfen conditions;
- final Claim, Prestige and Church stance.

### Turning points

Select up to five chronicle events with the greatest state impact.

### Replay prompt

- New Crisis with new seed;
- Replay same seed;
- return to title.

## 12. Win ending labels

- **Crowned by Acclamation:** four or more votes before final runoff.
- **Crowned by Council:** wins final ballot 4–2 or better.
- **Crowned by the Church:** wins a 3–3 tie through sole endorsement.
- **Master of the Capital:** wins a 3–3 tie through Capital control.
- **The Rightful Heir:** wins a later tie through superior Claim.
- **Crowned by the Sword:** Military Acclamation.

More than one descriptive subtitle may apply, but the mechanical route must be named exactly.

## 13. Loss endings

- Renard crowned;
- Edric crowned;
- player eliminated before final ballot;
- player loses final ballot;
- player never declared;
- player loses a constitutional tie-break;
- player built a military position but failed one explicit Acclamation condition.

Loss text should explain the missing condition and show a plausible different decision, not merely “Defeat.”

## 14. Technical architecture

Recommended stack:

- React;
- TypeScript with strict mode;
- Vite;
- a single serializable state store such as Zustand with reducer-style transitions;
- SVG for map and campaign lines;
- CSS for animation and layout;
- localStorage or IndexedDB for autosave;
- seeded PRNG library or small audited deterministic generator.

No game engine, canvas renderer or backend is required.

## 15. Canonical state shape

The exact names may change in code, but every concept must be serializable.

```ts
interface GameState {
  version: number;
  seed: string;
  rngState: string;
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
  scheduledEvents: ScheduledEvent[];
  pendingDecisions: DecisionState[];
  chronicle: ChronicleEntry[];
  flags: Record<string, boolean | number | string>;
  ending?: EndingState;
}
```

### Rule

No authoritative simulation state may live only inside a React component, timeout or animation callback.

## 16. Simulation engine

Use a deterministic event scheduler rather than independent browser timers.

`advanceTime(deltaHours)`:

1. identifies the next due timestamp;
2. advances to it;
3. resolves all due items using the canonical priority order;
4. stops if a mandatory decision is created;
5. repeats until requested delta is consumed or paused.

This permits:

- pause;
- 2× speed;
- save/load;
- deterministic replay;
- unit testing of long periods without real time;
- no timer drift after backgrounding the browser.

When the browser tab is hidden, default behavior is to auto-pause. The game never advances while the player is away.

## 17. Data-driven definitions

The following should be data, not hard-coded UI branches:

- lords and personality weights;
- territories and adjacency;
- actions, costs and durations;
- bargains;
- secrets;
- event choices;
- support shocks;
- phase modifiers;
- Church consequences;
- ending labels.

Core transition logic remains typed code.

Every action definition must include:

- availability predicate;
- start cost;
- duration;
- visibility timeline;
- resolution function;
- invalidation fallback;
- AI usage permissions;
- chronicle template;
- UI consequence preview.

## 18. Save behavior

- Autosave after every dawn.
- Autosave after every player action start/cancel.
- Autosave after every mandatory decision.
- Autosave before and after succession.
- Keep one current autosave and one previous checkpoint for recovery from corrupted writes.
- Include schema version and migration hook.
- Validate loaded state before resuming.
- A normal browser refresh resumes the exact seeded timeline.

Save editing is not treated as a security problem. The goal is reliability, not anti-cheat.

## 19. Debug tools

Development builds should include a hidden debug panel capable of:

- advancing one hour/day;
- forcing a phase;
- forcing King's death;
- inspecting AI knowledge versus true state;
- inspecting candidate evaluation reasons;
- completing/cancelling Orders;
- setting resources;
- forcing event eligibility;
- exporting/importing a save JSON;
- running succession immediately;
- displaying deterministic RNG draw log.

This panel is critical for automated Codex development and paperplay verification.

## 20. Automated tests

### Unit tests

- action availability, costs and anti-spam;
- clock priority order;
- Claim projects and fraud exposure;
- support transitions and pledge inertia;
- Church endorsement selection;
- battle formula and casualty bounds;
- occupation/garrison loss;
- coercion validity;
- Council ballots and every tie-break;
- Military Acclamation;
- save/load determinism.

### Scenario tests

- player wins 4-vote first ballot;
- player wins Church 3–3 tie;
- player wins Capital 3–3 tie;
- player wins Military Acclamation;
- Renard wins despite liking player;
- Edric declares and reaches runoff;
- player wins while dispossessed;
- coerced vote breaks when army collapses;
- King dies on same dawn an Order completes;
- mercenary expiry collapses an occupation;
- exposed Forgery breaks Oswin support;
- reload produces identical event and battle outcomes.

### Simulation tests

Run hundreds of seeded AI-versus-scripted-policy simulations to detect:

- unwinnable opening packages;
- one dominant action chain;
- Renard automatic-win rate;
- impossible military route;
- excessive pledge oscillation;
- notification overload;
- softlocks after dispossession or resource exhaustion.

## 21. Balance targets

These are targets, not promises before testing.

- A first-time attentive player should understand the loss even if they do not win.
- A skilled player should not have a deterministic win from the opening state.
- No opening package should make Renard win more than 75% against varied competent scripted policies.
- Each of Coalition, Legitimacy/Puppetmaster and Military routes should win at least 15% of targeted simulation attempts after tuning.
- At least two lords should change private Leaning in a typical run; public Pledge churn should average below two breaks per run.
- Typical run: 12–20 meaningful player initiatives, 0–3 wars, 4–8 direct decision events.
- Deathbed should contain at least three legal high-value actions for any non-terminal player state.

## 22. Four-day production order

### Day 1 — complete rules loop

- serializable state;
- clock and scheduler;
- map and actor data;
- resources and daily economy;
- two Order slots;
- Declare Candidacy;
- exact succession resolver;
- debug panel.

A full run must be force-advanceable to an ending before Day 1 ends.

### Day 2 — interactions and opposition

- support states;
- bargains and coercion;
- Claim and Church;
- AI one-Intent loop;
- war, casualties, occupation and Capital;
- save/load.

A normal-speed complete run must be playable before Day 2 ends.

### Day 3 — content and presentation

- events;
- portraits and map art;
- succession forecast;
- onboarding;
- chronicle;
- ending report;
- sound only if ahead.

### Day 4 — feature freeze

- no new mechanics;
- automated simulations;
- full manual runs;
- balance and bug fixes;
- responsiveness within desktop range;
- deployment;
- final copy and asset QA.

## 23. Cut order if behind

Cut in this order:

1. optional audio;
2. event-specific illustrations;
3. alternate portrait expressions;
4. some ambient events, retaining at least eight total authored events plus phase events;
5. one opening package;
6. Find Dirt detection nuance, retaining secrets and Watch Court;
7. visual flourishes and nonessential animation.

Do not cut:

- exact succession procedure;
- Leaning/Pledged/Committed distinction;
- present collateral requirement;
- one-Intent AI capacity;
- Royal Authority phases;
- casualties, occupation garrisons and threat;
- Capital rules;
- deterministic save/RNG;
- ending explanation;
- pause and mandatory reactions.

## 24. Definition of done

The build is complete when:

- no critical state can become impossible or undefined;
- every action has a preview and result explanation;
- every ending is reconstructible;
- all non-negotiable tests in `README.md` pass;
- at least ten complete runs have been played or simulated across different seeds;
- the game can be deployed as a static site;
- a new player can begin, understand the objective, finish and restart without developer guidance.