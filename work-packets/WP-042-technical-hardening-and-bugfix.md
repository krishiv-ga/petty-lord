# WP-042 — Technical Hardening, Performance, Persistence and Direct Bugfix Pass

- **Status:** Blocked by WP-039
- **Wave:** 4
- **Execution:** Parallel-safe within Wave 4; serialize fixes that share authoritative seams
- **Depends on:** WP-039
- **May run with:** WP-040, WP-041, WP-043
- **Must not run with:** WP-049
- **Primary skill:** `$bugfix`
- **Required specialist skills:** `$critic`, `$packet`
- **Critic:** Required
- **Integrator:** WP-049
- **Release impact:** Final release candidate

## Objective

Find, reproduce and fix technical defects in the integrated beta; harden determinism, scheduler/state invariants, persistence, browser lifecycle, performance, error recovery, build/deployment and cross-browser behavior without tuning gameplay or redesigning the interface.

## Canonical inputs

- beta build and WAVE-03 technical known issues;
- all logs/traces from WP-039;
- frozen simulation/save/app contracts;
- [`TECH_STACK.md`](../TECH_STACK.md);
- [`RELEASES.md`](../RELEASES.md).

## Owned paths

Expected ownership:

- technical fixes under `src/sim/**`, `src/app/**`, `src/persistence/**` and non-visual `src/assets/**` loading code;
- unit/scenario/simulation/e2e/performance/migration tests;
- development diagnostics and error boundaries;
- build/deployment config only when a reproduced defect requires it and no other Wave 4 packet owns the same file;
- `wiki-site/development/testing.md`, `wiki-site/development/debugging.md`, `wiki-site/operations/troubleshooting.md`;
- `logs/agents/WP-042/**`.

Do not edit gameplay balance/content values, canonical narrative copy, UI visual composition/styles, production image pixels, version/tags/releases or shared status. Hand visual/accessibility defects to WP-041, copy defects to WP-043 and gameplay exploits to WP-040.

## Internal workflow

1. Parallel read-only investigators reproduce independent bug families.
2. One lead triages and assigns ownership.
3. Each accepted bug uses `$bugfix`: failing reproduction first, smallest patch, regression test, relevant suite.
4. Shared scheduler/state/save fixes remain serialized under one owner.
5. Independent critic attacks the hardened combined branch.

## Investigation targets

### Determinism and scheduler

- differing outcomes by time-advance chunk size;
- same-time priority/`sequenceId` drift;
- event/decision/battle/death double resolution;
- PRNG draw order changed by UI/debug paths;
- `Math.random`, wall clock or unstable iteration order entering gameplay;
- save/reload replay mismatch;
- recursive scheduling or zero-time infinite loop;
- phase/death off-by-one;
- cancellation/invalid target softlock.

### State and save integrity

- non-serializable or non-finite state;
- missing schema/content/build compatibility checks;
- stale write overwriting newer autosave;
- active Order/AI Intent/campaign/decision/event not restored exactly;
- current/previous checkpoint fallback failure;
- migration corruption;
- import/export mutation or prototype pollution risk;
- excessive save size or write frequency;
- old debug fixtures accepted as production saves.

### Browser lifecycle and input

- hidden-tab progression/catch-up;
- multiple time drivers after remount/HMR/resume;
- keyboard shortcuts firing in fields;
- lost input/focus after state transition;
- browser back/refresh behavior;
- storage unavailable/quota failure;
- page crash without exportable state;
- mobile/narrow layout is out of scope, but browser zoom and target desktop sizes must not break app logic.

### Performance and memory

- unnecessary whole-screen rerenders each hour;
- unbounded chronicle, trace or debug logs;
- expensive projections recomputed without need;
- batch simulation memory leak;
- large raster decode/preload spike;
- layout shift from images;
- Storybook/debug code in production bundle;
- source maps or artifacts configured unsafely;
- production build size regression with no value.

### AI/content/runtime safety

- invalid content reference causing crash;
- AI starts illegal/unaffordable duplicate Intent;
- stale scheduled item targets removed state;
- effect routed twice or not at all;
- event choice with no legal outcome;
- succession/ending missing on an invariant-valid state;
- no-candidate/sole-candidate/Capital contradiction crash;
- knowledge projection accidentally sharing mutable authoritative object.

### Deployment and release readiness

- wrong static base paths;
- direct deep-link/reload failure where app routing expects support;
- asset caching serving incompatible build/save metadata;
- release artifact differs from tested build;
- CI/local command mismatch;
- browser smoke failure in supported targets.

## Deliverables

### 1. Reproduction inventory

For every candidate defect record:

- build SHA/version;
- seed/save/replay or browser steps;
- expected and actual behavior;
- reproducibility rate;
- severity and user impact;
- owner/handoff;
- regression-test plan.

Do not fix vague symptoms without isolating the failure.

### 2. Minimal bugfix patches

Each fix must:

- add a failing regression first or in the same commit;
- address root cause rather than add a timer/retry/random guard;
- preserve deterministic contracts;
- avoid broad refactors unless the existing seam itself causes repeated bugs;
- run narrow and full relevant tests;
- update wiki when workflow/schema/behavior changes;
- record save-schema/migration impact explicitly.

### 3. Performance profile and bounded fixes

Measure representative states:

- Stable idle at 1×/2×;
- dense Deathbed with chronicle/forecast;
- save/reload;
- production initial load;
- batch headless simulations.

Use browser/devtools/Playwright traces and build reports. Optimize measured bottlenecks only. Do not create a custom performance dashboard or premature complex cache.

### 4. Cross-browser smoke

At minimum verify current stable Chromium, Firefox and WebKit through Playwright for:

- title/new/resume;
- pause/speed;
- one action and mandatory decision;
- save/reload;
- death/ending accelerated fixture;
- raster asset loading;
- production build.

Fix technical discrepancies or document a specific release blocker. Do not expand scope to mobile/browser versions the stack does not support.

### 5. Failure recovery

Ensure meaningful recoverability for:

- invalid command;
- content/schema mismatch;
- storage failure/quota;
- corrupt current save with valid previous checkpoint;
- missing asset;
- invariant failure in development;
- unrecoverable production error with copyable seed/version and optional save export.

Never silently continue with partially mutated state.

### 6. Combined technical critic

A fresh critic attempts:

- refresh/reload during every lifecycle edge;
- hidden tab and rapid speed toggles;
- repeated save/import/export;
- concurrent autosave triggers;
- malformed inputs/save files;
- long accelerated run and many new-game/replay cycles;
- production bundle/debug leakage;
- cross-browser end flow.

Resolve all P0/P1 findings and explicitly disposition lower findings for WP-049.

## Implementation contract

- Technical fixes do not alter intended route balance or player-facing copy.
- Never fix nondeterminism by persisting wall-clock timing or adding unseeded randomness.
- Never catch and ignore invariant failures.
- Do not add retries that can double-resolve simulation commands.
- New dependencies require integrator approval and evidence; do not independently churn the lockfile during parallel work.
- Performance instrumentation remains bounded/development-only.
- Preserve pure simulation/browser boundary.

## Acceptance tests

- [ ] Every accepted bug has deterministic/browser reproduction and regression test.
- [ ] Same-seed uninterrupted/save-reload/chunked/replay hashes match across supported flows.
- [ ] Scheduler/decision/death/campaign stress tests have no double resolve or softlock.
- [ ] IndexedDB current/previous fallback and concurrent-write ordering pass under fault injection.
- [ ] No hidden-tab catch-up or duplicate time driver exists.
- [ ] Representative production performance has no known release-blocking bottleneck or unbounded memory/log growth.
- [ ] Chromium/Firefox/WebKit smoke suite passes.
- [ ] Debug/Storybook/test-only code and hidden truth are absent from production exposure.
- [ ] Build/static deployment and release artifact smoke pass.
- [ ] Independent critic clears P0/P1 technical findings.
- [ ] Standard gates and wiki sync pass.

## Required evidence

- bug inventory and handoff matrix;
- regression-test links per fixed bug;
- determinism/save hashes;
- storage fault-injection results;
- performance/build-size before/after;
- cross-browser traces;
- production debug exclusion proof;
- implementer/investigator/critic logs.

## Agent topology

Parallelize read-only investigation by subsystem. One technical lead owns shared scheduler/state/save patches and merge order. Independent bugfixes in disjoint modules may use separate branches, but the packet lead integrates and reruns the combined suite before critic review.

## Logging

Create as applicable:

- `logs/agents/WP-042/investigator-determinism-<name>.md`
- `logs/agents/WP-042/investigator-persistence-<name>.md`
- `logs/agents/WP-042/investigator-browser-performance-<name>.md`
- `logs/agents/WP-042/implementer-<name>.md`
- `logs/agents/WP-042/critic-<name>.md`

## Completion handoff

Provide fixed/deferred/handoff bug matrix, schema/migration status, performance/cross-browser evidence, remaining technical release blockers and integration readiness for WP-049.
