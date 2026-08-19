# Architecture overview

The client-only application has five primary boundaries: `src/sim` for pure deterministic rules,
`src/content` for validated authored data, `src/app` for orchestration and persistence adapters,
`src/ui` for presentation, and `src/assets`/`public/assets` for raster asset contracts and files.

WP-019 integrates the Wave 1 simulation, content and UI foundations. `src/contracts` is the narrow
public seam for Wave 2: stable IDs, validated immutable `GameContent`, foundation state/save
compatibility, scheduler/module protocol, read-only UI projections and semantic raster slots. The
application may orchestrate those boundaries; simulation, content and UI remain unable to reach
backward across them.

Dependency direction is:

```text
canonical content ─┐
pure simulation ───┼─> src/contracts ─> src/app
raster descriptors ┘                    └─> read-only UI projections
```

Wave 2 packets import the smallest relevant module under `src/contracts/`; they must not bypass the
registry, create a second clock/save envelope, or make presentation consume mutable simulation state.

See [deterministic simulation](./deterministic-sim.md), [content and schemas](./content-and-schemas.md)
and [UI and assets](./ui-and-assets.md).
