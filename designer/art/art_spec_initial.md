# The Petty Lord — Initial Art Specification

**Status:** Initial art-direction hypothesis for testing  
**Immediate focus:** Great-lord character art  
**Do not treat as final:** This document is meant to be challenged by image tests. Once the lord style is proven, replace uncertain sections with locked production rules before moving on to map/UI art.

---

## 1. Art-direction thesis

The initial direction is:

> **Courtly Realism — highly rendered, semi-realistic medieval aristocrats presented against a more stylized manuscript/chancery world.**

The character rendering should feel materially convincing and prestigious enough that each noble can carry the screen by themselves, while remaining clearly authored character art rather than a photograph of an actor in costume.

The wider game should eventually contrast those unusually tangible people with a flatter, more illustrative political world: heraldry, parchment, seals, documents, painted map miniatures and medieval manuscript influence.

The desired contrast is:

> **The kingdom is an illustrated political artifact. The nobles feel disturbingly real.**

That contrast is important. If both characters and map/UI are rendered with the same cinematic realism, the game risks becoming visually generic fantasy strategy. If everything is manuscript-flat, the lords may lose the human presence the design depends on.

---

# 2. What we are testing first

The first art test is not “can we generate attractive medieval characters?”

It must answer five specific questions:

1. **Can this rendering style produce a cast that feels like one coherent game?**
2. **Can each lord be recognized from silhouette, face, pose and costume before reading their name?**
3. **Can political role be communicated without making every character look like a warrior?**
4. **Can a full-body master crop cleanly into the portrait sizes the interface needs?**
5. **Can we make the characters feel medieval and aristocratic without falling into fantasy-costume clichés or sterile museum reconstruction?**

Until those answers are yes, do not expand production into map art, decorative UI or event illustrations.

---

# 3. Character-art target

## 3.1 Rendering style

Target:

- semi-realistic digital character illustration;
- highly rendered skin, cloth, leather, fur, wood and metal;
- believable material response and wear;
- subtle painterly finish rather than hyper-sharp photographic rendering;
- anatomically plausible proportions with restrained stylization;
- dramatic but naturalistic presentation;
- enough detail to reward a large portrait view;
- clear shapes that survive reduction to smaller UI crops.

The supplied visual reference direction is useful primarily for:

- full-body presentation;
- strong silhouette;
- material richness;
- age and facial texture;
- character-defining pose;
- storytelling props;
- prestige-game finish;
- transparent-background compositing.

The medieval version should **not** simply substitute swords for firearms. Political power must be visible through dress, seals, letters, books, jewels, heraldry, posture, attendants implied off-frame, church objects and courtly objects as much as through weapons.

### Rendering calibration

Working hypothesis:

- **70% grounded historical material culture**
- **20% theatrical character exaggeration**
- **10% romantic medieval myth**

This ratio is conceptual, not numerical production data. It means the viewer should believe the clothing, weapons and materials belong to a plausible medieval society, while the characters are pushed just far enough to become iconic game pieces.

### Avoid

- photobashed live-action appearance;
- waxy AI skin;
- glamour-model faces on every noble;
- modern cinematic color grading baked into each character independently;
- excessive micro-detail that turns to noise in UI;
- concept-art haze around edges;
- painterly backgrounds baked into the character master;
- generic “fantasy king” visual language.

---

# 4. Historical visual anchor

## 4.1 Working period

Use a fictional Western/Central European court visually anchored around:

> **c. 1380–1430**

This is a visual reference band rather than a claim of perfect historical reconstruction.

It gives the game access to:

- plate armor alongside mail and brigandine;
- long tailored noble garments;
- rich wool, velvet, silk and brocade;
- fur trimming;
- belts, purses, signet jewelry and court accessories;
- swords and rondel daggers;
- elaborate but still recognizably medieval heraldry;
- powerful ecclesiastical dress and devotional objects;
- manuscript and chancery aesthetics compatible with the planned interface.

The kingdom is fictional, so exact decades can be blended when doing so improves legibility or character identity.

## 4.2 Historical authenticity rule

Aim for **historical plausibility, not museum reenactment**.

A viewer knowledgeable about the period should not immediately see obvious fantasy nonsense, but production does not need to prove that every seam, buckle and garment construction is tied to one exact surviving artifact.

### Explicit bans for the first test pass

- oversized fantasy pauldrons;
- blackened “villain armor” by default;
- random leather straps used as decoration;
- Viking/fur-barbarian coding unrelated to region;
- fantasy runes;
- glowing materials;
- impractical giant swords;
- modern tactical silhouettes;
- steampunk/sci-fi components;
- universal hooded-cloak rogue styling;
- everybody dressed as a knight.

---

# 5. Camera and composition

## 5.1 Master asset

Each great lord should eventually have one **full-body master illustration** designed for transparent-background compositing.

The master must support these crops:

1. **head-and-shoulders** — small lord list / alignment display;
2. **chest or waist crop** — standard diplomacy / selected-lord panel;
3. **three-quarter crop** — important bargain, threat, event or declaration;
4. **near-full/full body** — character introduction, major confrontation, ending or promotional composition.

Do not design only for the full-body image. The face and upper torso carry most normal gameplay usage.

## 5.2 Camera

Working target:

- near eye-level camera;
- slight heroic low angle only when character identity justifies it;
- no extreme wide-angle distortion;
- no fashion-photo perspective;
- no dramatic Dutch angles;
- roughly consistent apparent lens/camera distance across the cast.

The cast should feel as though each portrait belongs to the same visual portrait system even when poses differ.

## 5.3 Framing and safe areas

Each master should leave:

- breathing room above headwear;
- clear lateral space around elbows/weapons/props;
- no important object touching the image boundary unless intentionally tested;
- readable feet/ground termination if full body is used;
- no cropped sword tips, sleeves or hems in the canonical master.

## 5.4 Pose language

Poses should be:

- controlled;
- aristocratic;
- politically expressive;
- asymmetrical enough to avoid mannequin stiffness;
- restrained enough to avoid superhero key art.

No character should look like they are waiting to enter a combat arena unless their political identity genuinely demands military readiness.

---

# 6. Lighting

## 6.1 Cast consistency

All lords should share a compatible lighting family.

Working direction:

- soft directional key;
- readable face planes;
- moderate contrast;
- warm-neutral flesh;
- restrained rim/separation light if needed for dark clothing;
- no colored sci-fi edge lighting;
- no radically different time-of-day lighting per lord.

The interface may later place characters against parchment, dark timber, cloth or muted interior surfaces. Character edges need enough separation to work across multiple contexts.

## 6.2 Material readability

Lighting must help distinguish:

- wool from velvet;
- velvet from silk;
- polished metal from worn steel;
- leather from textile;
- fur from hair;
- gold/silver ornament from flat yellow/gray decoration.

Material quality is a major part of how rank and wealth will be communicated.

---

# 7. Color philosophy

The characters should have controlled, historically plausible color rather than the aggressively desaturated brown/gray palette often used for “serious medieval” settings.

Medieval elites should look expensive.

Use:

- deep dyed reds;
- blue;
- green;
- burgundy;
- cream;
- black where status-appropriate;
- metallic gold/silver;
- natural wool/leather neutrals;
- fur and brocade detail.

House identity can enter costumes, but **do not dress each person head-to-toe in their UI color**.

Heraldic colors should appear through:

- lining;
- sash;
- sleeve detail;
- belt ornament;
- badge;
- cloak;
- embroidered motif;
- jewelry;
- visible heraldic device.

Character recognition must survive if the image is viewed in grayscale.

---

# 8. Faces

The game needs people who look lived-in, not idealized fantasy archetypes.

Allow:

- wrinkles;
- sun exposure;
- uneven skin;
- scars where character-appropriate;
- asymmetry;
- imperfect teeth only if ever visible naturally;
- age-specific features;
- distinctive noses/jaws/brows;
- varied grooming.

Avoid giving every noble:

- the same attractive face;
- the same age;
- the same square jaw;
- the same gray heroic hair;
- the same intense squint;
- the same neutral expression.

Faces should communicate different forms of power:

- Edric: physical authority;
- Ysabel: composure and evaluation;
- Renard: legitimacy and confidence;
- Oswin: severity and moral judgment;
- Mara: independence and regional pride.

---

# 9. Props as political storytelling

Every prop must answer one of three questions:

1. What gives this person power?
2. What does this person value?
3. What kind of bargain or threat do they represent to the player?

Good prop categories:

- signet rings;
- letters with seals;
- ledgers;
- charter rolls;
- prayer books;
- reliquaries;
- riding gloves;
- swords/daggers;
- keys;
- coin purse;
- ceremonial office objects;
- document cases;
- rosary/prayer beads where period-appropriate;
- marshal/battle gear;
- regional jewelry.

Avoid generic prop clutter. One or two strong storytelling objects are better than six unrelated accessories.

---

# 10. Silhouette system

The cast must pass a silhouette test.

At approximately thumbnail scale, with internal detail removed, the lords should still differ through:

- body shape;
- posture;
- garment volume;
- headwear/hair profile;
- cloak shape;
- weapon/prop profile;
- arm position.

### Silhouette targets

**Edric:** broad, heavy, grounded, martial.  
**Ysabel:** vertical/elegant, controlled, courtly, fine garment architecture.  
**Renard:** balanced, idealized aristocratic, ceremonial authority.  
**Oswin:** narrow/severe, dark vertical lines, book/religious object shape.  
**Mara:** mobile/riding-ready, asymmetric cloak/outerwear, less court-contained.  
**Player:** comparatively modest and less visually dominant at the start of the game.

Do not force difference by making one character absurdly huge or costuming them outside the shared setting.

---

# 11. Lord-specific initial briefs

These are **art-test briefs**, not final prompts.

## 11.1 Lord Edric — The Hawk

**Political role:** military power, potential claimant, respects strength.  
**Seat:** Northkeep.  
**Immediate visual read:** the kingdom's most credible warlord.

### Target

Older male aristocrat with a physically imposing build and the posture of someone accustomed to command. He should look wealthy enough to be a great lord but less polished than Renard.

### Costume

Working options:

- rich dark wool / fitted noble garment under a brigandine or partial plate;
- practical plate elements with believable wear;
- fur-lined or heavy northern outer layer used sparingly;
- expensive belt and signet;
- Northkeep heraldic detail integrated into garment or clasp.

### Props

Preferred:

- longsword or substantial arming sword, worn/held naturally;
- riding or gauntlet gloves;
- possibly a command baton/map roll only if it improves rather than confuses the silhouette.

### Pose

Broad stance. Controlled shoulders. One hand can rest on pommel or gloves. Not actively brandishing a weapon.

### Face

Weathered, disciplined, not berserk. A scar can work if it does not become cliché.

### Critical test

Can Edric look genuinely dangerous **without** becoming a fantasy barbarian or armored boss character?

---

## 11.2 Lady Ysabel — The Spider

**Political role:** wealthy kingmaker, financial network, values viable winners.  
**Seat:** Eastvale.  
**Immediate visual read:** immense wealth, intelligence and control.

### Target

A powerful noblewoman whose image contains almost no overt violence. She should look more dangerous the longer the viewer looks at her.

### Costume

- immaculate high-status court dress;
- velvet/brocade/silk;
- fine fur where appropriate;
- pearls or restrained precious-metal jewelry;
- exceptional tailoring;
- Eastvale identity embedded subtly.

### Props

Preferred:

- folded sealed letter;
- small ledger/account book;
- keys or signet;
- optional tiny court dagger, de-emphasized.

### Pose

Composed and still. One hand occupied with a letter, ring or glove. No melodramatic plotting gesture.

### Face

Hospitable, observant, difficult to read. Avoid smirk and “evil mastermind” coding.

### Critical test

Can the art make a noncombatant politician feel as visually powerful as Edric?

---

## 11.3 Duke Renard — The Favorite

**Political role:** establishment favorite and principal claimant.  
**Seat:** Southmere.  
**Immediate visual read:** of course this man is supposed to become king.

### Target

The most conventionally regal and legitimate-looking member of the cast. Attractive/charismatic is acceptable, but he must still feel human rather than romance-cover perfect.

### Costume

- exceptionally fine court clothing;
- strong tailoring;
- fur-lined mantle or prestigious overgarment;
- gold collar/jewelry;
- heraldic/royal-family references woven subtly into fabric or clasp;
- beautiful ceremonial-quality sword that is still plausible as a weapon.

### Props

- sword;
- gloves;
- sealed royal correspondence or signet only if useful.

### Pose

Easy, upright confidence. He belongs in the room and knows it. Avoid villain pose.

### Face

Self-assured, intelligent, socially polished. No obvious cruelty.

### Critical test

Does the player immediately understand why Renard begins as the overwhelming favorite **without text**?

Renard should look like the protagonist of a more conventional medieval game.

---

## 11.4 Lord Oswin — The Pious

**Political role:** noble voter and strongest individual Church voice.  
**Seat:** Abbeylands.  
**Immediate visual read:** secular power fused with religious legitimacy.

### Target

Not a monk, priest or bishop costume by default. He is a powerful aristocrat whose political identity is inseparable from the Church.

### Costume

- severe high-status noble clothing;
- dark rich textiles;
- restrained religious embroidery or badge;
- quality belt/weapon showing secular rank;
- devotional object or book.

### Props

Preferred:

- clasped prayer book;
- reliquary/medallion;
- ring;
- sword visible but not central.

### Pose

Tall or narrow vertical read, economical gesture, perhaps holding the book against the body or examining a document.

### Face

Austere, thoughtful, morally appraising rather than cartoonishly sanctimonious.

### Critical test

Can he read as both **lord** and **Church powerbroker** at first glance?

---

## 11.5 Lady Mara — The Rebel

**Political role:** regionalist kingmaker, defender of provincial liberties.  
**Seat:** Westmarch.  
**Immediate visual read:** aristocratic, old-rooted, less domesticated by the royal court.

### Target

She should look unmistakably noble without sharing Ysabel's highly court-polished presentation. Her authority comes from a region with its own identity and political traditions.

### Costume

- fine clothes under practical outerwear;
- riding boots;
- high-quality wool or weatherproof cloak;
- old regional jewelry or clasp;
- slightly older/local visual motif compared with court fashion;
- restrained Westmarch heraldry.

### Props

Preferred:

- riding gloves;
- practical dagger;
- folded charter/document;
- optional riding crop only if period/visual research supports it and it does not become cliché.

### Pose

More mobile/asymmetric than Ysabel. Weight shifted as if recently arrived rather than posed at court.

### Face

Direct, self-possessed, skeptical. Avoid “female rogue” smirk.

### Critical test

Can Mara feel rebellious because of **political culture**, not because she looks like a fantasy outlaw?

---

## 11.6 Player — Lord of Greyfen

**Political role:** insignificant lord attempting the impossible.  
**Seat:** Greyfen.  
**Immediate visual read:** still aristocratic, clearly less impressive than the major powers.

### Initial direction

Do not use the player character as the first style-lock test. First prove the cast style with NPCs whose identity is fully authored.

The eventual player portrait should have:

- good but comparatively modest clothing;
- older or less fashionable pieces;
- simpler weapon;
- fewer jewels;
- one clear signet/heraldic marker establishing legitimate noble rank;
- perhaps subtle mud/travel wear appropriate to Greyfen;
- enough visual neutrality that the player's political identity can be projected through play.

### Open issue

The canonical game specifies a player-chosen name and heraldic color but no mechanical character creator. Before final player art, explicitly decide whether launch uses:

- one fixed canonical player appearance;
- a small authored appearance choice;
- a deliberately less literal/player-facing representation.

Do not silently expand into a full character creator.

---

# 12. The King — later character test

Do not use the King to lock the normal lord style because his composition should intentionally differ.

### Direction

The King should appear diminished by the institution around him.

Possible composition:

- seated or bedridden;
- thin, old, physically failing;
- crown nearby rather than worn;
- royal bed canopy, textiles, seal and objects carrying more visual mass than his body;
- hands and face emphasizing mortality.

The image should communicate:

> **The man is disappearing. The Crown remains enormous.**

This will become especially valuable in the Deathbed phase and “The King Is Dead” transition.

---

# 13. Initial lord test plan

## 13.1 Test characters

Start with **Edric and Ysabel**.

Reason:

They stress opposite ends of the style:

- Edric proves the style can handle armor, martial masculinity, age, metal and physical threat without becoming fantasy boss art.
- Ysabel proves the same style can make a political/financial noncombatant equally compelling without relying on armor or weapons.

If both feel like members of the same world, the direction has passed an important test.

Renard should be the third test because he determines whether “legitimacy” can be made visually compelling without obvious villain coding.

## 13.2 Produce variants deliberately

For each test lord, create multiple variants that change **one major variable at a time** rather than randomizing everything.

Suggested axes:

### Rendering axis
- A: closer to realistic prestige-game illustration;
- B: slightly more painterly/stylized;
- C: slightly more graphic/character-design-forward.

### Costume axis
- A: strongly historical;
- B: historically grounded with restrained cinematic exaggeration.

### Pose axis
- A: formal court portrait;
- B: character-action pose using one prop;
- C: more assertive full-body stance.

Do not compare images where face, costume, camera, rendering and pose all changed at once. We need to learn *why* one direction works.

## 13.3 In-context test

Every promising full-body image must be tested in rough interface crops before approval.

At minimum:

- 96–128 px portrait head crop;
- ~240–320 px standard selected-lord crop;
- large three-quarter diplomacy crop;
- full-body against a neutral parchment/dark panel mockup.

An image that is beautiful only at full resolution fails production.

---

# 14. Acceptance criteria for lord style lock

Do not declare the style locked until all of these are true.

## 14.1 Cohesion
- Two or more lords look created for the same game.
- Lighting, camera and rendering feel compatible.
- Material treatment is consistent.

## 14.2 Differentiation
- Lords are recognizable from silhouette.
- Faces are clearly different.
- Costumes communicate different regions/roles.
- Props reinforce rather than substitute for identity.

## 14.3 Political readability
A viewer unfamiliar with the design should be able to make broadly correct observations such as:

- “this one is the soldier”;
- “this one is extremely wealthy and political”;
- “this one looks like the obvious heir”;
- “this one is religiously aligned”;
- “this one seems more regional/independent.”

They do not need to guess exact mechanics.

## 14.4 Medieval credibility
- No obvious modern/sci-fi/fantasy contamination.
- Equipment belongs plausibly to the same broad period.
- Clothing looks made from physical textiles rather than fantasy costume plastic.

## 14.5 UI practicality
- Face works at small crop.
- Important details survive standard crop.
- Transparent silhouette is clean.
- Character can be placed on both light and dark interface surfaces.
- No composition requires a bespoke background to make sense.

## 14.6 Tone
The cast should feel:

- intelligent;
- aristocratic;
- dangerous;
- human;
- politically consequential.

They should not feel:

- whimsical;
- heroic-party fantasy;
- grimdark for its own sake;
- anime-coded;
- generic collectible-character art;
- like six skins from the same armor set.

---

# 15. Failure modes to watch aggressively

## 15.1 “Everyone is a warrior”
If every lord has armor and a sword centered in frame, the political cast collapses into combat archetypes.

## 15.2 “Costume department medieval”
Perfectly clean generic tunics, faux-leather belts and stock fantasy cloaks make the setting feel like television extras rather than ruling aristocracy.

## 15.3 “AI prestige gray-haired men”
The initial references contain strong older-male prestige imagery. Do not accidentally reproduce the same face, hair, sunglasses-like eye treatment, stance or age across the cast.

## 15.4 “Renard is obviously evil”
If Renard looks sinister, the succession becomes visually morally pre-solved. He should look credible.

## 15.5 “Ysabel is a femme fatale”
Do not communicate intelligence through sexualization, a villain smirk or a dagger-first composition.

## 15.6 “Mara is a rogue”
Regional independence is political, not an excuse for leather armor, hood and thief styling.

## 15.7 “Oswin is a priest”
He must still read as a great secular lord.

## 15.8 “Historical accuracy kills character design”
If strict reference matching makes silhouettes converge or weakens visual storytelling, use plausible controlled exaggeration.

## 15.9 “Too photoreal”
If characters look like photographs from unrelated films, cohesion and authorship suffer.

## 15.10 “Too painterly”
If faces and costume detail dissolve at normal UI scale, the style is not serving the game.

---

# 16. Preliminary interface relationship

This is not yet the UI art spec, but character tests need an assumed environment.

Working hypothesis:

### Characters
Highly rendered, semi-realistic, three-dimensional presence.

### Map
Flatter painted parchment / illuminated manuscript political map.

### UI
Clean modern information hierarchy wearing the visual skin of:

- chancery documents;
- charters;
- ledgers;
- proclamations;
- wax seals;
- heraldic frames;
- church decrees.

The UI should never sacrifice speed or readability to literal skeuomorphism.

The intended visual hierarchy is:

1. **human face / selected lord**;
2. **political state and decision**;
3. **map / institutional context**;
4. **decoration**.

Decoration is always last.

---

# 17. Preliminary asset technical spec

These numbers are provisional until implementation layout tests are available.

For lord masters:

- portrait orientation;
- full body;
- transparent background preferred;
- enough source resolution to support a large desktop three-quarter crop without upscaling;
- keep all critical anatomy and props inside safe margins;
- no baked shadows that imply a specific background unless extremely subtle;
- no text, crest labels or frame baked into the raster;
- no generated background debris;
- consistent foot/ground treatment across final masters.

Before production, define exact:

- pixel dimensions;
- export format;
- WebP/PNG policy;
- alpha policy;
- file-size target;
- crop naming convention;
- responsive crop behavior.

Do not lock those prematurely in an art-direction test.

---

# 18. Test-review scorecard

For each generated/test image, score 1–5 on:

| Category | Question |
|---|---|
| Character identity | Does this look like this specific lord? |
| Political role | Is their source of power visually legible? |
| Silhouette | Does the figure read at thumbnail size? |
| Face | Is the face distinctive and usable in UI crops? |
| Costume | Does clothing communicate rank/region/personality? |
| Materials | Do cloth, leather, fur and metal feel convincing? |
| Medieval credibility | Does the design avoid obvious fantasy/modern contamination? |
| Cast cohesion | Could this stand beside the other approved lords? |
| UI crop | Does the upper-body crop retain the character? |
| Restraint | Is the image avoiding cliché/overdesign? |
| Desire to interact | Does the player want to click this person and hear what they want? |

Any image scoring below 4 on **Character identity, Political role, Face, Cast cohesion or UI crop** should not advance merely because it is beautiful.

---

# 19. Decisions intentionally left open

The following should be resolved through tests rather than assumed now:

- exact painterly-vs-realistic rendering point;
- exact camera/lens feel;
- whether characters need visible floor/contact shadows;
- whether subtle atmospheric edge treatment helps or hurts UI compositing;
- exact amount of period-fashion exaggeration;
- exact house palette;
- exact heraldic devices;
- whether any lord needs alternate expression art;
- whether player appearance has any authored choice;
- exact image dimensions and browser export pipeline;
- final UI background value behind character renders.

---

# 20. Immediate production sequence

1. **Edric test sheet** — establish martial/material end of style.
2. **Ysabel test sheet** — establish political/courtly noncombatant end.
3. Compare them side by side and in rough UI crops.
4. Revise this specification based on what actually works.
5. **Renard test sheet** — prove legitimate-heir visual language.
6. Test Oswin and Mara against the locked rules.
7. Only then produce final lord masters.
8. Resolve player-art approach.
9. Produce the King.
10. Move to heraldry, map and wider UI art.

---

# 21. One-sentence production brief

> Create a cast of highly rendered, semi-realistic late-medieval great lords who feel materially real, politically dangerous and instantly distinct, with each person's silhouette, clothing, pose and props revealing how they wield power before the player reads a word.
