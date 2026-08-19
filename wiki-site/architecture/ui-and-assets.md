# UI and raster assets

React presentation remains separate from simulation. Foundation stories consume fixture projections,
not hidden or authoritative game state, and components expose callbacks rather than mutating the
simulation.

## Source layout

| Path | Contract |
|---|---|
| `src/ui/foundation/` | Political/material components, composition fixtures, tokens and scoped base styles |
| `src/ui/primitives/` | Project-owned behavior wrappers and low-level controls |
| `src/ui/fixtures/` | Realistic, non-authoritative Storybook projection data |
| `src/assets/raster/` | Raster descriptors, density helpers, validation and placeholder slots |
| `assets/characters/` | Canonical full-body rival identity masters |
| `public/assets/placeholders/ui/` | Clearly temporary PNG fixtures with inventory |
| `tests/ui/foundation/` | Storybook browser, axe, keyboard, motion and screenshot evidence |

No foundation component imports `src/sim/` or `src/content/`.

Foundation fonts are local WOFF2 variable assets under `src/ui/foundation/fonts/`: Cormorant
Garamond for display and Source Serif 4 for body/ledger. The directory includes Fontsource 5.3.0
provenance and the SIL OFL 1.1 license; system fallbacks and `font-display: swap` are mandatory.

## Raster asset descriptor

`RasterAsset` requires:

- a stable asset `id`;
- positive logical `width` and `height`;
- a 1× PNG/WebP fallback;
- optional ordered density sources such as 2×;
- an optional `placeholder` marker for development inventory.

`rasterSrcSet` creates a density descriptor, `rasterFallbackSource` selects 1×, and
`validateRasterAsset` rejects missing 1× sources or non-PNG/WebP paths. Tests read the PNG headers
and verify every placeholder’s physical 1×/2× dimensions.

`RasterIcon` is the only small-icon renderer. It fixes logical dimensions, emits `srcSet`, supports
eager/lazy loading, reports loading state, distinguishes `alt=""` decoration from meaningful `alt`,
shows a textual missing-image fallback, and layers selected/disabled/warning/public/private text
overlays without modifying the source image. It does not set blanket `image-rendering: pixelated`.

An icon-only `IconActionButton` requires a `label`; the nested bitmap is decorative so assistive
technology receives one unambiguous control name.

## Character portrait slots

`characterPortraits` freezes three distinct slots for each approved rival identity:

- `full` is the untouched canonical full-body master and is reserved for large showcase, event and
  ending contexts;
- `bust` is a dedicated chest-up or upper-torso, front/near-front portrait for identity strips and
  inspectors;
- `tight` is a dedicated neck-up or head-and-shoulders, front/near-front portrait for compact rows.

The five `full` assets are production masters. WP-012 derives visibly inventoried temporary square
crops only to prove the logical `80×80` bust and `64×64` tight contracts. Those derivatives carry
`placeholder: true` and `status: temporary-master-crop`; they are not production variants. WP-034
must generate dedicated bust/tight portraits from the masters using the canonical variant prompt.
Small portraits must preserve costume identity—especially Edric’s armor and red mantle versus
Oswin’s ecclesiastical robes and cross—and increase stained-glass segmentation without obscuring
facial anatomy.

## Vector prohibition

Production and public source paths must contain no:

- `.svg` file or inline `<svg>`;
- SVG data URI or CSS mask sourced from SVG;
- runtime SVG rasterization;
- icon font;
- Heroicons, Lucide, Radix Icons, Tabler, Phosphor, Font Awesome or Iconify import.

`src/assets/raster/contracts.test.ts` enforces authored/shipped source and asset paths. Development
dependencies and generated Storybook manager assets are outside the shipped-game scan; the Vite
production artifact is inspected separately at packet/release gates.

## Project-owned behavior wrappers

Radix Primitives supply behavior only. `src/ui/primitives/RadixWrappers.tsx` wraps every used primitive
with project naming and CSS Modules:

- `Tooltip` uses focus/hover behavior and a chancery note surface;
- `Popover` exposes contextual evidence and returns focus on close;
- `Dialog` traps and returns focus; `dismissible={false}` prevents Escape/outside dismissal for a
  mandatory decision until its resolution button is used;
- `SegmentedTabs` implements arrow-key tab navigation with text labels;
- `ScrollRegion` gives dense records a focusable named viewport;
- `VisuallyHidden` exposes Radix’s behavior helper without styling dependency.

Radix Themes and Radix Icons are not used. All visible styling is in project CSS Modules.

## Foundation component exports

- Action controls: `Button` variants and `IconActionButton`.
- Political markers: `SealStatus`, `AllegianceRibbon`, `IntelligenceAge`.
- Material structures: `ParchmentPanel`, `InspectorSection`, `ReasonRow`.
- Dense feedback: `ResourceDatum`, `ChronicleLine`, `StateNotice`, `DeltaAnnouncer`.
- Asset rendering: `RasterIcon`.

There is intentionally no universal `Card`. These components represent political objects and should
not be flattened into repeated interchangeable boxes.

## Raster map contract

The fixture uses a high-resolution raster plate as a decorative `<img>` plus seven absolutely
positioned semantic `<button>` hotspots. Each hotspot owns a full accessible name and visible text;
coordinates are fixture data, focus is visibly outlined, and selection/urgency use words and border
shape as well as color. Geography never becomes SVG, canvas or an inaccessible image map.

WP-030 will consume validated territory projections and production coordinates; WP-034 replaces the
neutral plate/icon slots and temporary bust/tight crops. WP-019 may freeze shared barrels after
integrating content asset slots.

## Live announcements

`DeltaAnnouncer` exposes one atomic polite `output` message. Callers must pass only the latest
authoritative delta and retain full history in the Chronicle; do not re-mount or replay old deltas on
every render. Mandatory decisions use visible headings and focus movement rather than repeated live
region spam.
