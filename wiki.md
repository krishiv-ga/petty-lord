# The Petty Lord Repository Wiki

This file is the repository-wide documentation entry point. It is intentionally at the repository root so humans and agents can find the operational knowledge base before any tooling exists.

The canonical game design remains under [`designer/`](./designer/). The wiki explains how the design is implemented, tested, operated, and released; it does not silently replace locked design rules.

## Wiki tooling

WP-000 must install **VitePress** as maintained wiki tooling under `wiki-site/`.

Requirements:

- do not invent a custom documentation generator;
- use Markdown as the source format;
- provide `pnpm wiki:dev`, `pnpm wiki:build`, and `pnpm wiki:check`;
- validate internal links in CI;
- build the wiki as a static artifact;
- keep the wiki tooling isolated from the shipped game bundle;
- allow the wiki to be deployed under `/wiki/` or published as a release artifact;
- expose edit links or source paths where practical;
- preserve readable raw Markdown in GitHub.

This root file remains the durable entry point even after VitePress is installed. The VitePress landing page must link back to it or reproduce its navigation without creating a second contradictory hierarchy.

## Required wiki structure

WP-000 may adjust filenames to match VitePress conventions, but the information architecture must include:

```text
wiki-site/
├── index.md                  # project and navigation overview
├── getting-started.md        # install, commands, development loop
├── architecture/
│   ├── overview.md
│   ├── deterministic-sim.md
│   ├── scheduler-and-rng.md
│   ├── content-and-schemas.md
│   ├── persistence.md
│   └── ui-and-assets.md
├── game-systems/
│   ├── time-economy-orders.md
│   ├── politics-and-support.md
│   ├── claim-church-succession.md
│   ├── war-and-occupation.md
│   ├── ai-knowledge-events.md
│   └── endings.md
├── development/
│   ├── work-packets.md
│   ├── agent-workflow.md
│   ├── testing.md
│   ├── debugging.md
│   ├── balance-and-paperplay.md
│   └── visual-language.md
├── operations/
│   ├── logging.md
│   ├── releases.md
│   ├── deployment.md
│   └── troubleshooting.md
└── reference/
    ├── commands.md
    ├── state-schema.md
    ├── content-schema.md
    ├── action-catalog.md
    └── glossary.md
```

## Source authority

Use this precedence:

1. [`designer/README.md`](./designer/README.md) and its canonical files — gameplay design;
2. [`TECH_STACK.md`](./TECH_STACK.md) — engineering, UI, and asset implementation;
3. [`AGENTS.md`](./AGENTS.md) — agent execution rules;
4. [`work-packets/INDEX.md`](./work-packets/INDEX.md) and packet files — current delivery plan;
5. wiki pages — maintained explanation and onboarding;
6. code comments — local implementation detail.

When sources conflict, fix the lower-authority source in the same packet. Do not merely note the contradiction.

## Documentation ownership

Every packet names the wiki pages it owns or must update.

- Parallel implementers may edit only disjoint wiki pages.
- Wave integrators own shared navigation, root indexes, architecture overviews, and cross-links.
- Canonical design amendments must update `/designer` first and use `$design-guard`.
- Architecture, schema, commands, tooling, release, and debugging changes are incomplete until the wiki is synchronized.
- Use `$wiki-sync` at integration checkpoints.

## What belongs in the wiki

Put information here when it helps a new agent or maintainer answer one of these questions without reading the whole codebase:

- How does the simulation advance and stay deterministic?
- Where is authoritative state stored?
- How are content definitions validated?
- How do support, Church, war, AI, and succession actually resolve?
- How do I run, test, debug, simulate, and inspect a save?
- Which files may a packet safely own in parallel?
- How are raster assets named, sized, loaded, and audited?
- How are gameplay exploits hunted and values tuned?
- How are releases created and verified?
- What is currently known to be incomplete or risky?

Do not duplicate every function or type. Link to source for details and explain stable contracts, invariants, and workflows.

## Visual documentation

UI and art pages should include:

- representative screenshots from Storybook or Playwright;
- exact viewport and build/commit reference;
- raster asset inventory and missing placeholders;
- hierarchy and interaction notes;
- keyboard and reduced-motion behavior;
- examples of rejected generic/vibe-coded patterns;
- before/after captures when a visual audit changes the system.

Do not embed SVG diagrams. Use Markdown, Mermaid only if it is rendered by maintained VitePress tooling and does not become a production game asset, or raster screenshots/diagrams. Production icons and game UI remain raster-only.

## Wiki checks

The installed tooling must check at minimum:

- VitePress build succeeds;
- internal links resolve;
- no orphaned required page;
- no broken source references;
- code snippets marked executable are validated where practical;
- navigation includes every required top-level page;
- current compacted log and release policy are linked.

The wiki check may use maintained packages or VitePress-supported plugins. Do not write a bespoke crawler unless all maintained options are demonstrably insufficient and the decision is logged.

## Current entry points

- [Canonical design](./designer/README.md)
- [Technical stack](./TECH_STACK.md)
- [Agent rules](./AGENTS.md)
- [Agent skills](./SKILLS.md)
- [Work-packet index](./work-packets/INDEX.md)
- [Logging contract](./logs/README.md)
- [Release policy](./RELEASES.md)

Some links will become live as the orchestration files are added. WP-000 is responsible for making the complete documentation surface buildable and testable.
