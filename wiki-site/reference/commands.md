# Command reference

| Command | Purpose |
|---|---|
| `pnpm dev` | Run the Vite development server. |
| `pnpm build` | Typecheck and build the production game. |
| `pnpm check` | Check formatting, imports and lint with Biome. |
| `pnpm typecheck` | Check application and tooling TypeScript projects. |
| `pnpm test` | Run unit/configuration tests. |
| `pnpm test:sim` | Run the headless simulation suite. |
| `pnpm test:e2e` | Run the Chromium Playwright suite. |
| `pnpm storybook` | Run Storybook on port 6006. |
| `pnpm build:storybook` | Build static Storybook. |
| `pnpm wiki:dev` | Run the VitePress wiki locally. |
| `pnpm wiki:build` | Build the static wiki. |
| `pnpm wiki:check` | Build the wiki and fail on broken internal links. |

The full checkpoint gate is the same finite surface used by CI and the manual release workflow:
frozen install, check, typecheck, unit contracts, headless simulation, production build, Storybook,
wiki and Chromium smoke. WP-019 additionally runs the focused foundation Storybook Playwright suite.
