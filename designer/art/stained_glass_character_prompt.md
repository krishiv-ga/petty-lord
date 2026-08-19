# Generalized Stained-Glass Character Prompt

## Purpose

This is the baseline generation template for full-body lord character art in **The Petty Lord**. It defines the shared visual language. Character-specific prompts should preserve these style constraints while changing silhouette, face, costume, palette, pose, props and heraldry to communicate each lord's personality and political role.

Unless explicitly testing a variation, generate from this specification **without using previous character images as visual references**. The goal is a shared style grammar, not repeated compositions or inherited anatomy.

---

## Core Prompt Template

Create a **full-body isolated character illustration** of **[CHARACTER NAME / EPITHET]**, a **[AGE / ROLE / ARCHETYPE]** in a medieval political strategy game.

The final image must use a **strong stylized stained-glass character aesthetic**. The **entire figure must clearly look constructed from stained-glass pieces**, rather than looking like a conventional painted character with glass texture applied afterward.

### Stained-glass construction

- Build the whole silhouette, face, hair, clothing, hands, equipment and props from **large, clearly segmented colored-glass shapes**.
- Separate the major shapes with **bold dark lead-like outlines**.
- Make the glass segmentation obvious at normal viewing size, not only in micro-detail.
- Use **broad geometric panels** across large garments and body masses.
- Use somewhat finer segmentation only where expression or identity requires it, especially the face and hands.
- Use subtle internal mottling, grain and translucent-looking variation inside the glass pieces.
- Keep shading stylized and restrained. Form may have slight dimensionality, but large color panes and lead lines must remain the dominant visual read.
- Avoid naturalistic painterly rendering, photographic lighting and realistic material simulation.
- The result should feel like a **modern game character designed as a stained-glass figure**, not a literal photograph of a church window.

### Character design

Design the character around a clear **macro silhouette** that communicates personality before costume details are visible.

Character-specific instructions should define:

- body shape and proportion;
- age and facial structure;
- expression;
- posture;
- major costume masses;
- one or two meaningful props;
- house palette;
- restrained heraldry;
- the political impression the character should create.

Use large readable shapes before small ornament. Fine detail should never obscure silhouette or stained-glass construction.

### Medieval world

Costume and equipment should feel grounded in a fictional late-medieval Western/Central European court, loosely around **c. 1380–1430**. Historical plausibility is a visual anchor, not a reconstruction requirement.

Avoid generic high-fantasy excess. Wealth, military power, religion and regional identity should be communicated through tailoring, materials, silhouette and selective symbols rather than oversized fantasy equipment.

### Heraldry

Use heraldry sparingly. Prefer **one primary heraldic device** and at most one secondary echo. The viewer should remember the character's silhouette and face before their emblem.

### Composition

- Full body, standing figure unless the character brief explicitly requires otherwise.
- Preserve the entire head, hands, clothing silhouette, props and feet.
- Leave comfortable transparent clearance around the figure for later UI cropping.
- The master must support full-body, thigh-up, waist-up and portrait crops.

### Background requirement

**Transparent background only.**

Do not include:

- scenery;
- stained-glass window frame;
- church interior;
- architecture;
- floor;
- pedestal;
- banner;
- halo unless explicitly character-relevant;
- vignette;
- fog or smoke;
- cast shadow onto an environmental surface.

The output must be an isolated character asset ready to layer into game UI and later backgrounds.

---

## Character-Specific Block

Append a block in this structure for each lord:

**Character:** [NAME / EPITHET]  
**Political role:** [ROLE]  
**Age:** [AGE]  
**Three-second read:** [3–5 immediate traits]  
**Silhouette:** [major body/costume geometry]  
**Face:** [structure, age, expression]  
**Pose:** [body language]  
**Costume:** [large garments / armor / status]  
**Props:** [1–2 meaningful objects]  
**Palette:** [5–7 colors]  
**Heraldry:** [one restrained identifier]  
**Avoid:** [character-specific failure modes]  
**Final impression:** "[one-sentence emotional read]"

---

## Shared Quality Test

Reject a character if:

1. the stained-glass construction is visible only as surface texture or tiny seams;
2. realistic rendering dominates the leaded glass shapes;
3. the silhouette could belong to several other lords;
4. costume ornament overwhelms personality;
5. the character reads as generic fantasy rather than a political actor;
6. heraldry is repeated like branding across the costume;
7. the transparent-background requirement is violated.

A successful asset should read first as **a specific person**, second as **a stained-glass figure**, and third as **a medieval aristocrat belonging to the same visual system as the rest of the cast**.
