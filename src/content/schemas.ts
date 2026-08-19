import { z } from 'zod';
import {
  actionIdSchema,
  bargainIdSchema,
  baseActionFamilyIdSchema,
  chronicleCategoryIdSchema,
  churchStateIdSchema,
  claimBandIdSchema,
  collateralTypeIdSchema,
  conditionIdSchema,
  effectIdSchema,
  endingLabelIdSchema,
  eventIdSchema,
  idSchema,
  lordIdSchema,
  officeIdSchema,
  openingIdSchema,
  phaseIdSchema,
  policyIdSchema,
  proofIdSchema,
  redLineIdSchema,
  secretIdSchema,
  shockIdSchema,
  supportBasisIdSchema,
  supportLevelIdSchema,
  territoryIdSchema,
  textKeySchema,
} from './ids';

const boundedRatingSchema = z.number().int().min(0).max(100);
const relationshipSchema = z.number().int().min(-100).max(100);
const nonNegativeIntSchema = z.number().int().min(0);
const positiveIntSchema = z.number().int().positive();
const multiplierSchema = z.number().positive().max(10);

export const localizedLabelSchema = z.object({
  labelKey: textKeySchema,
  explanationKey: textKeySchema,
});

export const structuredEffectSchema = z.object({
  effectId: effectIdSchema,
  target: z.union([
    lordIdSchema,
    territoryIdSchema,
    conditionIdSchema,
    shockIdSchema,
    z.literal('player'),
    z.literal('target'),
    z.literal('church'),
    z.literal('capital'),
    z.literal('all-voluntary-renard-pledges'),
    z.literal('all-edric-candidate-pledges'),
    z.literal('ysabel-opportunistic-pledge'),
    z.literal('all-player-supporters'),
    z.literal('none'),
  ]),
  value: z.number().optional(),
  durationDays: z.number().positive().optional(),
  referenceId: idSchema.optional(),
  visibility: z.enum(['public', 'private', 'parties', 'observer-limited']).default('public'),
});
export type StructuredEffect = z.infer<typeof structuredEffectSchema>;

export const phaseDefinitionSchema = localizedLabelSchema.extend({
  id: phaseIdSchema,
  displayOrder: positiveIntSchema,
  remainingDayMin: nonNegativeIntSchema,
  remainingDayMax: nonNegativeIntSchema,
  maturationDays: z.number().int().min(0).max(10),
  pledgeInertia: z.number().int().min(0).max(100),
  capitalGarrison: nonNegativeIntSchema.nullable(),
  canDeclare: z.boolean(),
  canRequestPledge: z.boolean(),
  canAttackCapital: z.boolean(),
  longPreparationsLocked: z.boolean(),
  shortActionReductionDays: z.number().int().min(0).max(3),
});
export type PhaseDefinition = z.infer<typeof phaseDefinitionSchema>;

export const lordSchema = localizedLabelSchema.extend({
  id: lordIdSchema,
  displayOrder: positiveIntSchema,
  titleKey: textKeySchema,
  epithetKey: textKeySchema,
  seatId: territoryIdSchema,
  isPlayer: z.boolean(),
  mayDeclare: z.boolean(),
  startsDeclared: z.boolean(),
  starting: z.object({
    gold: nonNegativeIntSchema,
    availableLevies: nonNegativeIntSchema,
    levyCapacity: positiveIntSchema,
    prestige: boundedRatingSchema,
    claim: boundedRatingSchema,
    influence: boundedRatingSchema,
  }),
  desireKey: textKeySchema,
  fearKey: textKeySchema,
  proofIds: z.array(proofIdSchema),
  redLineIds: z.array(redLineIdSchema),
  specialAdvantageId: idSchema,
  aiPersonality: z.object({
    tags: z.array(idSchema).min(1),
    weights: z.record(idSchema, z.number().int().min(-20).max(120)),
  }),
  candidacyRuleId: idSchema,
  bargainIds: z.array(bargainIdSchema),
  initialSupport: z.object({
    candidateId: lordIdSchema.nullable(),
    level: supportLevelIdSchema,
    basis: supportBasisIdSchema.nullable(),
    visibility: z.enum(['public', 'private']),
  }),
});
export type LordDefinition = z.infer<typeof lordSchema>;

export const territorySchema = localizedLabelSchema.extend({
  id: territoryIdSchema,
  displayOrder: positiveIntSchema,
  legalLordId: lordIdSchema.nullable(),
  adjacentTerritoryIds: z.array(territoryIdSchema).min(3).max(6),
  wealth: z.number().int().min(0).max(10),
  levyCapacity: nonNegativeIntSchema.nullable(),
  startingLevies: nonNegativeIntSchema.nullable(),
  fortification: z.number().int().min(0).max(3),
  traitId: idSchema,
  traitKey: textKeySchema,
  traitParameters: z.record(idSchema, z.union([z.number(), z.string(), z.boolean()])),
  legalIncomeBonus: z.number().min(0).max(10).default(0),
  occupierIncomePerDay: z.number().min(0).max(10).nullable(),
});
export type TerritoryDefinition = z.infer<typeof territorySchema>;

export const relationshipDefinitionSchema = z.object({
  firstLordId: lordIdSchema,
  secondLordId: lordIdSchema,
  value: relationshipSchema,
});

export const collateralSchema = z.object({
  type: collateralTypeIdSchema,
  timing: z.literal('acceptance'),
  amount: z.number().positive().optional(),
  durationDays: z.number().positive().optional(),
  officeId: officeIdSchema.optional(),
  policyId: policyIdSchema.optional(),
  requiredActionId: actionIdSchema.optional(),
});

export const bargainSchema = localizedLabelSchema.extend({
  id: bargainIdSchema,
  lordId: lordIdSchema,
  displayOrder: positiveIntSchema,
  negotiationInfluenceCost: z.literal(8),
  collateralMode: z.enum(['all', 'one-of']),
  presentCollateral: z.array(collateralSchema),
  reservedFutureOffice: officeIdSchema.optional(),
  proofIds: z.array(proofIdSchema),
  supportEffect: z.enum(['leaning-only', 'pledge-eligible', 'commitment-on-shared-risk']),
  incompatibleConditionIds: z.array(conditionIdSchema),
  breachRedLineIds: z.array(redLineIdSchema),
  effects: z.array(structuredEffectSchema),
});
export type BargainDefinition = z.infer<typeof bargainSchema>;

export const actionSchema = localizedLabelSchema.extend({
  id: actionIdSchema,
  familyId: baseActionFamilyIdSchema.nullable(),
  displayOrder: positiveIntSchema,
  kind: z.enum(['base', 'variant', 'contextual', 'reaction']),
  legalPhaseIds: z.array(phaseIdSchema).min(1),
  targetKinds: z.array(
    z.enum([
      'none',
      'lord',
      'kingmaker',
      'territory',
      'capital',
      'secret',
      'agreement',
      'candidate',
    ]),
  ),
  duration: z.object({
    days: z.number().min(0).max(14),
    deathbedDays: z.number().min(0).max(14),
    fixedAtStart: z.literal(true),
  }),
  durationVariants: z
    .array(
      z.object({
        ruleId: idSchema,
        days: z.number().min(0).max(14),
      }),
    )
    .optional(),
  startCost: z.object({
    gold: nonNegativeIntSchema,
    influence: nonNegativeIntSchema,
    logisticsGold: nonNegativeIntSchema.default(0),
  }),
  costOptions: z.array(
    z.object({
      id: idSchema,
      gold: nonNegativeIntSchema,
      influence: nonNegativeIntSchema,
      troopMinimum: nonNegativeIntSchema,
      explanationKey: textKeySchema,
    }),
  ),
  acceptanceCollateralTiming: z.enum(['none', 'acceptance']),
  visibility: z.enum(['hidden', 'suspected', 'public', 'private-to-parties']),
  visibilityVariants: z
    .array(
      z.object({
        ruleId: idSchema,
        visibility: z.enum(['hidden', 'suspected', 'public', 'private-to-parties']),
        supportLabel: supportLevelIdSchema.nullable(),
      }),
    )
    .optional(),
  repeatRule: z.object({
    mode: z.enum([
      'unlimited',
      'diminishing',
      'cooldown',
      'once-per-run',
      'once-per-phase',
      'contextual',
    ]),
    windowDays: nonNegativeIntSchema.nullable(),
    maxFullEffects: nonNegativeIntSchema.nullable(),
    explanationKey: textKeySchema,
    effectMultipliers: z.array(z.number().min(0).max(1)).optional(),
    resetRuleIds: z.array(idSchema).optional(),
    refuseAfterUses: nonNegativeIntSchema.optional(),
    chargeOnRefusal: z.boolean().optional(),
  }),
  cancellationPolicyId: idSchema,
  invalidationPolicyId: idSchema,
  resultEffectIds: z.array(effectIdSchema),
  canonicalResults: z.array(structuredEffectSchema).optional(),
  resultBranches: z
    .array(
      z.object({
        id: idSchema,
        requirementIds: z.array(idSchema),
        effects: z.array(structuredEffectSchema).min(1),
      }),
    )
    .optional(),
  intelligenceFreshDays: positiveIntSchema.optional(),
  aiPermissionTags: z.array(idSchema),
  previewFieldKeys: z.array(textKeySchema).min(1),
  chronicleCategoryId: chronicleCategoryIdSchema,
  chronicleStartKey: textKeySchema,
  chronicleResultKey: textKeySchema,
});
export type ActionDefinition = z.infer<typeof actionSchema>;

export const proofSchema = localizedLabelSchema.extend({
  id: proofIdSchema,
  lordId: lordIdSchema,
  ruleId: idSchema,
});

export const redLineSchema = localizedLabelSchema.extend({
  id: redLineIdSchema,
  lordId: lordIdSchema,
  automaticBreaker: z.boolean(),
  ruleId: idSchema,
});

export const evaluationModifierSchema = z.object({
  id: idSchema,
  value: z.number().int().min(-100).max(100),
  explanationKey: textKeySchema,
});

export const candidateEvaluationSchema = z.object({
  lordId: lordIdSchema,
  legitimacy: z.object({
    claim: z.record(claimBandIdSchema, z.number().int().min(-30).max(30)),
    church: z.record(
      churchStateIdSchema,
      z.union([z.number().int().min(-30).max(30), z.literal('excluded')]),
    ),
    clamp: z.tuple([z.number().int(), z.number().int()]),
  }),
  desireAndConductClamp: z.tuple([z.number().int(), z.number().int()]),
  desireAndConduct: z.array(evaluationModifierSchema),
  fear: z.record(z.enum(['low', 'concern', 'serious', 'existential']), z.number().int()),
  fearOverrides: z
    .array(
      z.object({
        threatBand: z.enum(['low', 'concern', 'serious', 'existential']),
        whenRuleId: idSchema,
        value: z.number().int(),
        mode: z.literal('replace'),
      }),
    )
    .optional(),
  proofIds: z.array(proofIdSchema),
  redLineIds: z.array(redLineIdSchema),
});

export const secretSchema = localizedLabelSchema.extend({
  id: secretIdSchema,
  targetLordId: lordIdSchema,
  pool: z.enum(['renard-guaranteed', 'additional-npc', 'conditional-player']),
  devastating: z.boolean(),
  canBlackmail: z.boolean(),
  blackmailUseLimit: z.literal(1),
  exposeUseLimit: z.literal(1),
  discoveryRuleId: idSchema,
  effects: z.array(structuredEffectSchema).min(1),
});
export type SecretDefinition = z.infer<typeof secretSchema>;

export const randomOutcomeSchema = z
  .object({
    distribution: z.enum(['uniform-integer', 'weighted', 'coin-flip']),
    values: z.array(z.number()).min(2),
    weights: z.array(z.number().int().positive()).optional(),
    storedAt: z.literal('choice'),
    purposeKey: textKeySchema,
  })
  .superRefine((outcome, context) => {
    if (outcome.distribution === 'weighted' && outcome.weights?.length !== outcome.values.length) {
      context.addIssue({ code: 'custom', path: ['weights'], message: 'Weights must match values' });
    }
    if (outcome.distribution === 'weighted' && outcome.weights === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['weights'],
        message: 'Weighted outcomes require weights',
      });
    }
    if (outcome.distribution !== 'weighted' && outcome.weights !== undefined) {
      context.addIssue({
        code: 'custom',
        path: ['weights'],
        message: 'Only weighted outcomes use weights',
      });
    }
    if (outcome.distribution === 'coin-flip' && outcome.values.length !== 2) {
      context.addIssue({
        code: 'custom',
        path: ['values'],
        message: 'Coin flips require two outcomes',
      });
    }
    if (
      outcome.distribution === 'uniform-integer' &&
      (outcome.values.length !== 2 ||
        !outcome.values.every(Number.isInteger) ||
        (outcome.values[0] ?? 0) > (outcome.values[1] ?? 0))
    ) {
      context.addIssue({
        code: 'custom',
        path: ['values'],
        message: 'Uniform integer outcomes require an ordered integer [minimum, maximum]',
      });
    }
  });

export const eventChoiceSchema = z.object({
  id: idSchema,
  labelKey: textKeySchema,
  explanationKey: textKeySchema,
  goldCost: nonNegativeIntSchema,
  influenceCost: nonNegativeIntSchema,
  requirementIds: z.array(idSchema),
  effects: z.array(structuredEffectSchema).min(1),
  randomOutcome: randomOutcomeSchema.optional(),
});

export const followUpDecisionSchema = localizedLabelSchema.extend({
  id: idSchema,
  triggerRuleId: idSchema,
  delayDays: nonNegativeIntSchema,
  mandatory: z.literal(true),
  choices: z.array(eventChoiceSchema).min(1),
});

export const eventSchema = localizedLabelSchema.extend({
  id: eventIdSchema,
  displayOrder: positiveIntSchema,
  kind: z.enum(['mandatory', 'ambient']),
  phaseIds: z.array(phaseIdSchema).min(1),
  elapsedDayWindow: z.tuple([nonNegativeIntSchema, nonNegativeIntSchema]).nullable(),
  weight: positiveIntSchema,
  cooldownDays: nonNegativeIntSchema,
  requirementIds: z.array(idSchema),
  maximumOccurrences: z.literal(1),
  choices: z.array(eventChoiceSchema).min(1),
  followUpDecisions: z.array(followUpDecisionSchema).optional(),
  chronicleKey: textKeySchema,
});
export type EventDefinition = z.infer<typeof eventSchema>;

export const openingSchema = localizedLabelSchema.extend({
  id: openingIdSchema,
  displayOrder: positiveIntSchema,
  compatibilityRouteIds: z
    .array(z.enum(['coalition', 'legitimacy', 'intrigue', 'military']))
    .min(3),
  effects: z.array(structuredEffectSchema).min(1),
  guaranteedSecretTargetId: z.literal('renard'),
  guaranteedSecretPool: z.array(secretIdSchema).min(3),
  additionalSecretPool: z.array(secretIdSchema).length(4),
  additionalSecretCount: z.literal(2),
});

export const shockSchema = localizedLabelSchema.extend({
  id: shockIdSchema,
  value: nonNegativeIntSchema.nullable(),
  expiresAfterDays: nonNegativeIntSchema.nullable(),
  automatic: z.boolean(),
  basisFilter: z.array(supportBasisIdSchema),
  excludeBasisFilter: z.array(supportBasisIdSchema).default([]),
});

export const churchStateSchema = localizedLabelSchema.extend({
  id: churchStateIdSchema,
  displayOrder: nonNegativeIntSchema,
  caseMin: nonNegativeIntSchema.nullable(),
  caseMax: nonNegativeIntSchema.nullable(),
});

export const endingLabelSchema = localizedLabelSchema.extend({
  id: endingLabelIdSchema,
  routeId: z.enum([
    'military-acclamation',
    'council',
    'church-tie',
    'capital-tie',
    'claim',
    'sword',
  ]),
  reconstructionSectionKeys: z.array(textKeySchema).min(3),
  turningPointKeys: z.array(textKeySchema).min(1),
});

export const rasterAssetSourceSchema = z
  .string()
  .min(1)
  .refine((value) => value === value.trim(), 'Surrounding whitespace is forbidden')
  .refine((value) => !/^data:/i.test(value), 'Data URIs are forbidden')
  .refine((value) => !value.toLowerCase().includes('.svg'), 'SVG files are forbidden')
  .refine((value) => !/^data:image\/svg\+xml/i.test(value), 'SVG data URIs are forbidden')
  .refine((value) => !/^icon-font:/i.test(value), 'Icon-font references are forbidden')
  .refine((value) => /\.(png|webp)$/i.test(value), 'Only PNG and WebP raster sources are allowed');

export const assetSlotSchema = z.object({
  id: idSchema,
  category: z.enum([
    'portrait',
    'crest',
    'territory-emblem',
    'map',
    'overlay',
    'icon',
    'seal',
    'ribbon',
    'texture',
    'letter',
    'ending',
    'title',
    'fallback',
  ]),
  semanticRoleKey: textKeySchema,
  logicalWidth: positiveIntSchema,
  logicalHeight: positiveIntSchema,
  aspectRatio: z.number().positive(),
  allowedFormats: z.array(z.enum(['png', 'webp'])).min(1),
  densities: z.array(z.union([z.literal(1), z.literal(2)])).min(1),
  alpha: z.enum(['required', 'allowed', 'opaque']),
  background: z.enum(['transparent', 'painted', 'parchment', 'none']),
  fallbackKey: idSchema.nullable(),
  expectedSources: z.array(rasterAssetSourceSchema),
});
export type AssetSlot = z.infer<typeof assetSlotSchema>;

export const textEntrySchema = z.object({
  key: textKeySchema,
  role: z.enum([
    'label',
    'explanation',
    'preview',
    'chronicle',
    'choice',
    'ending',
    'asset',
    'glossary',
  ]),
  defaultText: z.string().min(1),
  maxLength: positiveIntSchema,
});

const codebookEntrySchema = z.object({
  id: idSchema,
  labelKey: textKeySchema,
  explanationKey: textKeySchema,
});

export const contentCatalogsSchema = z.object({
  supportLevels: z.array(codebookEntrySchema.extend({ id: supportLevelIdSchema })).length(6),
  supportBases: z.array(codebookEntrySchema.extend({ id: supportBasisIdSchema })).length(7),
  claimBands: z
    .array(
      codebookEntrySchema.extend({
        id: claimBandIdSchema,
        minimum: boundedRatingSchema,
        maximum: boundedRatingSchema,
      }),
    )
    .length(6),
  prestigeBands: z
    .array(
      codebookEntrySchema.extend({
        minimum: boundedRatingSchema,
        maximum: boundedRatingSchema,
      }),
    )
    .min(1),
  offices: z.array(codebookEntrySchema.extend({ id: officeIdSchema })).length(2),
  policies: z.array(codebookEntrySchema.extend({ id: policyIdSchema })).length(4),
  conditions: z.array(codebookEntrySchema.extend({ id: conditionIdSchema })).length(19),
  chronicleCategories: z
    .array(codebookEntrySchema.extend({ id: chronicleCategoryIdSchema }))
    .length(7),
  explanationOrder: z.tuple([
    z.literal('red-line'),
    z.literal('binding-support'),
    z.literal('proof-maturation'),
    z.literal('desire-conduct'),
    z.literal('bargain'),
    z.literal('legitimacy'),
    z.literal('viability'),
    z.literal('fear'),
    z.literal('relationship'),
  ]),
});

export const ruleConstantsSchema = z.object({
  clock: z.object({
    crisisDays: z.literal(56),
    hoursPerDay: z.literal(24),
    realSecondsPerDayAtOneX: z.literal(60),
    deathDayWeights: z.record(z.string(), z.number().int().min(0).max(100)),
    prognosisReports: z.record(z.string(), textKeySchema),
    ambientWindows: z.array(z.tuple([positiveIntSchema, positiveIntSchema])).length(6),
    maxAmbientChoices: z.literal(6),
    maxChoiceInterruptionsPerDay: z.literal(1),
  }),
  economy: z.object({
    influencePerDawn: z.literal(1),
    influenceMaximum: z.literal(100),
    levyRecoveryRate: z.literal(0.005),
    occupationIncomeMultiplier: z.literal(0.25),
    taxStrainIncomeMultiplier: z.literal(0.5),
    taxStrainRecoveryMultiplier: z.literal(0.5),
    unrestIncomeMultiplier: z.literal(0.25),
    unrestRecoveryMultiplier: z.literal(0),
    greyfenCharterMultiplier: z.literal(0.75),
    provincialLibertiesMultiplier: z.literal(0.9),
    defaultedDebtorMultiplier: z.literal(0.5),
    churchImmunitiesTaxMultiplier: z.literal(0.8),
  }),
  politics: z.object({
    evaluation: z.object({
      relationshipDivisor: z.literal(5),
      relationshipClamp: z.tuple([z.literal(-20), z.literal(20)]),
      bargainValues: z.object({
        none: z.literal(0),
        offered: z.literal(8),
        accepted: z.literal(12),
        fulfilled: z.literal(20),
        sharedRisk: z.literal(25),
      }),
      exactTieRetainsCurrentLeaning: z.literal(true),
      noLeaningTieBreakOrder: z.tuple([
        z.literal('relationship'),
        z.literal('legitimacy'),
        z.literal('declaration-time'),
        z.literal('candidate-id'),
      ]),
    }),
    hearBargainAt: z.literal(0),
    leanAt: z.literal(15),
    leanLead: z.literal(8),
    unalignBelow: z.literal(10),
    unalignLeadBelow: z.literal(4),
    defectionLead: z.literal(10),
    shockLifetimeDays: z.literal(10),
    requestPrematureCooldownDays: z.literal(7),
    publicCoercionEndorsementBlock: z.literal(2),
    officeReservationScope: z.literal('per-candidate'),
    accessDebt: z.object({
      escrowGold: z.literal(100),
      chancellorshipGold: z.literal(60),
      protectionTroops: z.literal(150),
      consumedOnAcceptedBargain: z.literal(true),
    }),
    escrow: z.object({
      supporterBreakReturnNow: z.literal(0.5),
      supporterBreakFrozenToDeath: z.literal(0.5),
      claimantBreakTransferToSupporter: z.literal(1),
      loyalAgreementLockedToSuccession: z.literal(true),
    }),
    viability: z.object({
      modifiers: z.record(idSchema, z.number().int()),
      lordMultipliers: z.record(lordIdSchema, z.number().positive()),
      clamp: z.tuple([z.literal(-20), z.literal(20)]),
    }),
    relationshipChanges: z.record(idSchema, z.number().int()),
    coercion: z.object({
      militaryThresholds: z.record(lordIdSchema, z.number().positive().nullable()),
      edricOccupationArmyBelow: z.literal(250),
      secretBlackmailUseLimit: z.literal(1),
      publicThreatTargetRelationship: z.literal(-20),
      publicThreatObserverRelationship: z.literal(-5),
    }),
    candidacy: z.object({
      renardAutomaticPhase: z.literal('ailing'),
      playerMinimumPhase: z.literal('ailing'),
      edricMinimumPhase: z.literal('gravely-ill'),
      edricMaximumRenardSupporters: z.literal(1),
      edricMinimumTroops: z.literal(500),
      edricMinimumPrestige: z.literal(50),
      edricRequiresNoValidPledge: z.literal(true),
      renardWithdrawalMaximumSupporters: z.literal(0),
      renardWithdrawalMilitaryBelow: z.literal(150),
      renardWithdrawalRequiresCapitalLeverage: z.literal(true),
    }),
  }),
  church: z.object({
    endorsementCaseMinimum: z.literal(6),
    minimumClaimBand: z.literal('plausible'),
    oneEndorsedMaximum: z.literal(1),
    claimCase: z.record(claimBandIdSchema, nonNegativeIntSchema),
    modifiers: z.record(idSchema, z.number().int()),
  }),
  war: z.object({
    hereditaryGarrison: z.literal(75),
    capitalGarrison: z.literal(200),
    capitalAttackMinimum: z.literal(250),
    campaignDays: z.literal(3),
    deathbedCampaignDays: z.literal(2),
    campaignLogisticsGold: z.literal(10),
    aiYieldRatio: z.literal(1.75),
    mercenaryBandSize: z.literal(150),
    mercenaryInitialGold: z.literal(50),
    maraMercenaryInitialGold: z.literal(40),
    mercenaryRenewalGold: z.literal(20),
    mercenaryContractDays: z.literal(7),
    mercenaryMaximumBands: z.literal(2),
    commanderOrdinary: z.literal(1),
    commanderEdric: z.literal(1.1),
    fortuneMin: z.literal(0.92),
    fortuneMax: z.literal(1.08),
    fortificationStep: z.literal(0.1),
    majorBattleTroops: z.literal(250),
    casualty: z.object({
      loserBase: z.literal(0.28),
      loserRatioStep: z.literal(0.08),
      loserMin: z.literal(0.28),
      loserMax: z.literal(0.45),
      winnerBase: z.literal(0.18),
      winnerRatioStep: z.literal(0.04),
      winnerMin: z.literal(0.08),
      winnerMax: z.literal(0.18),
    }),
    threatBands: z.object({
      concern: z.literal(20),
      serious: z.literal(40),
      existential: z.literal(60),
    }),
    threatValues: z.object({
      militarySuperior: z.literal(20),
      adjacentOccupation: z.literal(15),
      occupiedSeat: z.literal(10),
      capitalControl: z.literal(15),
      twoPublicSupporters: z.literal(10),
      secondOffensiveWar: z.literal(10),
      publiclyKnownCoercedPledge: z.literal(10),
      voluntaryCommitmentReduction: z.literal(-10),
      militaryComparisonRatio: z.literal(1.25),
    }),
    armyBandMidpoints: z.object({
      broken: z.literal(75),
      modest: z.literal(225),
      strong: z.literal(400),
      formidable: z.literal(600),
    }),
  }),
  succession: z.object({
    councilVotes: z.literal(6),
    majority: z.literal(4),
    acclamationNonCapitalSeats: z.literal(3),
    acclamationCapitalTroops: z.literal(200),
    eliminationTieBreakOrder: z.tuple([
      z.literal('commitments'),
      z.literal('claim'),
      z.literal('prestige'),
      z.literal('declaration-time'),
    ]),
    finalTieBreakOrder: z.tuple([
      z.literal('church-endorsement'),
      z.literal('capital-control'),
      z.literal('commitments'),
      z.literal('claim'),
      z.literal('prestige'),
      z.literal('declaration-time'),
    ]),
  }),
  spy: z.object({
    base: z.literal(50),
    influenceDivisor: z.literal(5),
    seededMinimum: z.literal(-15),
    seededMaximum: z.literal(15),
    cleanSuccessMargin: z.literal(10),
    detectionAtSuccessPercent: z.literal(25),
    partialMargin: z.literal(-10),
    detectionAtPartialPercent: z.literal(50),
    repeatWindowDays: z.literal(10),
    repeatDetectionIncreasePercent: z.literal(20),
    detectionMaximumPercent: z.literal(100),
  }),
  claimFraud: z.object({
    researchClaim: z.literal(12),
    forgeClaim: z.literal(25),
    exposureClaimLoss: z.literal(20),
    exposurePrestigeLoss: z.literal(10),
    rumorConfessionClaimLoss: z.literal(12),
    rumorConfessionPrestigeLoss: z.literal(5),
    penanceGold: z.literal(40),
    penanceInfluence: z.literal(10),
    penanceDays: z.literal(3),
    penancePrestigeLoss: z.literal(5),
  }),
  prestigeChanges: z.record(idSchema, z.number().int()),
  royalAuthority: z.record(
    phaseIdSchema,
    z.object({
      additionalInfluence: nonNegativeIntSchema,
      prestige: z.number().int(),
      churchConduct: z.number().int(),
      nonBelligerentRelationship: z.number().int(),
      maraRelationship: z.number().int(),
      royalReinforcement: nonNegativeIntSchema,
      capitalAttackAllowed: z.boolean(),
    }),
  ),
  routeBudgets: z.object({
    coalitionMinimumInfluence: z.literal(63),
    coalitionBargains: z.literal(3),
    coalitionRequests: z.literal(3),
    militaryMinimumGarrisons: z.literal(350),
  }),
  tuningInvariantIds: z.array(idSchema).length(10),
});

export const sourceMappingSchema = z.object({
  designSection: z.string().min(3),
  contentModule: z.string().min(3),
  entityIds: z.array(idSchema).min(1),
});

export const canonicalContentPackSchema = z.object({
  schemaVersion: z.literal(1),
  idConvention: z.literal('lowercase-kebab-case'),
  phases: z.array(phaseDefinitionSchema).length(4),
  lords: z.array(lordSchema).length(6),
  territories: z.array(territorySchema).length(7),
  relationships: z.array(relationshipDefinitionSchema).length(15),
  actions: z.array(actionSchema).length(19),
  bargains: z.array(bargainSchema).length(12),
  proofs: z.array(proofSchema).length(14),
  redLines: z.array(redLineSchema).length(17),
  candidateEvaluations: z.array(candidateEvaluationSchema).length(5),
  secrets: z.array(secretSchema).length(8),
  openings: z.array(openingSchema).length(4),
  events: z.array(eventSchema).length(16),
  shocks: z.array(shockSchema).length(19),
  churchStates: z.array(churchStateSchema).length(5),
  endings: z.array(endingLabelSchema).length(6),
  assets: z.array(assetSlotSchema).min(40),
  text: z.array(textEntrySchema).min(1),
  catalogs: contentCatalogsSchema,
  constants: ruleConstantsSchema,
  sourceMappings: z.array(sourceMappingSchema).min(8),
});
export type CanonicalContentPack = z.infer<typeof canonicalContentPackSchema>;

export const immutableContentRegistrySchema = canonicalContentPackSchema.extend({
  contentHash: z.string().regex(/^fnv1a64-[0-9a-f]{16}$/),
});

export type ImmutableContentRegistry = Readonly<
  CanonicalContentPack & {
    readonly contentHash: string;
  }
>;

export const numericBounds = {
  boundedRatingSchema,
  multiplierSchema,
  relationshipSchema,
} as const;
