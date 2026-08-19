export const sourceMappings = [
  {
    designSection: 'designer/game-rules.md §§1–10',
    contentModule: 'src/content/actions.ts and src/content/rules.ts',
    entityIds: ['stable', 'ailing', 'gravely-ill', 'deathbed', 'send-gift', 'raise-taxes'],
  },
  {
    designSection: 'designer/world-and-actors.md §§1–15',
    contentModule: 'src/content/world.ts',
    entityIds: [
      'greyfen',
      'northkeep',
      'westmarch',
      'eastvale',
      'abbeylands',
      'southmere',
      'capital',
    ],
  },
  {
    designSection: 'designer/candidate-evaluation.md §§1–11',
    contentModule: 'src/content/rules.ts',
    entityIds: [
      'edric-major-victory',
      'ysabel-public-support',
      'oswin-lawful-legitimacy',
      'mara-charter',
    ],
  },
  {
    designSection: 'designer/politics-and-succession.md §§1–17',
    contentModule: 'src/content/rules.ts and src/content/actions.ts',
    entityIds: ['request-declaration', 'break-agreement', 'cast-greyfens-vote'],
  },
  {
    designSection: 'designer/war-and-occupation.md §§1–17',
    contentModule: 'src/content/rules.ts and src/content/actions.ts',
    entityIds: ['invade-territory', 'march-on-capital', 'withdraw-occupation'],
  },
  {
    designSection: 'designer/ai-information-events.md §§1–17',
    contentModule: 'src/content/narrative.ts and src/content/world.ts',
    entityIds: ['e01-prognosis', 'e13-merchant-syndicate-loan', 'e16-funeral-preparations'],
  },
  {
    designSection: 'designer/interface-content-and-production.md §§2–10,14',
    contentModule: 'src/content/actions.ts, src/content/assets.ts and src/content/narrative.ts',
    entityIds: ['title-key-art', 'map-kingdom-plate', 'crowned-by-council'],
  },
  {
    designSection: 'designer/balance-sheet.md §§1–22',
    contentModule: 'src/content/world.ts, src/content/rules.ts and src/content/narrative.ts',
    entityIds: [
      'renard-questioned-paternity',
      'ysabel-tax-embezzlement',
      'player-forgery-evidence',
    ],
  },
  {
    designSection: 'designer/paperplay/final-amendments.md §§1–22',
    contentModule: 'src/content/actions.ts, src/content/rules.ts and src/content/narrative.ts',
    entityIds: ['offer-bargain', 'confess-and-seek-penance', 'e13-merchant-syndicate-loan'],
  },
] as const;
