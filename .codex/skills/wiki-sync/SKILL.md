---
name: wiki-sync
description: Synchronize The Petty Lord's maintained VitePress wiki after architecture, schema, commands, gameplay implementation, testing, agent workflow, deployment, or release changes while preserving source-authority order.
---

# Synchronize the Wiki

## Source authority

Read `wiki.md` and use this order:

1. canonical `/designer` gameplay design;
2. `TECH_STACK.md` engineering/UI contract;
3. `AGENTS.md` agent process;
4. integrated work-packet contracts and code;
5. wiki explanation;
6. local code comments.

Fix lower-authority contradictions. Never use the wiki to silently override design or implementation.

## Scope

Identify exactly which pages the packet owns. Parallel agents edit disjoint pages; integration packets own navigation, landing pages, cross-links and shared architecture summaries.

Update documentation when a packet changes:

- commands/setup;
- architecture/dependency direction;
- deterministic scheduler/RNG;
- content/state/save schema;
- game-system implementation;
- UI/raster asset contract;
- debugging/testing/balance workflow;
- agent process/logging;
- deployment/release/known issues.

Do not duplicate every type/function. Explain stable contracts, invariants, workflows, examples and source links.

## Tooling

Use the VitePress and maintained link-check tooling installed by WP-000. Do not create a custom documentation generator, crawler or deployment service.

Keep raw Markdown readable in GitHub. Production game assets remain raster-only; wiki-only Mermaid/diagrams are allowed only under the root wiki contract and never become game UI assets.

## Verify

Run the documented wiki build/check and inspect:

- internal links;
- navigation/orphan pages;
- source references;
- current commands;
- code snippets/examples;
- screenshots with viewport/build SHA;
- latest compacted log and release links;
- no contradictory stale instructions.

## Log

Record pages changed, authority sources, build/link results and any intentionally deferred page in the packet log. An integration packet updates shared navigation and release/status references only after the integrated SHA is frozen.
