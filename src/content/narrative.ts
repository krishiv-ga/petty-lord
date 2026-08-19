import type { EventDefinition, StructuredEffect } from './schemas';

const label = (id: string) => `content.label.${id}`;
const explanation = (id: string) => `content.explanation.${id}`;

const effect = (
  effectId: StructuredEffect['effectId'],
  target: StructuredEffect['target'],
  value?: number,
  referenceId?: string,
  visibility: StructuredEffect['visibility'] = 'public',
  durationDays?: number,
): StructuredEffect => ({
  effectId,
  target,
  ...(value === undefined ? {} : { value }),
  ...(referenceId === undefined ? {} : { referenceId }),
  ...(durationDays === undefined ? {} : { durationDays }),
  visibility,
});

const secretBase = (id: string, targetLordId: string, pool: string) => ({
  id,
  targetLordId,
  pool,
  devastating: true,
  canBlackmail: true,
  blackmailUseLimit: 1,
  exposeUseLimit: 1,
  discoveryRuleId: `discover-${id}`,
  labelKey: label(`secret-${id}`),
  explanationKey: explanation(`secret-${id}`),
});

export const secrets = [
  {
    ...secretBase('renard-questioned-paternity', 'renard', 'renard-guaranteed'),
    effects: [
      effect('adjust-claim', 'renard', -20),
      effect('adjust-prestige', 'renard', -5),
      effect('remove-favorite', 'renard'),
      effect('adjust-church-conduct', 'renard', -1),
      effect('set-support-shock', 'oswin', 15, 'renard-paternity-oswin'),
      effect('set-support-shock', 'ysabel', 8, 'renard-paternity-ysabel'),
    ],
  },
  {
    ...secretBase('renard-foreign-concession', 'renard', 'renard-guaranteed'),
    effects: [
      effect('adjust-prestige', 'renard', -8),
      effect('remove-favorite', 'renard'),
      effect('adjust-relationship', 'edric', -25, 'renard'),
      effect('adjust-relationship', 'mara', -15, 'renard'),
      effect('set-support-shock', 'edric', 20, 'renard-foreign-concession-edric'),
      effect('apply-condition', 'renard', undefined, 'compromised-sovereignty'),
    ],
  },
  {
    ...secretBase('renard-bought-royal-testament', 'renard', 'renard-guaranteed'),
    effects: [
      effect('adjust-claim', 'renard', -15),
      effect('adjust-prestige', 'renard', -8),
      effect('remove-favorite', 'renard'),
      effect('adjust-church-conduct', 'renard', -1),
      effect('set-support-shock', 'all-voluntary-renard-pledges', 10, 'renard-testament-voluntary'),
      effect('set-support-shock', 'oswin', 15, 'renard-testament-oswin'),
    ],
  },
  {
    ...secretBase('edric-border-massacre', 'edric', 'additional-npc'),
    effects: [
      effect('adjust-prestige', 'edric', -8),
      effect('adjust-church-conduct', 'edric', -2),
      effect('adjust-relationship', 'mara', -25, 'edric'),
      effect('adjust-relationship', 'oswin', -15, 'edric'),
      effect('set-support-shock', 'all-edric-candidate-pledges', 10, 'edric-massacre-pledges'),
    ],
  },
  {
    ...secretBase('ysabel-tax-embezzlement', 'ysabel', 'additional-npc'),
    effects: [
      effect('adjust-gold', 'ysabel', -40),
      effect('adjust-prestige', 'ysabel', -8),
      effect('adjust-relationship', 'renard', -20, 'ysabel'),
      effect(
        'set-support-shock',
        'ysabel-opportunistic-pledge',
        10,
        'ysabel-embezzlement-opportunism',
      ),
    ],
  },
  {
    ...secretBase('oswin-simony', 'oswin', 'additional-npc'),
    effects: [
      effect('adjust-prestige', 'oswin', -10),
      effect('adjust-relationship', 'edric', -10, 'oswin'),
      effect('adjust-relationship', 'ysabel', -10, 'oswin'),
      effect('adjust-relationship', 'renard', -10, 'oswin'),
      effect('adjust-relationship', 'mara', -10, 'oswin'),
      effect('apply-condition', 'oswin', undefined, 'oswin-simony'),
      effect('set-bargain-progress', 'church', 1, 'recalculate-church-case'),
    ],
  },
  {
    ...secretBase('mara-smuggler-compact', 'mara', 'additional-npc'),
    effects: [
      effect('adjust-prestige', 'mara', -6),
      effect('adjust-gold', 'mara', -30),
      effect('adjust-relationship', 'oswin', -15, 'mara'),
      effect('disable-trait', 'mara', undefined, 'free-companies', 'public', 7),
    ],
  },
  {
    ...secretBase('player-forgery-evidence', 'greyfen', 'conditional-player'),
    effects: [
      effect('adjust-claim', 'player', -20),
      effect('adjust-prestige', 'player', -10),
      effect('set-church-state', 'church', undefined, 'condemned'),
      effect('set-support-shock', 'all-player-supporters', 20, 'forgery-exposed'),
      effect('set-support-shock', 'all-player-supporters', 10, 'forgery-exposed-other-basis'),
      effect('apply-condition', 'player', undefined, 'forgery-evidence'),
    ],
  },
] as const;

const choice = (
  id: string,
  goldCost: number,
  influenceCost: number,
  effects: StructuredEffect[],
  requirementIds: string[] = [],
  randomOutcome?: NonNullable<EventDefinition['choices'][number]['randomOutcome']>,
) => ({
  id,
  labelKey: label(`event-choice-${id}`),
  explanationKey: explanation(`event-choice-${id}`),
  goldCost,
  influenceCost,
  requirementIds,
  effects,
  ...(randomOutcome === undefined ? {} : { randomOutcome }),
});

const eventBase = (
  id: string,
  displayOrder: number,
  kind: 'mandatory' | 'ambient',
  phaseIds: string[],
  elapsedDayWindow: [number, number] | null,
  requirementIds: string[] = [],
) => ({
  id,
  displayOrder,
  kind,
  phaseIds,
  elapsedDayWindow,
  weight: 1,
  cooldownDays: 0,
  requirementIds,
  maximumOccurrences: 1,
  labelKey: label(`event-${id}`),
  explanationKey: explanation(`event-${id}`),
  chronicleKey: `chronicle.event.${id}`,
});

export const events = [
  {
    ...eventBase('e01-prognosis', 1, 'mandatory', ['stable'], null),
    choices: [choice('e01-understand', 0, 0, [effect('none', 'none')])],
  },
  {
    ...eventBase('e02-king-takes-to-bed', 2, 'mandatory', ['ailing'], null),
    choices: [
      choice('e02-continue', 0, 0, [
        effect('declare-candidate', 'renard'),
        effect('unlock-phase-rules', 'none', undefined, 'ailing'),
      ]),
    ],
  },
  {
    ...eventBase('e03-last-council', 3, 'mandatory', ['gravely-ill'], null),
    choices: [
      choice('e03-continue', 0, 0, [
        effect('unlock-phase-rules', 'capital', undefined, 'gravely-ill'),
      ]),
    ],
  },
  {
    ...eventBase('e04-deathbed', 4, 'mandatory', ['deathbed'], null),
    choices: [
      choice('e04-continue', 0, 0, [effect('unlock-phase-rules', 'none', undefined, 'deathbed')]),
    ],
  },
  {
    ...eventBase(
      'e05-failed-harvest',
      5,
      'ambient',
      ['stable', 'ailing', 'gravely-ill', 'deathbed'],
      [6, 49],
      ['greyfen-unoccupied', 'no-unrest'],
    ),
    choices: [
      choice('e05-buy-grain', 30, 0, [effect('adjust-prestige', 'player', 3)]),
      choice('e05-open-granaries', 0, 0, [
        effect('adjust-gold', 'player', -7, 'greyfen-income-days'),
        effect('adjust-relationship', 'mara', 5),
        effect('adjust-prestige', 'player', 2),
      ]),
      choice('e05-villages-bear', 0, 0, [
        effect('apply-condition', 'greyfen', undefined, 'tax-strain', 'public', 14),
        effect('adjust-prestige', 'player', -4),
      ]),
    ],
  },
  {
    ...eventBase(
      'e06-northern-raiders',
      6,
      'ambient',
      ['stable', 'ailing'],
      [6, 26],
      ['edric-holds-northkeep', 'mara-holds-westmarch'],
    ),
    choices: [
      choice(
        'e06-send-levies',
        0,
        0,
        [
          effect('lock-troops', 'player', 100, 'three-days'),
          effect('adjust-levies', 'player', -20, 'stored-uniform-zero-to-twenty'),
          effect('adjust-relationship', 'edric', 6),
          effect('set-bargain-progress', 'edric', 1, 'border-aid-proof'),
        ],
        ['at-least-100-available-levies'],
        {
          distribution: 'uniform-integer',
          values: [0, 20],
          storedAt: 'choice',
          purposeKey: 'content.explanation.random-raider-casualties',
        },
      ),
      choice('e06-pay', 25, 0, [
        effect('adjust-relationship', 'edric', 3),
        effect('adjust-relationship', 'mara', 3),
      ]),
      choice('e06-stay-out', 0, 0, [
        effect('adjust-relationship', 'mara', -5, 'edric'),
        effect('set-intent-weight', 'edric', 1, 'border'),
      ]),
    ],
  },
  {
    ...eventBase(
      'e07-forgotten-genealogy',
      7,
      'ambient',
      ['stable', 'ailing', 'gravely-ill'],
      [6, 42],
      ['not-both-claim-projects-completed'],
    ),
    choices: [
      choice('e07-pay-researchers', 35, 0, [effect('adjust-claim', 'player', 6)]),
      choice('e07-spend-influence', 0, 10, [
        effect('adjust-claim', 'player', 4, 'two-if-oswin-cold'),
      ]),
      choice('e07-sell-to-ysabel', 0, 0, [
        effect('adjust-gold', 'player', 25),
        effect('adjust-relationship', 'ysabel', 5),
      ]),
    ],
  },
  {
    ...eventBase(
      'e08-saints-hand',
      8,
      'ambient',
      ['stable', 'ailing', 'gravely-ill', 'deathbed'],
      [6, 49],
      ['abbeylands-unoccupied'],
    ),
    choices: [
      choice('e08-sponsor', 25, 0, [
        effect('adjust-church-conduct', 'player', 1),
        effect('adjust-relationship', 'oswin', 5),
      ]),
      choice('e08-attend', 0, 0, [effect('adjust-relationship', 'oswin', 2)]),
      choice('e08-dismiss', 0, 0, [
        effect('adjust-relationship', 'mara', 3),
        effect('adjust-church-conduct', 'player', -1),
      ]),
    ],
  },
  {
    ...eventBase(
      'e09-unpaid-capital-guard',
      9,
      'ambient',
      ['stable', 'ailing', 'gravely-ill'],
      [6, 34],
      ['capital-royal'],
    ),
    choices: [
      choice('e09-pay-guard', 50, 0, [
        effect('apply-condition', 'player', undefined, 'guard-favor'),
        effect('set-capital-garrison-modifier', 'capital', -75, 'player-only'),
      ]),
      choice('e09-tell-renard', 0, 0, [effect('adjust-relationship', 'renard', 6)]),
      choice(
        'e09-ignore',
        0,
        0,
        [
          effect(
            'set-capital-garrison-modifier',
            'capital',
            -50,
            'stored-weighted-zero-minus-25-minus-50',
          ),
        ],
        [],
        {
          distribution: 'weighted',
          values: [0, -25, -50],
          weights: [50, 25, 25],
          storedAt: 'choice',
          purposeKey: 'content.explanation.random-capital-guard',
        },
      ),
    ],
  },
  {
    ...eventBase(
      'e10-renards-progress',
      10,
      'ambient',
      ['ailing'],
      [14, 28],
      ['southmere-held-by-renard'],
    ),
    choices: [
      choice('e10-attend', 0, 0, [
        effect('adjust-relationship', 'renard', 4),
        effect('adjust-relationship', 'mara', -2),
        effect('reveal-intelligence', 'renard', undefined, 'exact-public-claim-case'),
      ]),
      choice('e10-send-spies', 15, 0, [
        effect('set-bargain-progress', 'renard', 10, 'one-use-find-dirt-bonus'),
        effect('adjust-relationship', 'renard', -5, 'only-if-detected', 'private'),
      ]),
      choice('e10-mock', 0, 0, [
        effect('adjust-prestige', 'player', 3, 'minus-three-if-prestige-below-25'),
        effect('adjust-relationship', 'renard', -10),
      ]),
    ],
  },
  {
    ...eventBase(
      'e11-provincial-liberties',
      11,
      'ambient',
      ['stable', 'ailing', 'gravely-ill'],
      [6, 42],
      ['no-greyfen-charter'],
    ),
    choices: [
      choice('e11-support', 0, 0, [
        effect('enact-policy', 'player', 0.9, 'provincial-liberties'),
        effect('adjust-relationship', 'mara', 8),
        effect('adjust-relationship', 'edric', -4),
        effect('adjust-relationship', 'oswin', -3),
      ]),
      choice('e11-defend-crown', 0, 0, [
        effect('adjust-relationship', 'edric', 5),
        effect('adjust-relationship', 'renard', 4),
        effect('adjust-relationship', 'mara', -10),
      ]),
      choice('e11-avoid', 0, 0, [
        effect('set-bargain-progress', 'player', 10, 'next-mara-bargain-influence'),
      ]),
    ],
  },
  {
    ...eventBase(
      'e12-hawks-tournament',
      12,
      'ambient',
      ['stable', 'ailing', 'gravely-ill'],
      [6, 42],
      ['edric-holds-northkeep'],
    ),
    choices: [
      choice(
        'e12-sponsor',
        30,
        0,
        [
          effect('adjust-prestige', 'player', 5, 'stored-fifty-percent-high-otherwise-two'),
          effect('adjust-relationship', 'edric', 6, 'only-on-high-result'),
        ],
        [],
        {
          distribution: 'coin-flip',
          values: [5, 2],
          storedAt: 'choice',
          purposeKey: 'content.explanation.random-tournament-result',
        },
      ),
      choice(
        'e12-send-levies',
        0,
        0,
        [
          effect('lock-troops', 'player', 75, 'two-days'),
          effect('adjust-relationship', 'edric', 5),
          effect('set-bargain-progress', 'edric', 1, 'military-proof'),
        ],
        ['at-least-75-available-levies'],
      ),
      choice('e12-decline', 0, 0, [effect('adjust-relationship', 'edric', -2)]),
    ],
  },
  {
    ...eventBase(
      'e13-merchant-syndicate-loan',
      13,
      'ambient',
      ['stable', 'ailing'],
      [0, 27],
      ['player-gold-below-80', 'ysabel-not-hostile'],
    ),
    choices: [
      choice('e13-borrow', 0, 0, [
        effect('adjust-gold', 'player', 80),
        effect('schedule-decision', 'player', 14, 'merchant-loan-repayment'),
      ]),
      choice('e13-political-access', 0, 0, [
        effect('adjust-gold', 'player', 45),
        effect('apply-condition', 'player', undefined, 'ysabel-access-debt'),
      ]),
      choice('e13-refuse', 0, 0, [effect('none', 'none')]),
    ],
    followUpDecisions: [
      {
        id: 'merchant-loan-repayment',
        labelKey: label('decision-merchant-loan-repayment'),
        explanationKey: explanation('decision-merchant-loan-repayment'),
        triggerRuleId: 'fourteen-days-after-borrowing',
        delayDays: 14,
        mandatory: true,
        choices: [
          choice(
            'merchant-loan-repay',
            105,
            0,
            [effect('none', 'none')],
            ['player-gold-at-least-105'],
          ),
          choice('merchant-loan-default', 0, 0, [
            effect('set-gold', 'player', 0),
            effect('adjust-prestige', 'player', -12),
            effect('adjust-relationship', 'ysabel', -25),
            effect('apply-condition', 'player', undefined, 'defaulted-debtor'),
            effect('apply-condition', 'ysabel', undefined, 'debt-leverage', 'parties'),
          ]),
        ],
      },
    ],
  },
  {
    ...eventBase(
      'e14-rumor-of-false-blood',
      14,
      'ambient',
      ['ailing', 'gravely-ill', 'deathbed'],
      [14, 49],
      ['player-has-forgery-evidence'],
    ),
    choices: [
      choice('e14-suppress', 35, 12, [
        effect('set-bargain-progress', 'player', 10, 'future-forgery-discovery'),
      ]),
      choice(
        'e14-blame-renard',
        0,
        0,
        [
          effect('adjust-relationship', 'renard', -15, 'stored-fifty-percent-success'),
          effect('adjust-prestige', 'player', -5, 'only-on-failure'),
          effect('set-bargain-progress', 'player', 20, 'future-forgery-discovery-on-failure'),
        ],
        [],
        {
          distribution: 'coin-flip',
          values: [1, 0],
          storedAt: 'choice',
          purposeKey: 'content.explanation.random-rumor-blame',
        },
      ),
      choice('e14-confess-embellishment', 0, 0, [
        effect('adjust-claim', 'player', -12),
        effect('adjust-prestige', 'player', -5),
        effect('schedule-decision', 'player', 3, 'penitent-repair'),
      ]),
    ],
    followUpDecisions: [
      {
        id: 'penitent-repair',
        labelKey: label('decision-penitent-repair'),
        explanationKey: explanation('decision-penitent-repair'),
        triggerRuleId: 'three-days-after-embellishment-confession',
        delayDays: 3,
        mandatory: true,
        choices: [
          choice('penitent-repair-complete', 0, 0, [
            effect('remove-secret', 'player', undefined, 'player-forgery-evidence'),
          ]),
        ],
      },
    ],
  },
  {
    ...eventBase(
      'e15-dispossessed-retinue',
      15,
      'ambient',
      ['ailing', 'gravely-ill', 'deathbed'],
      [14, 49],
      ['npc-dispossessed', 'player-holds-greyfen'],
    ),
    choices: [
      choice(
        'e15-sanctuary',
        0,
        0,
        [
          effect('lock-troops', 'player', 50, 'five-days'),
          effect('adjust-relationship', 'target', 12),
          effect('set-bargain-progress', 'target', 1, 'basing-rights'),
        ],
        ['at-least-50-available-levies'],
      ),
      choice('e15-fund', 30, 0, [effect('adjust-relationship', 'target', 8)]),
      choice('e15-refuse', 0, 0, [
        effect('adjust-relationship', 'target', -10),
        effect('adjust-relationship', 'target', 3, 'occupier'),
      ]),
    ],
  },
  {
    ...eventBase(
      'e16-funeral-preparations',
      16,
      'ambient',
      ['deathbed'],
      [42, 49],
      ['player-declared'],
    ),
    choices: [
      choice('e16-fund', 40, 0, [
        effect('adjust-prestige', 'player', 4),
        effect('adjust-church-conduct', 'player', 1),
      ]),
      choice('e16-great-council', 0, 12, [
        effect(
          'reveal-intelligence',
          'player',
          undefined,
          'current-unpledged-leanings-only',
          'private',
        ),
      ]),
      choice('e16-prepare-troops', 0, 0, [
        effect('create-temporary-troops', 'capital', 25, 'capital-only', 'public', 3),
        effect('adjust-church-conduct', 'player', -1),
      ]),
    ],
  },
] as const;

const ending = (id: string, routeId: string) => ({
  id,
  routeId,
  labelKey: label(`ending-${id}`),
  explanationKey: explanation(`ending-${id}`),
  reconstructionSectionKeys: [
    'ending.section.header',
    'ending.section.constitution',
    'ending.section.realm-cost',
    'ending.section.turning-points',
    'ending.section.replay',
  ],
  turningPointKeys: ['ending.turning-point.decisive', 'ending.turning-point.reversal'],
});

export const endings = [
  ending('crowned-by-acclamation', 'military-acclamation'),
  ending('crowned-by-council', 'council'),
  ending('crowned-by-church', 'church-tie'),
  ending('master-of-capital', 'capital-tie'),
  ending('rightful-heir', 'claim'),
  ending('crowned-by-sword', 'sword'),
] as const;
