# The Petty Lord — Art List

**Status:** Production checklist / art coverage map  
**Scope:** First complete release  
**Priority:** Character art first. Other categories remain provisional until the lord portrait style is locked.

This file is the master list of visual assets and art-direction decisions required for the game. It is intentionally broader than the immediate production plan so that nothing visually important is discovered late.

## 1. Character art — FIRST PRIORITY

### 1.1 Great lords
- [ ] Lord Edric — full-body master
- [ ] Lady Ysabel — full-body master
- [ ] Duke Renard — full-body master
- [ ] Lord Oswin — full-body master
- [ ] Lady Mara — full-body master
- [ ] Player / Lord of Greyfen — full-body master

For every lord master, verify:
- [ ] silhouette is recognizable without costume color;
- [ ] face remains readable at portrait-card crop size;
- [ ] pose communicates political role/personality;
- [ ] costume communicates status, region and wealth;
- [ ] props communicate power source without relying on text;
- [ ] costume and equipment are medieval rather than fantasy-generic;
- [ ] transparent/clean background works for UI compositing;
- [ ] head-and-shoulders, chest/waist and three-quarter crops all work;
- [ ] no important storytelling detail is lost in standard gameplay crop;
- [ ] character remains visually distinct in grayscale/small-size tests.

### 1.2 The King
- [ ] Dying King master illustration
- [ ] healthy/official royal likeness if needed for seals, proclamations or opening material
- [ ] deathbed crop / late-phase presentation

### 1.3 Character expression / state requirements
Decide after lord master testing whether the release needs:
- [ ] one neutral master only per lord;
- [ ] limited alternate expressions;
- [ ] alternate damaged/disgraced/occupied states;
- [ ] separate event illustrations.

Default scope assumption: one strong master per lord, with crops and UI treatment doing most of the work. Do not multiply character variants unless testing shows a clear readability or dramatic need.

## 2. Character visual identity system

For each great house:
- [ ] heraldic primary color;
- [ ] heraldic secondary color;
- [ ] simple crest/emblem;
- [ ] shield shape / frame treatment where applicable;
- [ ] wax-seal mark;
- [ ] recurring decorative motif;
- [ ] costume integration of heraldry;
- [ ] UI accent usage rules.

Required identities:
- [ ] Greyfen / player
- [ ] Northkeep / Edric
- [ ] Eastvale / Ysabel
- [ ] Southmere / Renard
- [ ] Abbeylands / Oswin
- [ ] Westmarch / Mara
- [ ] Royal Crown / Capital
- [ ] Church / Synod

## 3. Map art

The map should not use the same rendering language as the characters. Current direction: a stylized political artifact inspired by illuminated manuscripts and painted medieval maps, implemented as SVG/DOM.

### 3.1 Base map
- [ ] parchment / substrate treatment;
- [ ] seven-territory composition;
- [ ] territory borders;
- [ ] canonical adjacency readability;
- [ ] rivers / coast / marsh / roads where useful;
- [ ] terrain motifs;
- [ ] decorative edge treatment if used;
- [ ] visual hierarchy that keeps political state legible above decoration.

### 3.2 Territory landmarks / miniatures
- [ ] Greyfen seat / fen motif
- [ ] Northkeep fortress / iron-hill motif
- [ ] Westmarch border stronghold / free-company motif
- [ ] Eastvale estate / rich agricultural motif
- [ ] Abbeylands monastery/cathedral motif
- [ ] Southmere ducal seat / old-blood motif
- [ ] Capital palace/cathedral/council-seat motif

### 3.3 Political map states
- [ ] legal owner display;
- [ ] physical occupation display;
- [ ] siege / contested display;
- [ ] unrest display;
- [ ] army commitment / garrison indication;
- [ ] selected territory state;
- [ ] hostile target state;
- [ ] adjacency / possible-invasion state;
- [ ] Capital-control emphasis;
- [ ] no confusing overlap with house colors.

## 4. Interface art direction

The interface should behave like a clean modern strategy UI while visually borrowing from medieval chancery documents, seals, ledgers, proclamations and illuminated political material.

### 4.1 Core frames and surfaces
- [ ] primary parchment/paper surface family;
- [ ] dark/wood/leather/cloth secondary surfaces if used;
- [ ] panel frames;
- [ ] portrait frames;
- [ ] lord-card frames;
- [ ] tooltip frame;
- [ ] modal / major-decision frame;
- [ ] order-slot treatment;
- [ ] resource-bar treatment;
- [ ] speed/pause control treatment.

### 4.2 Typography system
- [ ] display/title face direction;
- [ ] body/UI face direction;
- [ ] numerals/resource readability;
- [ ] proclamation/letter style;
- [ ] hierarchy rules;
- [ ] minimum-size readability test;
- [ ] avoid faux-medieval fonts for dense UI copy.

### 4.3 Core iconography
- [ ] Gold
- [ ] Levies
- [ ] Prestige
- [ ] Claim
- [ ] Influence
- [ ] King's health / royal authority
- [ ] Church standing
- [ ] Capital control
- [ ] support states: Leaning / Pledged / Committed
- [ ] relationship states if iconized
- [ ] threat/fear
- [ ] occupation
- [ ] unrest
- [ ] fortification
- [ ] wealth
- [ ] secrecy / hidden information
- [ ] spy / intrigue
- [ ] war
- [ ] bargain/agreement
- [ ] broken oath / betrayal
- [ ] evidence / scandal
- [ ] office reservation if required

## 5. Documents, messages and political artifacts

Important events should feel like objects produced by the realm rather than browser notifications.

- [ ] sealed private letter
- [ ] public proclamation
- [ ] military dispatch
- [ ] spy report
- [ ] Church decree / synod ruling
- [ ] council record
- [ ] bargain / charter
- [ ] pledge document
- [ ] ultimatum
- [ ] scandal evidence / copied correspondence
- [ ] royal genealogy / claim evidence
- [ ] forged lineage artifact
- [ ] ending/coronation decree

For each document family, decide what is unique art versus CSS/SVG styling around reusable text.

## 6. Action presentation

Base action families need visual affordances, not necessarily bespoke illustrations.

- [ ] Send Gift
- [ ] Make Agreement
- [ ] Request Support
- [ ] Threaten
- [ ] Spy
- [ ] Forge/Fabricate Royal Descent
- [ ] Expose Scandal
- [ ] Invade
- [ ] Raise Taxes
- [ ] Hold Feast / Court
- [ ] Patronize Church
- [ ] contextual denouncement / succession actions where applicable

Each action should have:
- [ ] icon or visual motif;
- [ ] hover/selected state;
- [ ] active-order state;
- [ ] completion/result state;
- [ ] failure/cancellation state where needed.

## 7. War and occupation visuals

No tactical battlefield art is required.

- [ ] pre-war comparison presentation;
- [ ] committed-levy display;
- [ ] mercenary indicator;
- [ ] fortification indicator;
- [ ] battle result presentation;
- [ ] casualty presentation;
- [ ] occupation/garrison presentation;
- [ ] dispossessed-lord treatment;
- [ ] military threat / containment signal;
- [ ] Capital seizure/acclamation presentation.

Optional, only if cheap and useful:
- [ ] small battle vignette family;
- [ ] banners / crossed standards;
- [ ] manuscript-style conflict markers.

## 8. Church and legitimacy visuals

- [ ] Church emblem / institutional identity
- [ ] Abbeylands sacred visual language
- [ ] Favorable / Neutral / Hostile Church states
- [ ] patronage visual
- [ ] legitimacy / Claim quality visual language
- [ ] genealogy / royal-blood motif
- [ ] exposed-forgery visual treatment
- [ ] coronation/cathedral visual language

## 9. Succession UI and climax

- [ ] “If the King Died Today” forecast presentation
- [ ] claimant header treatment
- [ ] noble support presentation
- [ ] Claim status presentation
- [ ] Church status presentation
- [ ] Capital-control presentation
- [ ] ballot / Council visual treatment
- [ ] tie-break presentation
- [ ] military-acclamation presentation
- [ ] “The King Is Dead” transition
- [ ] final vote / succession reveal
- [ ] win ending
- [ ] loss ending
- [ ] ending report / explanation screen

The ending must visually support the design requirement that the player can understand why every lord voted as they did.

## 10. Time, health and pressure visuals

- [ ] royal-health phase treatment: Stable
- [ ] Ailing
- [ ] Gravely Ill
- [ ] Deathbed
- [ ] physician-report presentation
- [ ] day/week indication
- [ ] Royal Authority decay presentation if surfaced
- [ ] final-days urgency treatment

Avoid turning the king's condition into a clean modern countdown if the design intends uncertainty.

## 11. Events and narrative moments

Sixteen authored events are in launch scope. Once event content is locked:
- [ ] classify which events need no bespoke art;
- [ ] identify reusable vignette motifs;
- [ ] identify 3–5 high-value event illustrations if any;
- [ ] define event-card frame;
- [ ] define systemic-notification treatment;
- [ ] define major-shock treatment.

Do not assume sixteen unique illustrations.

## 12. Onboarding and tutorial art

- [ ] opening kingdom tableau
- [ ] King-is-dying setup
- [ ] player/Greyfen introduction
- [ ] Renard-as-favorite introduction
- [ ] lord-cast introduction treatment
- [ ] first Order tutorial highlight
- [ ] map/tutorial highlight states
- [ ] declaration tutorial moment
- [ ] succession-forecast tutorial moment

## 13. Endings and promotional-quality key art

Not required before core gameplay art is locked, but plan for:
- [ ] title-screen key art
- [ ] game logo / wordmark
- [ ] crown motif
- [ ] favicon / app icon
- [ ] social/store capsule images if release needs them
- [ ] victory tableau
- [ ] defeat tableau
- [ ] optional alternate ending cards by succession route

## 14. Environmental / decorative art

Only after core readability is solved:
- [ ] illuminated initials / marginalia family
- [ ] flourishes/dividers
- [ ] wax seals
- [ ] ribbons
- [ ] ink stamps
- [ ] royal/church insignia
- [ ] crowns
- [ ] swords / maces / keys / books / coins as reusable object motifs
- [ ] subtle paper stains/wear

Decoration must never reduce clarity or make the UI look like a novelty parchment website.

## 15. Technical asset requirements

For every final raster character asset:
- [ ] agreed master resolution;
- [ ] alpha/transparent background where appropriate;
- [ ] safe crop margins;
- [ ] no baked UI frame;
- [ ] consistent ground/foot placement for full-body masters;
- [ ] consistent lighting family;
- [ ] consistent camera/lens feeling;
- [ ] export size variants defined;
- [ ] compression format defined;
- [ ] browser memory/performance checked.

For SVG/UI assets:
- [ ] scalable paths;
- [ ] clean IDs/classes where code interaction is needed;
- [ ] hover/selected variants designed;
- [ ] no excessive path complexity;
- [ ] accessible contrast;
- [ ] readable at intended minimum size.

## 16. Art QA checklist

Before an asset family is locked:
- [ ] reads correctly in the actual game layout;
- [ ] reads at minimum intended size;
- [ ] visually belongs to the same project;
- [ ] character/house identity is immediately recognizable;
- [ ] political meaning is not dependent on color alone;
- [ ] does not contradict canonical game rules or actor characterization;
- [ ] does not introduce unsupported fantasy/sci-fi elements;
- [ ] does not make every noble look like a frontline warrior;
- [ ] does not obscure interactive UI;
- [ ] supports the game’s tone: intimate, aristocratic, dangerous, political.

## 17. Production order

### Phase A — lock lord art
1. [ ] Define initial character art specification.
2. [ ] Produce multiple test directions for one or two lords.
3. [ ] Test full-body masters and standard crops inside rough UI.
4. [ ] Lock rendering style, camera, historical period, material detail, pose language and silhouette rules.
5. [ ] Produce all six great lords.
6. [ ] Produce the King after the lord style is stable.

### Phase B — lock heraldry and political visual language
7. [ ] House identities.
8. [ ] Church and Crown identities.
9. [ ] Support / Claim / occupation / war icon language.

### Phase C — map and UI
10. [ ] Map art.
11. [ ] document families.
12. [ ] interface frames/surfaces.
13. [ ] action presentation.
14. [ ] succession/climax presentation.

### Phase D — polish
15. [ ] event vignettes where justified.
16. [ ] onboarding polish.
17. [ ] title/key art.
18. [ ] decorative pass.

## Immediate next milestone

Do not begin broad asset production yet.

The next milestone is to **prove the lord character-art direction**. Testing should establish whether the current semi-realistic, highly rendered, full-body character approach can produce a coherent medieval cast that is readable, distinctive, politically expressive and practical to crop/reuse in the game UI.
