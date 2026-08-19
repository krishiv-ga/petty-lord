# WP-030 — Raster Map and Territory UI

- **Status:** Blocked by WP-029
- **Wave:** 3
- **Execution:** Parallel-safe within Wave 3
- **Depends on:** WP-029
- **May run with:** WP-031, WP-032, WP-033 and WP-034 when its asset prerequisite is met
- **Must not run with:** WP-039 or any Wave 4 packet
- **Primary skill:** `$packet`
- **Required specialist skills:** `$ui-audit`, `$critic`
- **Critic:** Required
- **Integrator:** WP-039
- **Release impact:** Playable beta candidate

## Objective

Build the central political map as a high-resolution raster plate with semantic DOM territory controls and CSS/DOM state overlays. It must make geography, legal ownership, occupation, campaigns, adjacency and the Capital immediately legible without SVG, canvas or tactical-map complexity.

## Canonical inputs

- [`TECH_STACK.md`](../TECH_STACK.md), especially raster and map contract
- [`designer/world-and-actors.md`](../designer/world-and-actors.md)
- [`designer/war-and-occupation.md`](../designer/war-and-occupation.md)
- [`designer/interface-content-and-production.md`](../designer/interface-content-and-production.md)
- UI foundation from WP-012/WP-019
- commands/projections/assets contract frozen by WP-029

## Owned paths

Expected ownership:

- `src/ui/game/map/**`
- `src/ui/game/territories/**`
- map-specific stories/fixtures under those directories;
- map-specific tests under `tests/ui/map/**` and `tests/e2e/map/**`;
- approved map placeholder raster files under `public/assets/placeholders/map/**` only;
- `wiki-site/development/visual-language.md` map subsection or a disjoint `wiki-site/development/raster-map.md` page;
- `logs/agents/WP-030/**`.

Do not edit the app shell/store, lord rail/inspector/actions, forecast/onboarding/ending, production asset manifest, simulation, root configs or shared navigation.

## Deliverables

### 1. Raster map plate renderer

Implement a responsive renderer for one canonical raster map plate.

- Preserve authored aspect ratio and avoid stretching.
- Support 1×/2× or manifest-selected sources.
- Fit cleanly at 1280×720 and 1440×900 within the main frame.
- Show an explicit fallback/warning when the asset is absent.
- Do not use inline SVG, SVG background, canvas, CSS masks sourced from SVG or runtime path generation.

The base plate may contain painterly geography, borders, roads and decorative labels. Authoritative dynamic state remains semantic DOM above it.

### 2. Semantic territory hotspots

Render all seven territories as positioned data-driven interactive elements.

Each hotspot must:

- be keyboard focusable and operable;
- have a visible focus treatment independent of color;
- expose accessible territory, legal lord and physical-control text;
- use coordinates/bounds from validated asset/content data;
- show selected/hovered/related adjacency states;
- remain usable if texture/background fails;
- avoid tiny click targets and overlapping inaccessible regions.

Use buttons or another correct semantic element. Do not use an image map that loses focus/accessible state.

### 3. Territory state overlays

Display through raster emblems plus CSS/DOM treatments:

- legal owner crest;
- physical occupation banner/controller;
- Capital Royal/Occupied/Uncontrolled state;
- Tax Strain, Unrest and other canonical conditions;
- active garrison or unavailable state where the projection exposes it;
- selected target and valid/invalid action targeting;
- dispossession/denial without implying legal title transfer.

No state may depend on color alone. Avoid icon clutter by prioritizing severe/current information and exposing details on selection.

### 4. Campaign and adjacency overlays

Implement campaign and route emphasis without SVG/canvas:

- positioned/rotated DOM line segments, raster line assets or prepared overlay plates;
- origin/target markers and arrival/progress state;
- adjacency highlighting from canonical topology;
- battle/occupation transition emphasis;
- reduced-motion alternative;
- no implication of free army movement.

The UI shows discrete campaign Orders, not animated troops wandering across a strategic map.

### 5. Territory summary surface

Create a map-owned compact summary/tooltip/popover that exposes only projection data:

- legal lord and controller;
- Wealth/income;
- exact or banded Levies according to player knowledge;
- Fortification;
- legal trait and whether denied by occupation;
- garrison/control requirements;
- conditions and expiries;
- adjacency;
- reason an action target is legal/illegal.

The full political/action inspector remains WP-031. This surface should support map comprehension without duplicating it.

### 6. Interaction states and events

Wire the map only to frozen application callbacks/projections:

- select territory;
- select action target when a workflow is active;
- cancel/escape targeting;
- focus a territory from an external selection request;
- announce authoritative changes such as occupation/Uncontrolled Capital through the shared live-region contract;
- render pending campaign state and resolved transitions.

Do not call simulation reducers directly from leaf components.

### 7. Stories and browser tests

Provide Storybook/browser fixtures for:

- all seven legal owners;
- Westmarch occupied by player;
- player dispossessed from Greyfen;
- Capital Royal, Occupied and Uncontrolled;
- one and multiple campaigns;
- stale/unknown military information;
- missing map plate/crest/condition icon;
- keyboard-only selection/targeting;
- reduced motion;
- 1280×720 and 1440×900;
- long localized-style territory/lord labels even though launch language is English.

## Implementation contract

- No SVG or canvas anywhere in owned source/assets.
- Map is a projection/command client, never authoritative state.
- Asset dimensions/coordinates come from manifest/content rather than magic values scattered across components.
- Dynamic overlays remain semantic DOM.
- Legal ownership and controller are always visually/textually distinct.
- Campaign animation cannot control simulation completion.
- Use foundation components/tokens; do not invent a separate visual system.

## Acceptance tests

- [ ] All seven territories can be reached, selected and targeted by keyboard.
- [ ] Map stays usable at both target viewports and when assets fail.
- [ ] Legal owner, occupier and Capital state are never conflated.
- [ ] Westmarch occupation communicates benefit/cost context without implying annexation.
- [ ] Campaign/adjacency overlays use no SVG/canvas and do not imply free movement.
- [ ] Exact versus banded military data follows projection input.
- [ ] Reduced-motion and no-color-only-state checks pass.
- [ ] Project-authored owned paths contain no `.svg`, `<svg>`, vector icon import or icon font.
- [ ] Storybook, Playwright visual/keyboard, axe and standard gates pass.
- [ ] `$ui-audit` and independent critic findings are resolved.
- [ ] Wiki map documentation is synchronized.

## Required evidence

- screenshots at both target viewports for canonical map states;
- keyboard traversal/video or trace;
- missing-asset fallback screenshot;
- vector-prohibition search;
- accessibility results;
- implementer/auditor/critic logs.

## Agent topology

One lead owns map geometry and component API. Disjoint sub-agents may handle hotspot accessibility tests and campaign overlays, but they must use the same coordinate/manifest contract.

The UI auditor and critic should challenge scanability, target size, legal/control distinction, clutter, low-height layout, asset failure and vector leakage.

WP-039 integrates external selection, action inspector, shell sizing and production assets.

## Logging

Create:

- `logs/agents/WP-030/implementer-<name>.md`
- `logs/agents/WP-030/auditor-<name>.md`
- `logs/agents/WP-030/critic-<name>.md`

## Completion handoff

Document map component API, coordinate/asset requirements, screenshots, known layout risks and shell/inspector integration needs. State integration readiness.
