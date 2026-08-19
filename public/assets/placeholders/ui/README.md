# WP-012 neutral raster fixtures

These files are **temporary Storybook fixtures**, not final production art. Replace them through
WP-034 without changing the logical dimensions or `RasterAsset` consumption contract.

| Asset | Logical size | Density files | Intended fixture use | Replacement slot |
|---|---:|---|---|---|
| `map-plate-placeholder` | 720×480 | 720×480, 1440×960 | Semantic DOM hotspot spike | Production kingdom map plate |
| `portrait-placeholder` | 80×80 | 80×80, 160×160 | Anonymous lord medallions | Authored lord portraits |
| `seal-placeholder` | 32×32 | 32×32, 64×64 | Status seals and action icons | Authored seal/status icon set |
| `{rival}-bust-temporary` | 80×80 | 80×80, 160×160 | Lord-strip identity proof | Dedicated WP-034 bust variant |
| `{rival}-tight-temporary` | 64×64 | 64×64, 128×128 | Tight-slot sizing proof | Dedicated WP-034 tight variant |

The source images were created with the built-in OpenAI image-generation tool as neutral,
label-free raster studies, then downsampled once with Pillow 12.3.0. No image generator or source
prompt runner is committed. The final prompts and provenance are recorded in the WP-012 implementer
log. All files are PNG; no SVG/vector or icon-font source exists.

The `edric`, `ysabel`, `renard`, `oswin`, and `mara` bust/tight files are deterministic
temporary crops derived from the canonical production masters in `assets/characters/`. They are
not generated portrait variants and must not be promoted as final art. The untouched full-body
masters remain the `full` production slot; WP-034 owns dedicated front/near-front `bust` and
`tight` replacements.
