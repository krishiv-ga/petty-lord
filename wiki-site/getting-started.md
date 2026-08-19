# Getting started

## Requirements

- Node.js 24 LTS; `.node-version` pins the revision verified by CI.
- pnpm 11.19.0 through Corepack and the `packageManager` field.

## First run

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Use `pnpm check`, `pnpm typecheck`, `pnpm test`, `pnpm test:sim` and `pnpm build` before handing off a
change. Browser, Storybook and wiki commands are listed in the [command reference](./reference/commands.md).

Game implementation is packet-gated. Read the [work-packet workflow](./development/work-packets.md)
before changing production paths.
