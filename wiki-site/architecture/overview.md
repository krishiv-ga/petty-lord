# Architecture overview

The client-only application has five primary boundaries: `src/sim` for pure deterministic rules,
`src/content` for validated authored data, `src/app` for orchestration and persistence adapters,
`src/ui` for presentation, and `src/assets`/`public/assets` for raster asset contracts and files.

WP-000 freezes commands and aliases but intentionally implements no game domain. WP-010, WP-011 and
WP-012 establish the first simulation, content and UI contracts in disjoint paths.

See [deterministic simulation](./deterministic-sim.md), [content and schemas](./content-and-schemas.md)
and [UI and assets](./ui-and-assets.md).
