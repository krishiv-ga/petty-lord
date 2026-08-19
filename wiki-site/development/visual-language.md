# Visual language

WP-012 implements the direction **the royal chancery at the end of a dynasty**. The interface is
assembled from political instruments rather than generic application containers: letters preview
consequences, ribbons declare allegiance, seals name status, ledgers compare resources, iron/brass
edges mark institutions, and the raster map remains the visual center of the game.

The runnable decision record is the Storybook story
`Foundation/Visual language decision record / Chancery direction`. Its source is
`src/ui/foundation/VisualLanguageDecisionRecord.tsx`.

## Material palette

Tokens live in `src/ui/foundation/tokens.css`. Names describe the game material or political role;
there is no open-ended arbitrary color/radius scale.

| Role | Token family | Use |
|---|---|---|
| Vellum | `--pl-vellum-*` | Letters, readable working surfaces and ledger grounds |
| Ink | `--pl-ink*` | Primary text, hard boundaries and high-importance marks |
| Smoke | `--pl-smoke*` | Secondary records, timestamps and stale information |
| Brass / iron | `--pl-brass`, `--pl-iron` | Institutional edges and durable fixtures |
| Royal burgundy | `--pl-burgundy*` | Crown, claimants and decisive political actions |
| Faded blue-green | `--pl-bluegreen` | Stable public records and supportive evidence |
| Warning / blood | `--pl-warning` | Invalid actions, losses and urgency, always with text/shape |
| Church / gold | `--pl-church-gold` | Church and constitutional weight |
| Disabled / ash | `--pl-ash` | Unavailable states reinforced by text/dashed edges |

Normal body copy is at least 16px. The reproducible local pairing is Cormorant Garamond Variable for
display headings and Source Serif 4 Variable for body, inspector and ledger text. Both are vendored
from Fontsource 5.3.0 under SIL OFL 1.1 with local provenance/license evidence. `font-display: swap`
and Georgia/Palatino fallbacks keep the game usable while fonts load or if an asset fails. Compact
uppercase metadata labels may be 12px only when short, high-contrast and paired with a readable
16px value; political facts, relationships, statuses and map details retain the 16px floor.

## Edges, density and texture

- Letters use a restrained shadow, uneven block-edge weight and a fine inset rule.
- Institutions use double brass or hard iron boundaries.
- Invalid and coerced states use words plus dashed or heavy warning rules.
- Focus uses a 3–4px high-contrast cyan-ink outline with spacing from the control.
- `1280×720` reduces vertical spacing through `--pl-density-y` while retaining body size and 44px
  controls. `1440×900` restores breathing room. `1280×640` is the maintained pressure fixture.
- Texture is implemented as very low-contrast CSS grain beneath text. It does not become a noisy
  text backing, load as authoritative state, or block interaction.

CSS Modules own component styles. The two intentional global files are the token sheet and the
small `.pl-foundation-scope` normalization/accessibility layer. Component selectors never style
unscoped application elements.

## Political state hierarchy

Color is never the only signal:

- **Public:** explicit “Public record” text and a stable solid treatment.
- **Private:** “Known privately” or “Private intelligence” plus dashed/dotted boundaries.
- **Stale:** observation timestamp, “Stale report” and dotted/hatched treatment.
- **Unknown:** the word “Unknown”, an empty pattern marker and dashed boundary.
- **Coerced:** “Under duress” plus warning color and broken ribbon/border treatment.
- **Occupied:** explicit occupation text and a heavy material field.
- **Invalid:** the reason or “Invalid” plus warning border.
- **Urgent:** explicit urgent/mandatory copy and a heavy warning rule.

Relationship, Support and Intelligence Age are deliberately separate components. A private Leaning
never looks like a public vote; a dispossessed lord retains an explicit vote/status line.

## Motion and reduced motion

Motion may present a letter, veil or tooltip and may emphasize a map control. It never advances the
simulation or decides when an action completes. `prefers-reduced-motion` removes transforms and
animations while preserving the same final state immediately. Playwright maintains a reduced-motion
capture of the constrained-height crisis fixture.

## Rejected patterns

Production UI must not use:

- rounded KPI tiles with isolated totals;
- a generic sidebar beside a repeated card grid;
- glassmorphism, neon glows or gradient-brand chrome;
- pills as the only political hierarchy;
- stock fantasy ornament around a modern admin layout;
- an all-purpose `Card` abstraction;
- hover-only facts or icon-only onboarding controls.

## Storybook evidence

Key stories are:

- `Foundation/Visual language decision record`;
- `Primitives/RasterIcon / Density semantics and fallback`;
- `Foundation/Component contracts` for action, state and Radix wrapper behavior;
- `Compositions/Political foundation spikes / Lord portrait support strip`;
- `... / Action preview letter with long consequences`;
- `... / Compact crisis frame at minimum height`;
- `... / Raster map with keyboard hotspots`.
- `Foundation/Component contracts / Stable loading state`.

Baselines under `tests/ui/foundation/baselines/` cover 1280×720, 1440×900 and 1280×640 reduced
motion. The WP-012 auditor log records build SHA, zoom, motion setting, screenshots and findings.

## Placeholder art boundary

WP-012 includes three neutral generated raster studies under `public/assets/placeholders/ui/`: an
anonymous player portrait medallion, a blank seal and a label-free map plate. It also includes
clearly labelled temporary bust/tight crops of the five approved rival masters so the foundation is
evaluated against Edric, Ysabel, Renard, Oswin and Mara rather than generic silhouettes. The source
masters under `assets/characters/` are canonical production identity art, not placeholders.

The lord strip uses the `bust` slot at `80×80`; WP-034 replaces each crop with a dedicated
front/near-front chest-up variant. A separate `tight` `64×64` slot is frozen for compact contexts,
and the original full-body master is restricted to large showcase/event/ending contexts. All
temporary files are visibly marked in the fixture and inventoried in the placeholder README;
consumers must not bypass `RasterAsset` or change logical dimensions during replacement.
