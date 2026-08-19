# WP-032 — Application Shell, Operational UI, Persistence and Debug Surface

- **Status:** Blocked by WP-029
- **Wave:** 3
- **Execution:** Parallel-safe within Wave 3
- **Depends on:** WP-029
- **May run with:** WP-030, WP-031, WP-033 and WP-034 when ready
- **Must not run with:** WP-039 or any Wave 4 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$critic`
- **Critic:** Required
- **Integrator:** WP-039
- **Release impact:** Playable beta candidate

## Objective

Build the browser application boundary around the complete headless game: Zustand adapter, title/new/resume flow, deterministic time controls, operational top bar, Orders, chronicle, mandatory-decision queue, IndexedDB autosave/checkpoints, visibility auto-pause, error recovery and development-only debug surface.

This packet owns orchestration, not map, lord politics, forecast, onboarding or ending presentation.

## Canonical inputs

- [`designer/interface-content-and-production.md`](../designer/interface-content-and-production.md)
- [`designer/game-rules.md`](../designer/game-rules.md)
- [`TECH_STACK.md`](../TECH_STACK.md)
- frozen commands/projections/save/decision contracts from WP-029
- foundation components from WP-012/WP-019

## Owned paths

Expected ownership:

- `src/app/**`
- `src/ui/game/shell/**`
- `src/ui/game/topbar/**`
- `src/ui/game/orders/**`
- `src/ui/game/chronicle/**`
- `src/ui/game/decisions/**`
- `src/ui/game/debug/**`
- `src/ui/title/**`
- `src/persistence/**` or the app-owned equivalent;
- `tests/app/**`, `tests/ui/operations/**`, `tests/e2e/shell-save/**`;
- `wiki-site/architecture/persistence.md`
- `wiki-site/development/debugging.md`
- `wiki-site/reference/commands.md` app commands
- `logs/agents/WP-032/**`.

Do not edit map/territory UI, lord inspector/actions, forecast/onboarding/ending, production asset manifest, simulation rules or root configs.

## Deliverables

### 1. Zustand application adapter

Create a thin Zustand vanilla store around the frozen simulation API.

- Holds the current immutable canonical `GameState` reference and non-authoritative application state such as selected panel/territory, transient UI mode and storage status.
- Dispatches typed simulation commands.
- Derives or caches only rebuildable projections.
- Uses fine-grained selectors to avoid rerendering the entire screen each simulated hour.
- Never duplicates authoritative resources, timers, Orders, decisions, knowledge or ending state.
- Provides testable dependency injection for persistence and clock driver.

No game rule belongs in store actions.

### 2. Browser time driver

Implement wall-time pacing that calls explicit deterministic simulation advancement.

- Pause, 1× and 2× controls.
- `Space` pause, `1`/`2` speed shortcuts when not typing.
- Browser tab/page hiding automatically pauses before the next simulation advance.
- Mandatory decisions and game end force pause.
- Catch-up is bounded; returning from a hidden/throttled tab never advances an hour unexpectedly.
- UI animations never determine advancement or completion.
- Debug instant-advance uses an explicit development command, not a faster browser interval.

Test with fake timers and Playwright visibility events where possible.

### 3. Title, new game and exact resume

Create:

- title screen with New Game and Resume when a valid save exists;
- deterministic seed entry/creation path suitable for testing and replay, while normal play may generate a readable seed through approved deterministic/non-gameplay app logic;
- invalid/corrupt/incompatible save explanation and recovery options;
- same-seed replay entry after an ending handoff contract;
- build/version display in an unobtrusive location;
- no account/cloud/slot-management system.

Do not reveal seeded death or opening secrets in normal UI.

### 4. IndexedDB persistence

Use `idb-keyval` behind a project adapter.

Persist:

- current checkpoint;
- previous known-good checkpoint;
- tiny metadata/pointer/preferences separately;
- exact canonical save JSON and compatibility metadata.

Autosave at canonical moments:

- each dawn;
- action start/cancel;
- mandatory decision;
- before and after succession;
- app visibility/page-exit best effort without relying on it as the only save.

Requirements:

- validation before replacing current state;
- fallback to previous checkpoint when current is corrupt;
- explicit failure status without silently starting a new run;
- serialized writes or last-write ordering so old saves cannot overwrite newer state;
- no gameplay change due to storage latency;
- development export/import for bug reproduction.

### 5. Operational top bar

Render projection-driven:

- King portrait/condition, phase, week/day and qualitative prognosis;
- Gold;
- available/total/committed Levies;
- Prestige;
- Claim band and exact value where design permits player self-knowledge;
- Influence;
- pause/1×/2×;
- autosave status and build/seed access.

Use raster icons only, meaningful labels and compact readable hierarchy. Do not turn values into oversized dashboard KPI cards.

### 6. Orders surface

Render exactly two initiative slots with:

- action/target;
- start/completion time;
- progress derived from simulation timestamps;
- resources/collateral/troops locked;
- public/private visibility;
- cancellation loss and confirmation;
- invalidated/fallback/resolved status;
- empty-slot affordance that focuses the legal action surface through a callback, not a duplicated action menu.

Cancellation dispatches one simulation command and cannot refund anything optimistically.

### 7. Chronicle and direct notifications

Implement the chronological feed with filters:

- All;
- Succession;
- War;
- Court;
- Intelligence.

Requirements:

- bounded rendering/virtualization only if evidence shows need;
- readable timestamps and reason/delta entries;
- unread/important marker;
- links/focus callbacks to relevant lord/territory/action when legal;
- routine AI activity remains feed-only;
- direct interruptions follow canonical priority and do not open modal spam;
- no hidden information appears in entries the player should not know.

### 8. Mandatory-decision queue

Render one decision at a time according to frozen priority/order.

- auto-pause;
- trigger and known consequences;
- legal choices;
- target/expiry information;
- no dismissal without choice when mandatory;
- exact focus trap/return behavior;
- queue resumes next decision before simulation;
- browser reload restores the same unresolved decision and choices;
- direct defense and historical Greyfen vote use the same mechanism.

Use the foundation AlertDialog/letter treatment rather than a generic modal.

### 9. Development-only debug surface

Behind an explicit development flag, expose:

- truth versus selected actor knowledge;
- candidate evaluation reasons;
- scheduler queue/sequence IDs;
- seed/PRNG trace;
- Orders/AI Intents/resources/campaigns/events;
- force phase/death;
- advance to next item/day;
- export/import save and command replay;
- run invariants/succession;
- Capital Uncontrolled fixture.

Debug controls must call approved deterministic debug commands and be excluded/disabled in production builds. Never expose future death or hidden truth in the normal interface.

### 10. Application/error boundaries

Add recoverable handling for:

- projection/render error;
- storage failure;
- invalid command rejection;
- incompatible save;
- missing asset warning supplied by asset layer;
- invariant failure in development.

Do not swallow errors and continue with diverged state. Preserve exportable evidence when possible.

## Implementation contract

- Browser/app state is non-authoritative and rebuildable except persisted canonical save bytes.
- One store dispatch path; no component calls reducers directly.
- IndexedDB effects occur outside pure simulation and cannot reorder commands.
- No wall-clock catch-up or hidden-tab progression.
- Debug code is development-only and deterministic.
- Use foundation styling/raster assets; no SVG, icon font or themed dashboard kit.
- Screen-region composition remains flexible for WP-039 integration.

## Acceptance tests

- [ ] New game initializes through the frozen API and Resume restores exact state.
- [ ] Current corrupt save falls back to previous checkpoint with clear UI; no silent restart.
- [ ] Save/reload with active Orders, AI Intent, campaign, pending decision and event produces identical continuation.
- [ ] Hidden tab pauses before further advancement and returning does not catch up.
- [ ] Mandatory decision blocks simulation and survives reload.
- [ ] Top bar/Orders/chronicle never read raw hidden state or duplicate rules.
- [ ] Autosave write ordering cannot let an older snapshot overwrite a newer one.
- [ ] Debug surface is absent/inert in production build.
- [ ] Keyboard controls avoid typing fields and focus behavior passes.
- [ ] Playwright title→new→pause→action checkpoint→reload→resume smoke flow passes using a stub/integrated action callback.
- [ ] Raster/vector prohibition, axe and standard gates pass.
- [ ] Independent critic clears persistence, time-driver and decision risks.
- [ ] Wiki pages are synchronized.

## Required evidence

- save/reload state hash and pending-state trace;
- corrupt-current/previous-fallback test;
- visibility auto-pause Playwright trace;
- decision reload trace;
- autosave ordering test;
- production bundle/debug exclusion proof;
- screenshots at target viewports;
- implementer and critic logs.

## Agent topology

One lead owns store/time/persistence orchestration. It may delegate debug UI or operational component stories to disjoint sub-agents, but the command/time/save path remains under one owner.

The critic should attack stale writes, hidden-tab catch-up, double advancement, component-state authority, decision ordering, corrupt saves, production debug leakage and generic top-bar/dashboard styling.

WP-039 integrates map/politics/forecast regions and resolves app-level screen composition.

## Logging

Create:

- `logs/agents/WP-032/implementer-<name>.md`
- `logs/agents/WP-032/critic-<name>.md`

## Completion handoff

Document store selectors/dispatch API, persistence schema keys, time-driver behavior, shell region contracts, debug flag and integration risks. State integration readiness.
