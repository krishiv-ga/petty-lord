# AGENTS.md

This file governs the entire repository. A nested `AGENTS.md` may narrow rules for its own subtree, but may not weaken determinism, testing, logging, review, visual-direction, or design-authority requirements.

## 1. Read order before doing work

Every agent must read, in order:

1. this file;
2. the assigned file under [`work-packets/`](./work-packets/);
3. [`designer/README.md`](./designer/README.md);
4. every canonical design document named by the packet;
5. [`TECH_STACK.md`](./TECH_STACK.md);
6. [`SKILLS.md`](./SKILLS.md) and any triggered skill;
7. [`wiki.md`](./wiki.md);
8. the latest compacted log in [`logs/compacted/`](./logs/compacted/) when one exists.

The canonical design package under `/designer` is the game-design authority. `TECH_STACK.md` is the engineering and visual-implementation authority. A work packet may narrow scope, but cannot silently override either.

## 2. Work only through work packets

Implementation begins from [`work-packets/INDEX.md`](./work-packets/INDEX.md).

- Execute only the assigned packet and necessary local fixes.
- Respect its dependencies, fan-out wave, owned paths, forbidden paths, acceptance tests, and integration contract.
- Do not opportunistically implement later packets.
- Do not change a locked design rule merely because a different implementation is easier.
- When a packet reveals a genuine design defect, record evidence in the packet log and use `$design-guard`; do not improvise a new rule in code.
- Parallel agents must use separate branches/worktrees and must not edit the same authoritative files.
- The wave integrator, not parallel implementers, updates `work-packets/INDEX.md`, shared compacted logs, shared dependency versions, and cross-packet seams.

## 3. Parallelism is the default

Use the fan-out gates in the packet index aggressively.

- One packet = one isolated branch/worktree.
- Branch naming: `wp/WP-###-short-slug`.
- A packet may spawn sub-agents for independent subproblems if their file ownership is disjoint.
- Never parallelize two tasks that mutate the same state contract, lockfile, root configuration, wiki index, release configuration, or shared barrel file.
- When several sequential changes share the same seam, keep them inside one packet rather than creating a chain of micro-packets.
- Do not begin a later wave until its integration packet is merged and the index explicitly marks the fan-out gate open.

## 4. Implementer, critic, and integrator roles

### Implementer

Owns the packet, makes the change, writes tests, runs required checks, and writes an agent log.

### Critic

Any significant change must receive an independent critic pass. A change is significant when it does any of the following:

- changes authoritative simulation state, scheduler order, PRNG use, save compatibility, succession, politics, AI, war, economy, or balance values;
- changes a major user flow or more than one primary screen region;
- changes build, CI, release, wiki, deployment, or dependency architecture;
- touches more than roughly 200 meaningful lines or more than five production files;
- creates a new abstraction that later packets will depend on.

The critic must inspect the actual diff and test evidence, try to falsify the implementation, and write a separate critic log. Self-review does not count. The critic may propose patches; the implementer remains responsible for resolving or explicitly rejecting every finding with evidence.

### Integrator

Use an integrator when changes cross packet boundaries, alter shared seams, combine two or more parallel branches, change dependency versions, or create merge/conflict risk. The lead agent decides whether an extra integrator is useful inside a packet; wave-level integration packets are always mandatory.

An integrator must not merely merge green branches. It must verify contracts together, run the combined suite, resolve semantic conflicts, compact logs, update the packet index, and state whether the next fan-out gate is open.

## 5. Mandatory logging

Every agent that changes or reviews the repository must create a log under:

`logs/agents/<packet-id>/<role>-<short-name>.md`

Use the format in [`logs/AGENT_LOG_TEMPLATE.md`](./logs/AGENT_LOG_TEMPLATE.md). Logs are evidence, not diaries. Record:

- exact scope and owned paths;
- decisions and assumptions;
- files changed;
- tests/checks with outcomes;
- critic findings and resolutions;
- known risks, deferred work, and follow-up packet IDs;
- commit SHA and PR URL when available.

Do not paste enormous raw terminal output. Summarize it and point to CI artifacts or traces.

At the end of each wave, the integrator writes a compact ChatGPT-facing log under `logs/compacted/` using the compact template and updates `logs/STATUS.md`. Parallel agents never edit the same compacted log.

No packet is complete without its logs.

## 6. Git and review discipline

- Start from the current integrated default branch.
- Keep packet branches focused; do not mix unrelated cleanup.
- Commit all intended changes and leave the worktree clean.
- Open a draft PR for significant work unless the packet explicitly says otherwise.
- PR title begins with the packet ID.
- PR body links the packet, agent log, critic log, tests, screenshots/traces where relevant, and any design amendment.
- Do not force-push over another agent's work.
- Do not amend or rewrite commits owned by another packet.
- Do not merge a packet that lacks acceptance-test evidence.

### GitHub CLI availability

GitHub CLI is available at the machine level. On the current Windows development machine it is installed at:

`C:\Program Files\GitHub CLI\gh.exe`

It is currently authenticated as `krishiv-ga` with `repo` and `workflow` access. Before a write-heavy GitHub operation, run `gh auth status` (or the absolute executable path when `gh` is not on `PATH`) to verify the session is still valid.

Use the machine-level CLI directly for local repository/branch/PR discovery, GitHub Actions workflow dispatch/rerun/log inspection, release operations, and verification when that is the most reliable workflow. Do **not** install or vendor GitHub CLI as a project dependency merely to make it available to agents.

## 7. Deterministic simulation rules

The game is deterministic and replayable.

- Never use `Math.random()` for game outcomes.
- Never use wall-clock time, `Date.now()`, animation completion, React render timing, browser timers, or network timing as authoritative simulation input.
- The simulation advances only through explicit deterministic commands and the canonical scheduler.
- Random draws come from the approved seeded PRNG and are stored/snapshotted where required by the design.
- Authoritative state must be serializable and validated.
- No authoritative game state may live only in React component state, DOM state, animation state, or mutable module globals.
- Pure simulation modules must not import React, browser storage, UI primitives, or asset code.
- Every simultaneous resolution must honor the canonical priority and `sequenceId` rules.
- Save/load must reproduce death, events, battles, intelligence, AI near-ties, and decisions exactly.

## 8. Architecture boundaries

The expected boundaries are:

- `src/sim/` — pure deterministic simulation and rules;
- `src/content/` — validated data definitions and authored content;
- `src/app/` — application orchestration, persistence adapters, and routing;
- `src/ui/` — presentation and interaction only;
- `src/assets/` or `public/assets/` — raster assets and manifests;
- `tests/` — unit, contract, scenario, simulation, browser, and visual tests;
- `wiki-site/` — generated/documentation tooling after bootstrap;
- `logs/` — agent evidence and compacted status;
- `.codex/skills/` — repository-local agent skills.

Do not bypass these boundaries with convenience imports. Shared contracts are owned by integration packets after their first freeze.

## 9. Visual and UI rules

The project must not look like a generic AI-generated SaaS dashboard.

- Do not use Tailwind UI, shadcn default components, MUI, Mantine, Chakra, Bootstrap, a dashboard template, or a pre-themed component kit.
- Use accessible unstyled primitives only where they save behavioral work; the approved default is Radix Primitives without Radix Themes.
- Build the visible system with bespoke CSS Modules, global design tokens, raster art, heraldry, parchment, seals, ribbons, letters, and political-map composition.
- **No SVG assets or SVG icon components in the shipped game.**
- Do not install Heroicons, Lucide, Radix Icons, Tabler Icons, Font Awesome, or an icon font for production UI.
- All icons are transparent raster assets, normally PNG at 1×/2× or carefully compressed WebP where appropriate, rendered through the shared `RasterIcon` component with explicit accessible labels.
- The map is not an SVG. Use a raster map plate/background plus positioned semantic DOM hotspots and CSS/DOM overlays.
- Placeholder icons must also be raster; do not temporarily ship vector icons and promise to replace them later.
- No color-only status. Every state needs text, shape, texture, label, or raster icon reinforcement.
- Ordinary confirm/commit actions are **not** danger actions. Do not encode generic confirmation with danger-red simply because a wax seal or heraldic accent is red. Reserve danger/destructive styling for genuinely destructive, hostile, irreversible-loss, or critical actions. A sealing/commit control should preserve visible separation between its seal and its surrounding surface, typically through parchment/surface fill plus an intentional outline/edge treatment rather than a red-filled container.
- Respect keyboard navigation, reduced motion, WCAG AA contrast, minimum readable type, and visible focus.

Use `$ui-audit` for any significant interface packet.

## 10. Testing and evidence

After WP-000 establishes tooling, the standard gates are expected to include:

- formatting/lint;
- TypeScript typecheck;
- deterministic unit and scenario tests;
- simulation/invariant tests where relevant;
- production build;
- Playwright browser tests for changed user flows;
- visual screenshots for changed UI states;
- accessibility checks for major screens.

Run the narrowest relevant tests during iteration and the packet's full required gate before completion. A critic should attempt an adversarial test, not only repeat the implementer's happy path.

## 11. Wiki and documentation

[`wiki.md`](./wiki.md) is the repository-wide documentation entry point. WP-000 must install maintained wiki tooling rather than invent a custom documentation generator. Agents must update the relevant wiki page in the same packet whenever they change:

- architecture or commands;
- simulation rules or data formats;
- save schema;
- UI component contracts;
- agent workflow;
- release/deployment procedure;
- debugging or testing procedure.

Canonical design changes must update `/designer` first, then the wiki summary. The wiki may explain the design; it may not silently replace it.

## 12. Releases

Major checkpoints use GitHub Releases according to [`RELEASES.md`](./RELEASES.md). Releases are manual, deliberate integration events—not automatic on every merge.

Only a release/integration packet may create a tag or GitHub Release. It must include green gates, a compacted log, known issues, build artifact, version consistency, and exact commit SHA.

Use `$release` for checkpoint work.

## 13. Repository skills

Use repository-local skills when their trigger matches. The index is [`SKILLS.md`](./SKILLS.md). Important examples:

- `$packet` — execute a work packet;
- `$critic` — adversarially review significant work;
- `$integrate` — combine parallel packets;
- `$hunt` — find gameplay/design exploits rather than technical bugs;
- `$tune` — tune gameplay values with simulation evidence;
- `$bugfix` — make a direct technical bugfix with reproduction and regression test;
- `$ui-audit` — enforce visual, interaction, raster-icon, and accessibility standards;
- `$design-guard` — handle evidence that a locked rule must change;
- `$release` — prepare a checkpoint release;
- `$wiki-sync` — synchronize maintained documentation.

## 14. Completion report

A packet completion report must state:

1. what changed;
2. acceptance tests and results;
3. critic status and unresolved findings;
4. files/logs/PR produced;
5. risks and deferred items;
6. whether the packet is integration-ready;
7. whether the next fan-out gate is open (integrators only).
