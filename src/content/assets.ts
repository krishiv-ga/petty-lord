import type { AssetSlot } from './schemas';

const semanticRole = (id: string) => `content.label.asset-${id}`;

type SlotOverrides = Partial<
  Pick<
    AssetSlot,
    | 'logicalWidth'
    | 'logicalHeight'
    | 'allowedFormats'
    | 'densities'
    | 'alpha'
    | 'background'
    | 'fallbackKey'
    | 'expectedSources'
  >
>;

const slot = (
  id: string,
  category: AssetSlot['category'],
  fallbackKey: string | null,
  overrides: SlotOverrides = {},
): AssetSlot => {
  const logicalWidth = overrides.logicalWidth ?? 24;
  const logicalHeight = overrides.logicalHeight ?? 24;
  return {
    id,
    category,
    semanticRoleKey: semanticRole(id),
    logicalWidth,
    logicalHeight,
    aspectRatio: logicalWidth / logicalHeight,
    allowedFormats: overrides.allowedFormats ?? ['png', 'webp'],
    densities: overrides.densities ?? [1, 2],
    alpha: overrides.alpha ?? 'required',
    background: overrides.background ?? 'transparent',
    fallbackKey: overrides.fallbackKey === undefined ? fallbackKey : overrides.fallbackKey,
    expectedSources: overrides.expectedSources ?? [],
  };
};

const fallbacks = [
  slot('fallback-portrait', 'fallback', null, { logicalWidth: 180, logicalHeight: 240 }),
  slot('fallback-crest', 'fallback', null, { logicalWidth: 64, logicalHeight: 72 }),
  slot('fallback-emblem', 'fallback', null, { logicalWidth: 64, logicalHeight: 64 }),
  slot('fallback-icon', 'fallback', null),
  slot('fallback-map', 'fallback', null, {
    logicalWidth: 1440,
    logicalHeight: 900,
    densities: [1],
    alpha: 'opaque',
    background: 'painted',
  }),
  slot('fallback-decorative', 'fallback', null, { logicalWidth: 256, logicalHeight: 128 }),
];

const portraits = ['greyfen', 'edric', 'ysabel', 'renard', 'oswin', 'mara'].map((id) =>
  slot(`portrait-${id}`, 'portrait', 'fallback-portrait', {
    logicalWidth: 180,
    logicalHeight: 240,
  }),
);

const kingPortraits = ['stable', 'ailing', 'gravely-ill', 'deathbed'].map((id) =>
  slot(`portrait-king-${id}`, 'portrait', 'fallback-portrait', {
    logicalWidth: 180,
    logicalHeight: 240,
  }),
);

const crests = ['greyfen', 'edric', 'ysabel', 'renard', 'oswin', 'mara'].map((id) =>
  slot(`crest-${id}`, 'crest', 'fallback-crest', { logicalWidth: 64, logicalHeight: 72 }),
);

const territoryEmblems = [
  'greyfen',
  'northkeep',
  'westmarch',
  'eastvale',
  'abbeylands',
  'southmere',
  'capital',
].map((id) =>
  slot(`emblem-${id}`, 'territory-emblem', 'fallback-emblem', {
    logicalWidth: 64,
    logicalHeight: 64,
  }),
);

const mapSlots = [
  slot('map-kingdom-plate', 'map', 'fallback-map', {
    logicalWidth: 1440,
    logicalHeight: 900,
    densities: [1, 2],
    alpha: 'opaque',
    background: 'painted',
  }),
  slot('overlay-campaign-line', 'overlay', 'fallback-decorative', {
    logicalWidth: 512,
    logicalHeight: 32,
  }),
  slot('overlay-adjacency', 'overlay', 'fallback-decorative', {
    logicalWidth: 256,
    logicalHeight: 64,
  }),
  slot('overlay-occupation-banner', 'overlay', 'fallback-decorative', {
    logicalWidth: 160,
    logicalHeight: 48,
  }),
  slot('overlay-capital-uncontrolled', 'overlay', 'fallback-decorative', {
    logicalWidth: 160,
    logicalHeight: 160,
  }),
];

const resourceIcons = ['gold', 'levies', 'prestige', 'claim', 'influence'].map((id) =>
  slot(`icon-resource-${id}`, 'icon', 'fallback-icon'),
);

const statusIcons = [
  'leaning',
  'pledged',
  'committed',
  'under-duress',
  'secretly-coerced',
  'dispossessed',
  'occupation',
  'tax-strain',
  'unrest',
  'stale-intelligence',
  'unknown-intelligence',
  'church',
  'crown',
].map((id) => slot(`icon-status-${id}`, 'icon', 'fallback-icon'));

const actionIcons = [
  'gift',
  'offer-bargain',
  'request-declaration',
  'threaten',
  'spy',
  'build-claim',
  'expose-secret',
  'invade',
  'raise-taxes',
  'hold-court',
  'patronize-church',
].map((id) => slot(`icon-action-${id}`, 'icon', 'fallback-icon'));

const politicalDecor = [
  slot('seal-pledge', 'seal', 'fallback-decorative', { logicalWidth: 96, logicalHeight: 96 }),
  slot('seal-church', 'seal', 'fallback-decorative', { logicalWidth: 96, logicalHeight: 96 }),
  slot('seal-crown', 'seal', 'fallback-decorative', { logicalWidth: 96, logicalHeight: 96 }),
  slot('ribbon-leaning', 'ribbon', 'fallback-decorative', { logicalWidth: 192, logicalHeight: 48 }),
  slot('ribbon-pledged', 'ribbon', 'fallback-decorative', { logicalWidth: 192, logicalHeight: 48 }),
  slot('ribbon-committed', 'ribbon', 'fallback-decorative', {
    logicalWidth: 192,
    logicalHeight: 48,
  }),
  slot('ribbon-under-duress', 'ribbon', 'fallback-decorative', {
    logicalWidth: 192,
    logicalHeight: 48,
  }),
  slot('texture-parchment', 'texture', 'fallback-decorative', {
    logicalWidth: 1024,
    logicalHeight: 1024,
    densities: [1],
    alpha: 'opaque',
    background: 'parchment',
  }),
  slot('texture-iron', 'texture', 'fallback-decorative', {
    logicalWidth: 512,
    logicalHeight: 512,
    densities: [1],
    alpha: 'opaque',
    background: 'painted',
  }),
  slot('letter-decision', 'letter', 'fallback-decorative', {
    logicalWidth: 720,
    logicalHeight: 540,
    alpha: 'allowed',
    background: 'parchment',
  }),
  slot('letter-proclamation', 'letter', 'fallback-decorative', {
    logicalWidth: 720,
    logicalHeight: 540,
    alpha: 'allowed',
    background: 'parchment',
  }),
];

const endingSlots = [
  'crowned-by-acclamation',
  'crowned-by-council',
  'crowned-by-church',
  'master-of-capital',
  'rightful-heir',
  'crowned-by-sword',
].map((id) =>
  slot(`ending-${id}`, 'ending', 'fallback-decorative', {
    logicalWidth: 960,
    logicalHeight: 540,
    alpha: 'opaque',
    background: 'painted',
  }),
);

const titleSlots = [
  slot('title-key-art', 'title', 'fallback-map', {
    logicalWidth: 1440,
    logicalHeight: 900,
    densities: [1, 2],
    alpha: 'opaque',
    background: 'painted',
  }),
];

export const assets: AssetSlot[] = [
  ...fallbacks,
  ...portraits,
  ...kingPortraits,
  ...crests,
  ...territoryEmblems,
  ...mapSlots,
  ...resourceIcons,
  ...statusIcons,
  ...actionIcons,
  ...politicalDecor,
  ...endingSlots,
  ...titleSlots,
];
