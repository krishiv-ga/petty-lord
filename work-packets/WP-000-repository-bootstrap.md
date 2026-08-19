# WP-000 — Repository Bootstrap, Tooling, Wiki, CI, Logging and Releases

- **Status:** Ready — only legal starting packet
- **Wave:** 0
- **Execution:** **Serial**
- **Depends on:** None
- **May run with:** Nothing
- **Must not run with:** Every other packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$wiki-sync`, `$critic`
- **Critic:** Required
- **Integrator:** The lead agent performs the final bootstrap integration after independent criticism
- **Release impact:** Establishes release tooling; does not publish a checkpoint release

## Objective

Turn the design-only repository into one reproducible, tested, documented application workspace whose toolchain and path boundaries are stable enough for three agents to begin Wave 1 in parallel.

This packet deliberately combines all mutually dependent bootstrap work. Do not split package setup, CI, wiki, release workflow, Storybook, or root contracts across concurrent agents.

## Canonical inputs

- [`AGENTS.md`](../AGENTS.md)
- [`TECH_STACK.md`](../TECH_STACK.md)
- [`wiki.md`](../wiki.md)
- [`RELEASES.md`](../RELEASES.md)
- [`designer/README.md`](../designer/README.md)
- [`designer/interface-content-and-production.md`](../designer/interface-content-and-production.md)

## Owned paths

WP-000 may create or modify all bootstrap/shared paths, including:

- `package.json`, `pnpm-lock.yaml`, `.npmrc`, `.node-version` or equivalent;
- `tsconfig*.json`;
- Vite, Vitest, Playwright, Storybook, Biome and VitePress config;
- `.github/workflows/**` and repository templates relevant to packets/releases;
- `.gitignore`, `.editorconfig`, public entry files;
- initial `src/**` directory skeleton and non-domain smoke app;
- initial `tests/**` smoke fixtures;
- `.storybook/**`;
- `wiki-site/**`;
- root `README.md`;
- `logs/agents/WP-000/**`, `logs/compacted/WAVE-00.md`, `logs/STATUS.md`;
- `work-packets/INDEX.md` status only after critic clearance;
- minor corrections in orchestration docs required to make commands truthful.

## Forbidden scope

Do not implement canonical gameplay systems, starting values, action logic, AI behavior, succession, war, or final screen composition.

Do not:

- create a backend, account system, API, telemetry, cloud save, database server, SSR framework, canvas engine, game engine, Tailwind setup, generic UI kit, vector icon dependency, or custom wiki/release framework;
- create production art;
- choose a final game font or art direction beyond preserving the contract;
- alter locked game design to fit a template.

## Deliverables

### 1. Reproducible application workspace

Create a single pnpm application using the exact approved stack in `TECH_STACK.md`.

- Pin Node 24 LTS expectations and the pnpm package-manager version.
- Pin exact direct dependency versions and commit one lockfile.
- Install all dependencies already approved for later waves so parallel agents do not race on the lockfile: React/Vite/TypeScript, Zustand, Zod, pure-rand, idb-keyval, approved Radix Primitives, Motion, Vitest, Playwright, axe integration, Storybook, Biome and VitePress.
- Avoid speculative packages.
- Add path aliases that preserve the intended `app`, `sim`, `content`, `ui`, `assets` and `tests` boundaries.

### 2. Stable command surface

Provide and document working commands equivalent to:

- `pnpm dev`
- `pnpm build`
- `pnpm check`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:sim`
- `pnpm test:e2e`
- `pnpm storybook`
- `pnpm build:storybook`
- `pnpm wiki:dev`
- `pnpm wiki:build`
- `pnpm wiki:check`

A command may be a harmless empty-suite/smoke gate at this stage, but it must run, fail correctly, and be ready for later packet tests without renaming.

### 3. Minimal application shell

Create a non-generic smoke screen proving React, CSS Modules, routing/state entry, fonts fallback, reduced-motion support and production build.

- It may show the title and links to design/work packets.
- It must not resemble a dashboard template.
- No SVG, icon font, vector icon library or emoji-as-icon.
- Do not create final game UI components that WP-012 will own.

Create directory ownership README files where a new parallel agent could otherwise misunderstand a boundary.

### 4. Test and browser baseline

Configure:

- Vitest with a smoke unit test and a separate simulation test project or stable pattern;
- Playwright with Chromium as the mandatory local/CI smoke browser and room for later Firefox/WebKit release gates;
- screenshot/trace retention on failure;
- axe integration available but not yet required on an empty screen;
- Storybook React+Vite with one text-only smoke story;
- production and Storybook builds.

Do not write a custom test runner or report dashboard.

### 5. VitePress wiki

Install VitePress under `wiki-site/` and implement the information architecture in [`wiki.md`](../wiki.md).

- Use maintained link-check tooling or VitePress-supported validation; do not invent a crawler.
- Populate pages with truthful bootstrap information and clearly marked future sections linked to packet owners.
- Add root and sidebar navigation.
- Link canonical design rather than duplicating it wholesale.
- Build the wiki independently of the game bundle.
- Make `wiki:check` validate build and links.

### 6. CI and artifact workflow

Create maintained GitHub Actions workflows that:

- install the pinned Node/pnpm versions with caching;
- run check, typecheck, unit/simulation smoke tests, game build, Storybook build and wiki check;
- run a minimal Playwright smoke test with browser caching/install strategy;
- upload useful failure traces/screenshots and successful static build artifacts;
- cancel superseded runs for the same branch when safe;
- expose concise job names later packets can treat as required gates.

Keep CI deterministic and free of network-dependent gameplay tests.

### 7. Manual checkpoint release workflow

Implement the release contract from `RELEASES.md` using maintained GitHub-supported actions/CLI.

- `workflow_dispatch` only;
- explicit version and prerelease inputs;
- full checkpoint gate before tagging;
- annotated tag and GitHub Release;
- production build, wiki build or link, compact log, test summary, known-issues file and checksums as artifacts;
- clear failure if tag/version already exists;
- no npm publication and no automatic release on every merge.

Test the workflow statically and, where feasible, through a dry-run path that cannot publish a tag.

### 8. Agent/review ergonomics

Add pull-request and issue templates only when they directly reinforce packet ID, log, critic and test evidence. Do not create process bureaucracy unrelated to this four-day build.

Verify Codex can discover root `AGENTS.md` and `.codex/skills/**` from a fresh checkout.

### 9. Gate opening

After implementation and independent critic approval:

- write `logs/compacted/WAVE-00.md`;
- update `logs/STATUS.md` with exact integrated revision;
- mark WP-000 Integrated and WP-010/011/012 Ready in `work-packets/INDEX.md`;
- state explicitly that Wave 1 fan-out is open.

## Acceptance tests

- [ ] Fresh clone with documented Node/pnpm versions installs from the lockfile without changes.
- [ ] Every stable command listed above exists and returns the expected status.
- [ ] `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm test:sim`, `pnpm build`, `pnpm build:storybook`, `pnpm wiki:check` and the Playwright smoke test pass.
- [ ] CI mirrors local commands and uploads expected artifacts.
- [ ] Manual release workflow has explicit safe inputs and cannot accidentally release on push.
- [ ] VitePress wiki navigation and internal links build successfully.
- [ ] Game and Storybook source contain no SVG files, inline `<svg>`, icon-font setup, Heroicons/Lucide/Radix Icons imports, Tailwind, shadcn, or generic themed UI kit.
- [ ] No gameplay outcome or authoritative state has been implemented in React/component state.
- [ ] Root README points to design, packet index, agent rules, skills, stack, wiki, logs and releases.
- [ ] Agent log and independent critic log are complete.
- [ ] WAVE-00 compacted log and status/index gate updates are committed last.

## Required evidence

- clean-install output and lockfile-diff check;
- all command results;
- CI workflow links or local action validation evidence;
- one Playwright smoke trace/screenshot;
- game/Storybook/wiki build artifact list;
- release-workflow dry-run/static validation;
- repository search proving prohibited vector/icon dependencies are absent;
- implementer and critic logs.

## Agent topology

One lead implementer owns the packet. It may delegate research or isolated config review, but all root configuration changes remain serialized in the lead branch.

Use one independent critic with emphasis on:

- version/tool compatibility;
- accidental custom tooling;
- CI/release safety;
- command parity;
- vector/icon or generic-UI leakage;
- path ownership needed for Wave 1.

The lead resolves findings, performs final integration, and alone opens the fan-out gate.

## Logging

Create:

- `logs/agents/WP-000/implementer-<name>.md`
- `logs/agents/WP-000/critic-<name>.md`
- `logs/compacted/WAVE-00.md`

The final commit updates `logs/STATUS.md` and `work-packets/INDEX.md`.

## Completion handoff

WP-000 is complete only when a fresh agent can clone the repository, run the documented commands, understand path ownership, and begin WP-010, WP-011 and WP-012 concurrently without changing shared tooling.
