import type { z } from 'zod';
import type { textEntrySchema } from './schemas';

type TextEntry = z.infer<typeof textEntrySchema>;

const USER_FACING_OVERRIDES: Readonly<Record<string, string>> = {
  'content.label.lord-greyfen': 'Lord of Greyfen',
  'content.label.lord-edric': 'Edric',
  'content.label.lord-ysabel': 'Ysabel',
  'content.label.lord-renard': 'Renard',
  'content.label.lord-oswin': 'Oswin',
  'content.label.lord-mara': 'Mara',
  'content.label.epithet-hawk': 'The Hawk',
  'content.label.epithet-spider': 'The Spider',
  'content.label.epithet-favorite': 'The Favorite',
  'content.label.epithet-pious': 'The Pious',
  'content.label.epithet-rebel': 'The Rebel',
  'content.label.action-send-gift': 'Send Gift',
  'content.label.action-offer-bargain': 'Offer Bargain',
  'content.label.action-request-declaration': 'Request Declaration',
  'content.label.action-watch-court': 'Watch Court',
  'content.label.action-find-dirt': 'Find Dirt',
  'content.label.action-research-lineage': 'Research Lineage',
  'content.label.action-forge-royal-descent': 'Forge Royal Descent',
  'content.label.action-expose-secret': 'Expose Secret',
  'content.label.action-invade-territory': 'Invade Territory',
  'content.label.action-raise-taxes': 'Raise Taxes',
  'content.label.action-hold-court': 'Hold Court',
  'content.label.action-patronize-church': 'Patronize Church',
  'content.label.action-declare-candidacy': 'Declare Candidacy',
  'content.label.action-march-on-capital': 'March on the Capital',
  'content.label.action-break-agreement': 'Break Agreement',
  'content.label.action-withdraw-occupation': 'Withdraw Occupation',
  'content.label.action-confess-and-seek-penance': 'Confess and Seek Penance',
  'content.label.action-cast-greyfens-vote': "Cast Greyfen's Vote",
  'ending.section.header': 'Winner, route, death day, seed, and elapsed time.',
  'ending.section.constitution': 'Constitutional reconstruction and every ballot.',
  'ending.section.realm-cost': 'Political and material cost to the realm.',
  'ending.section.turning-points': 'Up to five decisive turning points.',
  'ending.section.replay': 'Replay with the same seed or begin a new crisis.',
};

const TEXT_PREFIXES = [
  'content.label.',
  'content.explanation.',
  'preview.',
  'chronicle.',
  'ending.',
];

const isTextKey = (value: string): boolean =>
  TEXT_PREFIXES.some((prefix) => value.startsWith(prefix));

const collect = (value: unknown, keys: Set<string>): void => {
  if (typeof value === 'string') {
    if (isTextKey(value)) keys.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const child of value) collect(child, keys);
    return;
  }
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) collect(child, keys);
  }
};

const titleFromKey = (key: string): string => {
  const segment = key.split('.').at(-1) ?? key;
  return segment
    .split('-')
    .map((word) => (word.length === 0 ? word : `${word[0]?.toUpperCase()}${word.slice(1)}`))
    .join(' ');
};

const roleFor = (key: string): TextEntry['role'] => {
  if (key.startsWith('content.label.asset-')) return 'asset';
  if (key.startsWith('content.label.')) return 'label';
  if (key.startsWith('content.explanation.')) return 'explanation';
  if (key.startsWith('preview.')) return 'preview';
  if (key.startsWith('chronicle.')) return 'chronicle';
  if (key.startsWith('ending.')) return 'ending';
  return 'glossary';
};

const maximumFor = (role: TextEntry['role']): number => {
  switch (role) {
    case 'label':
      return 64;
    case 'preview':
      return 96;
    case 'chronicle':
      return 180;
    case 'ending':
      return 280;
    case 'asset':
      return 120;
    default:
      return 240;
  }
};

const placeholderFor = (key: string, role: TextEntry['role']): string => {
  const title = titleFromKey(key);
  if (role === 'explanation') return `Canonical rules and consequences for ${title}.`;
  if (role === 'preview') return `${title}.`;
  if (role === 'chronicle') return `${title}.`;
  if (role === 'ending') return `${title}.`;
  if (role === 'asset') return `${title} raster asset.`;
  return title;
};

export const buildTextCatalog = (...sources: unknown[]): TextEntry[] => {
  const keys = new Set<string>();
  for (const source of sources) collect(source, keys);

  return [...keys]
    .sort((left, right) => left.localeCompare(right, 'en'))
    .map((key) => {
      const role = roleFor(key);
      const defaultText = USER_FACING_OVERRIDES[key] ?? placeholderFor(key, role);
      return {
        key,
        role,
        defaultText,
        maxLength: Math.max(maximumFor(role), defaultText.length),
      };
    });
};
