# Canonical Stained-Glass Character Variant Prompt

**Status:** Canonical derivative-character generation contract  
**Applies to:** Edric, Ysabel, Renard, Oswin and Mara  
**Identity masters:** `assets/characters/{edric,ysabel,renard,oswin,mara}.png`

This document extends [`stained_glass_character_prompt.md`](./stained_glass_character_prompt.md). The existing full-body PNGs are approved canonical identity masters. They are **not placeholders** and must not be redesigned casually.

The full-body prompt remains the style grammar for creating new characters. This document governs **new compositions of an existing approved character**. For those compositions, the canonical master image must be supplied to ImageGen as the identity reference.

## 1. Required launch variants per rival lord

Each of the five rival lords requires exactly these production compositions at launch unless later UI testing proves another slot necessary:

1. **Full figure** — the existing approved master. Do not regenerate merely for uniformity.
2. **Bust portrait** — a newly generated chest-up / upper-torso portrait, front-facing or near-front three-quarter.
3. **Tight portrait** — a newly generated neck-up / head-and-shoulders portrait, front-facing or near-front three-quarter.

Do **not** satisfy bust/tight slots by mechanically cropping the side-facing full-body master. Crops may be used temporarily in development only. Production portrait slots are dedicated generated compositions.

Do not multiply expressions, battle-damage states or emotional variants unless a concrete UI/event slot demonstrates that the neutral full/bust/tight family cannot communicate the required state.

## 2. Identity preservation

When generating a derivative portrait, use the corresponding file under `assets/characters/` as the image reference and preserve:

- recognizable facial identity and age;
- facial structure, hair, beard, hairstyle and defining features;
- house palette and major costume language;
- heraldic identifier where visible at the crop;
- social status and political archetype;
- the character's established body-language/personality read;
- the same late-medieval fictional setting and shared stained-glass grammar.

The output is a new camera/composition of the **same person**, not a reinterpretation.

## 3. Stronger facial stained-glass treatment

The close portraits should push the stained-glass construction **further than the current full-body masters**, because the face occupies more pixels and can carry stronger segmentation.

Require:

- clearly visible lead-like dark lines forming intentional facial planes;
- larger geometric glass facets across forehead, cheeks, nose, jaw and hair masses;
- finer segmentation only around eyes, mouth and defining expression lines;
- colored-glass mottling and restrained translucency variation inside facets;
- stylized dimensionality without slipping into painterly skin rendering;
- facial anatomy remaining attractive, human and highly readable despite the glass construction.

Reject a portrait if the face looks like a normal digital painting with a faint cracked-glass overlay.

## 4. Bust portrait prompt template

Use the supplied canonical master as Image A.

> Create a production-ready **chest-up / upper-torso portrait** of the exact same character shown in Image A for *The Petty Lord*, a medieval political strategy game. Image A is the canonical identity reference: preserve the person's recognizable face, age, facial structure, hair, costume language, heraldic palette, status and political personality. Do not redesign the character.
>
> Recompose the character **front-facing or near-front three-quarter toward the viewer**, with the face as the primary focal point and enough shoulders/chest/costume visible to retain house and role recognition. Do not copy the side-facing pose of the full-body source.
>
> Use the project's strong stylized **stained-glass character aesthetic**. Build the face, hair and visible costume from deliberate colored-glass facets separated by bold dark lead-like lines. Because this is a close portrait, make the stained-glass construction on the face substantially more legible than in the source full-body illustration: broad geometric planes across the forehead, cheekbones, nose, jaw and hair, with finer segmentation around the eyes and mouth. Preserve expressive, attractive human anatomy and clear eye contact/readability.
>
> Keep the established house palette and one restrained heraldic/costume identifier visible in the crop. Maintain the same late-medieval court world, line quality, material vocabulary and overall art family as Image A.
>
> **Transparent background only.** No frame, scenery, text, halo, banner, furniture, floor, environmental shadow or UI decoration. Leave comfortable transparent clearance around hair and shoulders for interface placement.
>
> The final result must read first as this specific established lord, second as a stained-glass figure, and third as a medieval political actor.

Append the character-specific identity block from section 7.

## 5. Tight portrait prompt template

Use the supplied canonical master as Image A.

> Create a production-ready **neck-up / head-and-shoulders portrait** of the exact same character shown in Image A for compact strategy-game UI. Image A is the canonical identity reference: preserve the person's recognizable face, age, facial structure, hair, costume cues, heraldic palette and personality. Do not redesign or beautify the character into a different person.
>
> Recompose the subject **front-facing or near-front three-quarter toward the viewer**. Optimize for immediate recognition at small UI sizes. Keep enough collar, mantle, armor, jewelry or ecclesiastical detail to distinguish the character even when reduced.
>
> Push the project's **stained-glass facial construction** strongly: obvious geometric colored-glass planes across skin and hair, bold dark lead-like boundaries, restrained internal glass texture, and finer segmentation only around expressive features. The glass structure must remain visible when the portrait is reduced; do not use tiny crackle texture as a substitute.
>
> Expression should be neutral-to-characterful rather than theatrical. Preserve the established political read. Keep the same art family and late-medieval setting as Image A.
>
> **Transparent background only.** No frame, scenery, text, banner, halo, environmental shadow or UI decoration. Leave safe transparent margin around head and shoulders.

Append the character-specific identity block from section 7.

## 6. Generation workflow for Codex

The character asset packet may use the available **ImageGen skill/tool** for these derivative compositions. This is explicitly allowed and preferred over mechanical crops.

Rules:

1. Read this file and the baseline full-body prompt.
2. Use the correct `assets/characters/<lord>.png` as the image reference.
3. Generate one character/slot at a time so identity drift can be reviewed.
4. Do not use another lord as visual reference for the current lord.
5. Produce raster PNG/WebP only; never vectorize the result.
6. Keep generated masters non-destructive and preserve provenance/prompt metadata outside the image.
7. Run actual-size UI review before accepting a result.
8. If identity drifts, regenerate from the canonical master rather than manually repainting the face in code.
9. If the ImageGen skill/tool is unavailable in the executing environment, record a blocking regeneration request with the exact prompt and slot; do not substitute a generic portrait.

Codex must **not build its own image-generation tooling**.

## 7. Character-specific identity blocks

### Edric — The Hawk

**Political role:** Military power / possible rival claimant  
**Preserve:** older hard-featured man, grey hair and beard, scarred/weathered authority, iron/black/blood-red military palette, armor and hawk/eagle clasp cues.  
**Bust/tight cue:** retain armor or red martial mantle in the crop so he never reads like Oswin.  
**Expression:** stern, evaluating, formidable.  
**Avoid:** priestly robes, courtly softness, youthful face, smiling hero pose.  
**Final impression:** "A man accustomed to deciding disputes with force and expecting others to notice."

### Ysabel — The Spider

**Political role:** Wealthy court kingmaker / political operator  
**Preserve:** composed adult woman, dark braided hair, elegant controlled features, purple/wine/ivory/gold with emerald jewelry, expensive court tailoring.  
**Bust/tight cue:** retain distinctive court jewelry, structured bodice/shoulder language or a restrained sealed-letter cue if composition permits.  
**Expression:** observant, self-possessed, difficult to read.  
**Avoid:** witch imagery, seductive caricature, battle armor, exaggerated villain smile.  
**Final impression:** "She appears to have understood the room before anyone else entered it."

### Renard — The Favorite

**Political role:** Presumed heir / establishment claimant  
**Preserve:** young handsome aristocratic man, long chestnut hair, immaculate grooming, royal blue/white/gold with burgundy accents, lion/fleur-de-lis court language.  
**Bust/tight cue:** retain luxurious fur/royal-blue collar or mantle and gold heraldic detail.  
**Expression:** confident, entitled without cartoon arrogance, accustomed to legitimacy.  
**Avoid:** battle-worn grit, sinister villain coding, crown already on his head, generic knight portrait.  
**Final impression:** "He looks exactly like the man everyone has assumed will be king."

### Oswin — The Pious

**Political role:** Great lord and dominant individual Church voice  
**Preserve:** older silver-haired and silver-bearded man, severe intelligent face, black/charcoal/ivory/deep-red/gold ecclesiastical-court palette, religious medallion/cross/book language.  
**Bust/tight cue:** retain unmistakable ecclesiastical collar, medallion or robe geometry so he never reads like Edric.  
**Expression:** grave, judging, thoughtful rather than fanatical.  
**Avoid:** heavy armor, wizard coding, generic pope/bishop costume, supernatural glow.  
**Final impression:** "A statesman who believes political power is accountable to a higher order."

### Mara — The Rebel

**Political role:** Regionalist / autonomy-focused kingmaker  
**Preserve:** adult woman, long auburn/brown hair, practical aristocratic presence, forest/olive/teal/cream/burgundy/gold palette, deer/stag identity, frontier tailoring and armed readiness.  
**Bust/tight cue:** retain green mantle/collar and stag or frontier-leather cue in frame.  
**Expression:** defiant, alert, independently confident.  
**Avoid:** peasant/ranger reduction, fantasy elf coding, wild barbarian caricature, generic court princess.  
**Final impression:** "A noblewoman who expects the Crown to negotiate with her, not command her."

## 8. UI-size QA

Accept each generated variant only after checking it at the actual intended logical sizes.

Minimum checks:

- tight portrait remains recognizable at the smallest forecast/chronicle use;
- bust remains readable in the lord rail and inspector;
- stained-glass segmentation survives reduction without turning into noisy facial cracks;
- house identity remains visible without relying on color alone;
- Edric and Oswin cannot be confused in small grayscale review;
- transparent edges are clean against vellum, dark cloth and occupied/urgent backgrounds;
- eyes, mouth and defining facial features are not destroyed by lead-line density.

## 9. Future character variants

If later testing proves a new composition is necessary (for example a major event close-up or a genuinely different emotional state), create it as another **reference-based generated composition** from the canonical identity master or accepted bust—not as an arbitrary crop, CSS distortion or unrelated re-generation.

Every new variant requires a named UI/narrative slot and should reuse this prompt grammar. Do not create variants speculatively.