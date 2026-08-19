import type { AllegianceRibbonProps, IntelligenceAgeProps } from '../foundation/PoliticalObjects';

export type LordStripFixture = {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly relationship: string;
  readonly support: AllegianceRibbonProps['level'];
  readonly visibility: 'public' | 'private';
  readonly intelligence: IntelligenceAgeProps['state'];
  readonly observed?: string;
  readonly status: string;
  readonly unread?: boolean;
};

export const lordStripFixtures: readonly LordStripFixture[] = [
  {
    id: 'greyfen',
    name: 'The Lord of Greyfen',
    title: 'Player seat · Keeper of the Fen Roads',
    relationship: 'Self · exact knowledge',
    support: 'none',
    visibility: 'public',
    intelligence: 'public',
    observed: 'current',
    status: 'Declared candidate · Homeland secure',
  },
  {
    id: 'edric',
    name: 'Edric the Hawk',
    title: 'Lord of Northkeep',
    relationship: 'Cordial · +22',
    support: 'pledged',
    visibility: 'public',
    intelligence: 'public',
    status: 'Candidate · Public Pledge',
  },
  {
    id: 'ysabel',
    name: 'Ysabel the Spider',
    title: 'Lady of Eastvale and Keeper of the Golden Vale',
    relationship: 'Warm · +44',
    support: 'leaning',
    visibility: 'private',
    intelligence: 'fresh',
    observed: 'observed Day 31',
    status: 'Private Leaning · Not a vote',
    unread: true,
  },
  {
    id: 'oswin',
    name: 'Oswin the Pious',
    title: 'Lord of Abbeylands',
    relationship: 'Neutral · +8',
    support: 'duress',
    visibility: 'public',
    intelligence: 'public',
    status: 'Under Duress · Leverage visible',
  },
  {
    id: 'mara',
    name: 'Mara the Rebel',
    title: 'Dispossessed Lady of Westmarch',
    relationship: 'Cold · −28',
    support: 'none',
    visibility: 'public',
    intelligence: 'stale',
    observed: 'last seen Day 27',
    status: 'Dispossessed · Vote retained',
  },
  {
    id: 'renard',
    name: 'Renard the Favorite with a Deliberately Long Ceremonial Style',
    title: 'Lord of Southmere, First Cousin to His Failing Majesty',
    relationship: 'Hostile · −63',
    support: 'committed',
    visibility: 'public',
    intelligence: 'unknown',
    status: 'Candidate · Intent unread',
    unread: true,
  },
] as const;

export const actionPreviewFixture = {
  action: 'Offer the Greyfen Charter to Mara',
  duration: '3 days',
  cost: '20 Gold now',
  collateral: 'Greyfen income and levy recovery ×0.75 for the remainder of the crisis',
  troops: 'No troops locked',
  visibility: 'Public proclamation',
  consequence:
    'Creates concrete anti-central Proof for Mara. It may enable a Pledge only while her Leaning is continuously maintained.',
  unknown:
    'Mara’s exact reaction after a rival occupation remains intentionally unknown until that state is observed.',
  cancellation: 'Cancel before completion: lose 10 Gold and expose hesitation in the Chronicle.',
} as const;

export const chronicleFixtures = [
  {
    day: 'Day 34 · Dawn',
    category: 'succession' as const,
    text: 'The King’s physicians now speak only in hours; long preparations are locked.',
  },
  {
    day: 'Day 34 · Bell II',
    category: 'war' as const,
    text: 'Capital → Uncontrolled — only 176 troops survived the withdrawal.',
  },
  {
    day: 'Day 34 · Bell III',
    category: 'intelligence' as const,
    text: 'Ysabel’s courier confirms the pledge remains, but her private reason is seven days old.',
  },
] as const;

export const mapHotspots = [
  { id: 'northkeep', label: 'Northkeep', x: 49, y: 18, state: 'Edric · 620 known levies' },
  { id: 'westmarch', label: 'Westmarch', x: 24, y: 36, state: 'Mara · dispossessed' },
  { id: 'eastvale', label: 'Eastvale', x: 75, y: 35, state: 'Ysabel · public control' },
  { id: 'capital', label: 'Capital', x: 50, y: 50, state: 'Uncontrolled · urgent' },
  { id: 'greyfen', label: 'Greyfen', x: 27, y: 68, state: 'Player seat · selected' },
  { id: 'abbeylands', label: 'Abbeylands', x: 50, y: 76, state: 'Oswin · holy seat' },
  { id: 'southmere', label: 'Southmere', x: 75, y: 68, state: 'Renard · occupied' },
] as const;
