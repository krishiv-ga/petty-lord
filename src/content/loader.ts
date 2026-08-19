import type { z } from 'zod';
import {
  ACTION_IDS,
  BARGAIN_IDS,
  BASE_ACTION_FAMILY_IDS,
  EVENT_IDS,
  LORD_IDS,
  OPENING_IDS,
  PHASE_IDS,
  SECRET_IDS,
  TERRITORY_IDS,
} from './ids';
import { canonicalContentPackInput } from './pack';
import {
  type CanonicalContentPack,
  canonicalContentPackSchema,
  type ImmutableContentRegistry,
} from './schemas';

const addIssue = (context: z.RefinementCtx, path: PropertyKey[], message: string): void => {
  context.addIssue({ code: 'custom', path, message });
};

const requireUnique = <T>(
  values: readonly T[],
  key: (value: T) => string | number,
  context: z.RefinementCtx,
  path: PropertyKey[],
  label: string,
): void => {
  const seen = new Set<string | number>();
  for (const value of values) {
    const identifier = key(value);
    if (seen.has(identifier)) addIssue(context, path, `Duplicate ${label}: ${identifier}`);
    seen.add(identifier);
  }
};

const requireExactIds = (
  actual: readonly string[],
  expected: readonly string[],
  context: z.RefinementCtx,
  path: PropertyKey[],
): void => {
  const actualSet = new Set(actual);
  for (const id of expected) {
    if (!actualSet.has(id)) addIssue(context, path, `Missing canonical ID: ${id}`);
  }
};

const isTextKey = (value: string): boolean =>
  ['content.label.', 'content.explanation.', 'preview.', 'chronicle.', 'ending.'].some((prefix) =>
    value.startsWith(prefix),
  );

const collectTextReferences = (value: unknown, references: Set<string>): void => {
  if (typeof value === 'string') {
    if (isTextKey(value)) references.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const child of value) collectTextReferences(child, references);
    return;
  }
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) collectTextReferences(child, references);
  }
};

interface EffectLike {
  readonly effectId: string;
  readonly target: string;
  readonly value?: number;
  readonly referenceId?: string;
}

const collectEffects = (value: unknown, effects: EffectLike[]): void => {
  if (Array.isArray(value)) {
    for (const child of value) collectEffects(child, effects);
    return;
  }
  if (value === null || typeof value !== 'object') return;
  const record = value as Record<string, unknown>;
  if (typeof record.effectId === 'string') effects.push(record as unknown as EffectLike);
  for (const child of Object.values(record)) collectEffects(child, effects);
};

export const collectUnresolvedEffectReferences = (pack: CanonicalContentPack): string[] => {
  const followUps = pack.events.flatMap((event) => event.followUpDecisions ?? []);
  const followUpById = new Map(followUps.map((decision) => [decision.id, decision]));
  const shockById = new Map<string, (typeof pack.shocks)[number]>(
    pack.shocks.map((shock) => [shock.id, shock]),
  );
  const followUpIds = new Set(followUps.map((decision) => decision.id));
  const referenceSets: Readonly<Partial<Record<string, ReadonlySet<string>>>> = {
    'apply-condition': new Set(pack.catalogs.conditions.map((entry) => entry.id)),
    'remove-condition': new Set(pack.catalogs.conditions.map((entry) => entry.id)),
    'set-support-shock': new Set(pack.shocks.map((entry) => entry.id)),
    'set-church-state': new Set(pack.churchStates.map((entry) => entry.id)),
    'create-secret': new Set(pack.secrets.map((entry) => entry.id)),
    'remove-secret': new Set(pack.secrets.map((entry) => entry.id)),
    'reveal-secret': new Set(pack.secrets.map((entry) => entry.id)),
    'reserve-office': new Set(pack.catalogs.offices.map((entry) => entry.id)),
    'enact-policy': new Set(pack.catalogs.policies.map((entry) => entry.id)),
    'schedule-decision': followUpIds,
  };
  const effects: EffectLike[] = [];
  collectEffects(pack, effects);
  return effects.flatMap((effect) => {
    const allowed = referenceSets[effect.effectId];
    if (allowed === undefined) return [];
    if (effect.referenceId === undefined) return [`${effect.effectId}:missing-reference`];
    if (!allowed.has(effect.referenceId)) return [`${effect.effectId}:${effect.referenceId}`];
    const exactTargets: Readonly<Partial<Record<string, ReadonlySet<string>>>> = {
      'set-church-state': new Set(['church']),
      'schedule-decision': new Set(['player']),
      'create-secret': new Set(['player']),
      'remove-secret': new Set(['player']),
      'reserve-office': new Set(['player']),
      'enact-policy': new Set(['player']),
      'set-support-shock': new Set([
        ...LORD_IDS,
        'all-voluntary-renard-pledges',
        'all-edric-candidate-pledges',
        'ysabel-opportunistic-pledge',
        'all-player-supporters',
      ]),
    };
    const targetSet = exactTargets[effect.effectId];
    if (targetSet !== undefined && !targetSet.has(effect.target)) {
      return [`${effect.effectId}:${effect.referenceId}:invalid-target-${effect.target}`];
    }
    if (effect.effectId === 'set-support-shock') {
      const shockValue = shockById.get(effect.referenceId)?.value;
      if (shockValue !== null && shockValue !== undefined && effect.value !== shockValue) {
        return [
          `${effect.effectId}:${effect.referenceId}:value-${effect.value ?? 'missing'}-expected-${shockValue}`,
        ];
      }
    }
    if (effect.effectId === 'schedule-decision') {
      const delayDays = followUpById.get(effect.referenceId)?.delayDays;
      if (delayDays !== undefined && effect.value !== delayDays) {
        return [
          `${effect.effectId}:${effect.referenceId}:delay-${effect.value ?? 'missing'}-expected-${delayDays}`,
        ];
      }
    }
    return [];
  });
};

const validatePackReferences = (pack: CanonicalContentPack, context: z.RefinementCtx): void => {
  const collections: ReadonlyArray<
    readonly [string, ReadonlyArray<{ id: string; displayOrder?: number }>]
  > = [
    ['phases', pack.phases],
    ['lords', pack.lords],
    ['territories', pack.territories],
    ['actions', pack.actions],
    ['bargains', pack.bargains],
    ['proofs', pack.proofs],
    ['redLines', pack.redLines],
    ['secrets', pack.secrets],
    ['openings', pack.openings],
    ['events', pack.events],
    ['shocks', pack.shocks],
    ['churchStates', pack.churchStates],
    ['endings', pack.endings],
    ['assets', pack.assets],
  ];

  for (const [name, collection] of collections) {
    requireUnique(collection, (entry) => entry.id, context, [name], `${name} ID`);
    if (collection.every((entry) => entry.displayOrder !== undefined)) {
      requireUnique(
        collection,
        (entry) => entry.displayOrder ?? 0,
        context,
        [name],
        `${name} display order`,
      );
    }
  }

  requireExactIds(
    pack.phases.map((entry) => entry.id),
    PHASE_IDS,
    context,
    ['phases'],
  );
  requireExactIds(
    pack.lords.map((entry) => entry.id),
    LORD_IDS,
    context,
    ['lords'],
  );
  requireExactIds(
    pack.territories.map((entry) => entry.id),
    TERRITORY_IDS,
    context,
    ['territories'],
  );
  requireExactIds(
    pack.actions.map((entry) => entry.id),
    ACTION_IDS,
    context,
    ['actions'],
  );
  requireExactIds(
    pack.bargains.map((entry) => entry.id),
    BARGAIN_IDS,
    context,
    ['bargains'],
  );
  requireExactIds(
    pack.secrets.map((entry) => entry.id),
    SECRET_IDS,
    context,
    ['secrets'],
  );
  requireExactIds(
    pack.openings.map((entry) => entry.id),
    OPENING_IDS,
    context,
    ['openings'],
  );
  requireExactIds(
    pack.events.map((entry) => entry.id),
    EVENT_IDS,
    context,
    ['events'],
  );

  const territoryById = new Map(pack.territories.map((territory) => [territory.id, territory]));
  const lordById = new Map(pack.lords.map((lord) => [lord.id, lord]));
  const bargainById = new Map(pack.bargains.map((bargain) => [bargain.id, bargain]));
  const proofIds = new Set(pack.proofs.map((proof) => proof.id));
  const redLineIds = new Set(pack.redLines.map((redLine) => redLine.id));

  for (const territory of pack.territories) {
    const neighbors = new Set(territory.adjacentTerritoryIds);
    if (neighbors.size !== territory.adjacentTerritoryIds.length) {
      addIssue(
        context,
        ['territories', territory.id, 'adjacentTerritoryIds'],
        'Duplicate adjacency',
      );
    }
    if (neighbors.has(territory.id)) {
      addIssue(
        context,
        ['territories', territory.id, 'adjacentTerritoryIds'],
        'Self adjacency is illegal',
      );
    }
    for (const adjacentId of neighbors) {
      const adjacent = territoryById.get(adjacentId);
      if (adjacent === undefined || !adjacent.adjacentTerritoryIds.includes(territory.id)) {
        addIssue(
          context,
          ['territories', territory.id, 'adjacentTerritoryIds'],
          `Adjacency is not symmetric with ${adjacentId}`,
        );
      }
    }
    if (territory.legalLordId !== null) {
      const lord = lordById.get(territory.legalLordId);
      if (lord?.seatId !== territory.id) {
        addIssue(
          context,
          ['territories', territory.id, 'legalLordId'],
          'Legal lord seat is inconsistent',
        );
      }
      if (
        territory.levyCapacity !== lord?.starting.levyCapacity ||
        territory.startingLevies !== lord.starting.availableLevies
      ) {
        addIssue(
          context,
          ['territories', territory.id],
          'Territory and lord starting military values disagree',
        );
      }
    }
  }

  const capital = territoryById.get('capital');
  if (capital === undefined || capital.adjacentTerritoryIds.length !== 6) {
    addIssue(context, ['territories', 'capital'], 'Capital must border all six hereditary seats');
  }

  const relationshipPairs = new Set<string>();
  for (const relationship of pack.relationships) {
    if (relationship.firstLordId === relationship.secondLordId) {
      addIssue(context, ['relationships'], 'Self relationship is illegal');
    }
    const pair = [relationship.firstLordId, relationship.secondLordId].sort().join(':');
    if (relationshipPairs.has(pair))
      addIssue(context, ['relationships'], `Duplicate relationship pair: ${pair}`);
    relationshipPairs.add(pair);
  }
  if (relationshipPairs.size !== 15) {
    addIssue(
      context,
      ['relationships'],
      'All 15 unordered lord relationships must be authored exactly once',
    );
  }

  for (const lord of pack.lords) {
    for (const bargainId of lord.bargainIds) {
      if (bargainById.get(bargainId)?.lordId !== lord.id) {
        addIssue(
          context,
          ['lords', lord.id, 'bargainIds'],
          `Invalid bargain reference: ${bargainId}`,
        );
      }
    }
    for (const proofId of lord.proofIds) {
      if (!proofIds.has(proofId))
        addIssue(context, ['lords', lord.id, 'proofIds'], `Missing proof: ${proofId}`);
    }
    for (const redLineId of lord.redLineIds) {
      if (!redLineIds.has(redLineId)) {
        addIssue(context, ['lords', lord.id, 'redLineIds'], `Missing red line: ${redLineId}`);
      }
    }
  }

  for (const evaluation of pack.candidateEvaluations) {
    for (const proofId of evaluation.proofIds) {
      if (!proofIds.has(proofId)) {
        addIssue(
          context,
          ['candidateEvaluations', evaluation.lordId, 'proofIds'],
          `Missing proof: ${proofId}`,
        );
      }
    }
    for (const redLineId of evaluation.redLineIds) {
      if (!redLineIds.has(redLineId)) {
        addIssue(
          context,
          ['candidateEvaluations', evaluation.lordId, 'redLineIds'],
          `Missing red line: ${redLineId}`,
        );
      }
    }
  }
  requireUnique(
    pack.candidateEvaluations,
    (evaluation) => evaluation.lordId,
    context,
    ['candidateEvaluations'],
    'candidate evaluation lord',
  );

  const representedFamilies = new Set(
    pack.actions.flatMap((action) => (action.familyId === null ? [] : [action.familyId])),
  );
  for (const familyId of BASE_ACTION_FAMILY_IDS) {
    if (!representedFamilies.has(familyId)) {
      addIssue(context, ['actions'], `Base action family is not represented: ${familyId}`);
    }
  }
  for (const action of pack.actions) {
    const expectedTiming = action.id === 'offer-bargain' ? 'acceptance' : 'none';
    if (action.acceptanceCollateralTiming !== expectedTiming) {
      addIssue(
        context,
        ['actions', action.id, 'acceptanceCollateralTiming'],
        `Expected ${expectedTiming} timing`,
      );
    }
  }

  const secretById = new Map(pack.secrets.map((secret) => [secret.id, secret]));
  for (const opening of pack.openings) {
    for (const secretId of opening.guaranteedSecretPool) {
      const secret = secretById.get(secretId);
      if (secret?.targetLordId !== 'renard' || secret.pool !== 'renard-guaranteed') {
        addIssue(
          context,
          ['openings', opening.id, 'guaranteedSecretPool'],
          `Invalid Renard route: ${secretId}`,
        );
      }
    }
    for (const secretId of opening.additionalSecretPool) {
      const secret = secretById.get(secretId);
      if (secret?.pool !== 'additional-npc' || secret.targetLordId === 'renard') {
        addIssue(
          context,
          ['openings', opening.id, 'additionalSecretPool'],
          `Invalid additional NPC secret: ${secretId}`,
        );
      }
    }
    requireUnique(
      opening.additionalSecretPool,
      (secretId) => secretId,
      context,
      ['openings', opening.id, 'additionalSecretPool'],
      'additional secret',
    );
    requireExactIds(
      opening.additionalSecretPool,
      ['edric-border-massacre', 'ysabel-tax-embezzlement', 'oswin-simony', 'mara-smuggler-compact'],
      context,
      ['openings', opening.id, 'additionalSecretPool'],
    );
  }

  for (const event of pack.events) {
    requireUnique(
      event.choices,
      (choice) => choice.id,
      context,
      ['events', event.id, 'choices'],
      'event choice ID',
    );
    if (!event.choices.some((eventChoice) => eventChoice.goldCost === 0)) {
      addIssue(context, ['events', event.id, 'choices'], 'Every event requires a zero-Gold option');
    }
    for (const decision of event.followUpDecisions ?? []) {
      requireUnique(
        decision.choices,
        (choice) => choice.id,
        context,
        ['events', event.id, 'followUpDecisions', decision.id, 'choices'],
        'follow-up choice ID',
      );
      if (!decision.choices.some((decisionChoice) => decisionChoice.goldCost === 0)) {
        addIssue(
          context,
          ['events', event.id, 'followUpDecisions', decision.id, 'choices'],
          'Every follow-up decision requires a zero-Gold option',
        );
      }
    }
  }
  requireUnique(
    pack.events.flatMap((event) => event.followUpDecisions ?? []),
    (decision) => decision.id,
    context,
    ['events', 'followUpDecisions'],
    'global follow-up decision ID',
  );
  requireUnique(
    pack.events.flatMap((event) => [
      ...event.choices,
      ...(event.followUpDecisions ?? []).flatMap((decision) => decision.choices),
    ]),
    (choice) => choice.id,
    context,
    ['events', 'choices'],
    'global event/follow-up choice ID',
  );

  const fallbackIds = new Set(
    pack.assets.filter((asset) => asset.category === 'fallback').map((asset) => asset.id),
  );
  for (const asset of pack.assets) {
    if (asset.fallbackKey !== null && !fallbackIds.has(asset.fallbackKey)) {
      addIssue(
        context,
        ['assets', asset.id, 'fallbackKey'],
        `Missing fallback slot: ${asset.fallbackKey}`,
      );
    }
    if (asset.fallbackKey === asset.id) {
      addIssue(context, ['assets', asset.id, 'fallbackKey'], 'Asset cannot fall back to itself');
    }
  }
  for (const requiredAsset of [
    'map-kingdom-plate',
    'portrait-king-deathbed',
    'icon-status-under-duress',
    'icon-action-invade',
    'seal-church',
    'title-key-art',
  ]) {
    if (!pack.assets.some((asset) => asset.id === requiredAsset)) {
      addIssue(context, ['assets'], `Missing required asset slot: ${requiredAsset}`);
    }
  }

  const { text: _text, ...withoutText } = pack;
  const referencedTextKeys = new Set<string>();
  collectTextReferences(withoutText, referencedTextKeys);
  const definedTextKeys = new Set(pack.text.map((entry) => entry.key));
  requireUnique(pack.text, (entry) => entry.key, context, ['text'], 'text key');
  for (const key of referencedTextKeys) {
    if (!definedTextKeys.has(key)) addIssue(context, ['text'], `Missing text key: ${key}`);
  }

  let nextClaimMinimum = 0;
  for (const band of pack.catalogs.claimBands) {
    if (band.minimum !== nextClaimMinimum || band.maximum < band.minimum) {
      addIssue(
        context,
        ['catalogs', 'claimBands', band.id],
        'Claim bands must be contiguous and ordered',
      );
    }
    nextClaimMinimum = band.maximum + 1;
  }
  if (nextClaimMinimum !== 101)
    addIssue(context, ['catalogs', 'claimBands'], 'Claim bands must cover 0–100');

  const deathWeightTotal = Object.values(pack.constants.clock.deathDayWeights).reduce(
    (total, weight) => total + weight,
    0,
  );
  if (deathWeightTotal !== 100)
    addIssue(context, ['constants', 'clock', 'deathDayWeights'], 'Death weights must total 100');

  for (const unresolved of collectUnresolvedEffectReferences(pack)) {
    addIssue(context, ['effects'], `Unresolved typed effect reference: ${unresolved}`);
  }

  const globalReferenceIds = new Set<string>([
    ...pack.phases.map((entry) => entry.id),
    ...pack.lords.map((entry) => entry.id),
    ...pack.territories.map((entry) => entry.id),
    ...pack.actions.map((entry) => entry.id),
    ...pack.bargains.map((entry) => entry.id),
    ...pack.proofs.map((entry) => entry.id),
    ...pack.redLines.map((entry) => entry.id),
    ...pack.secrets.map((entry) => entry.id),
    ...pack.openings.map((entry) => entry.id),
    ...pack.events.map((entry) => entry.id),
    ...pack.shocks.map((entry) => entry.id),
    ...pack.churchStates.map((entry) => entry.id),
    ...pack.endings.map((entry) => entry.id),
    ...pack.assets.map((entry) => entry.id),
  ]);
  for (const mapping of pack.sourceMappings) {
    for (const id of mapping.entityIds) {
      if (!globalReferenceIds.has(id)) {
        addIssue(
          context,
          ['sourceMappings', mapping.designSection],
          `Unknown mapped entity ID: ${id}`,
        );
      }
    }
  }
};

export const validatedCanonicalContentPackSchema =
  canonicalContentPackSchema.superRefine(validatePackReferences);

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  const record = value as Record<string, unknown>;
  const entries = Object.keys(record)
    .sort((left, right) => left.localeCompare(right, 'en'))
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
  return `{${entries.join(',')}}`;
};

export const hashCanonicalContent = (pack: CanonicalContentPack): string => {
  const serialized = stableStringify(pack);
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= BigInt(serialized.charCodeAt(index));
    hash = (hash * prime) & mask;
  }
  return `fnv1a64-${hash.toString(16).padStart(16, '0')}`;
};

const deepFreeze = <T>(value: T): T => {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
};

const rejectBehaviorClosures = (
  value: unknown,
  path = 'content',
  visited: WeakSet<object> = new WeakSet<object>(),
): void => {
  if (typeof value === 'function')
    throw new TypeError(`Executable content is forbidden at ${path}`);
  if (value === null || typeof value !== 'object' || visited.has(value)) return;
  visited.add(value);
  if (Array.isArray(value)) {
    value.forEach((child, index) => {
      rejectBehaviorClosures(child, `${path}[${index}]`, visited);
    });
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    rejectBehaviorClosures(child, `${path}.${key}`, visited);
  }
};

export const loadCanonicalContent = (
  input: unknown = canonicalContentPackInput,
): ImmutableContentRegistry => {
  rejectBehaviorClosures(input);
  const parsed = validatedCanonicalContentPackSchema.parse(input);
  const registry = { ...parsed, contentHash: hashCanonicalContent(parsed) };
  return deepFreeze(registry) as ImmutableContentRegistry;
};

export interface ContentValidationSummary {
  readonly contentHash: string;
  readonly counts: Readonly<Record<string, number>>;
  readonly unresolvedReferences: readonly string[];
  readonly topology: readonly string[];
  readonly numericBoundaryWarnings: readonly string[];
  readonly missingTextKeys: readonly string[];
  readonly missingAssetSlots: readonly string[];
  readonly openingCoverage: Readonly<{ total: number; renardGuaranteed: number }>;
  readonly eventCoverage: Readonly<{ total: number; mandatory: number; ambient: number }>;
}

export const summarizeCanonicalContent = (
  registry: ImmutableContentRegistry = canonicalContentRegistry,
): ContentValidationSummary => {
  const referencedTextKeys = new Set<string>();
  const { text: _text, ...withoutText } = registry;
  collectTextReferences(withoutText, referencedTextKeys);
  const definedTextKeys = new Set(registry.text.map((entry) => entry.key));
  const requiredAssetSlots = [
    'map-kingdom-plate',
    'portrait-king-deathbed',
    'icon-status-under-duress',
    'icon-action-invade',
    'seal-church',
    'title-key-art',
  ];
  const assetIds = new Set(registry.assets.map((entry) => entry.id));
  const deathWeightTotal = Object.values(registry.constants.clock.deathDayWeights).reduce(
    (total, weight) => total + weight,
    0,
  );
  return {
    contentHash: registry.contentHash,
    counts: {
      lords: registry.lords.length,
      territories: registry.territories.length,
      actions: registry.actions.length,
      bargains: registry.bargains.length,
      secrets: registry.secrets.length,
      openings: registry.openings.length,
      events: registry.events.length,
      assets: registry.assets.length,
      textKeys: registry.text.length,
    },
    unresolvedReferences: collectUnresolvedEffectReferences(registry),
    topology: registry.territories.map(
      (territory) => `${territory.id}:${[...territory.adjacentTerritoryIds].sort().join(',')}`,
    ),
    numericBoundaryWarnings:
      deathWeightTotal === 100 ? [] : [`death-day-weights:${deathWeightTotal}`],
    missingTextKeys: [...referencedTextKeys].filter((key) => !definedTextKeys.has(key)).sort(),
    missingAssetSlots: requiredAssetSlots.filter((id) => !assetIds.has(id)),
    openingCoverage: {
      total: registry.openings.length,
      renardGuaranteed: registry.openings.filter(
        (opening) => opening.guaranteedSecretTargetId === 'renard',
      ).length,
    },
    eventCoverage: {
      total: registry.events.length,
      mandatory: registry.events.filter((event) => event.kind === 'mandatory').length,
      ambient: registry.events.filter((event) => event.kind === 'ambient').length,
    },
  };
};

export const formatValidationSummary = (
  summary: ContentValidationSummary = summarizeCanonicalContent(),
): string =>
  [
    `content ${summary.contentHash}`,
    `counts ${Object.entries(summary.counts)
      .map(([name, count]) => `${name}=${count}`)
      .join(' ')}`,
    `references unresolved=${summary.unresolvedReferences.length} text-missing=${summary.missingTextKeys.length} asset-slots-missing=${summary.missingAssetSlots.length}`,
    `coverage openings=${summary.openingCoverage.renardGuaranteed}/${summary.openingCoverage.total} renard-guaranteed events=${summary.eventCoverage.total} (${summary.eventCoverage.mandatory} mandatory, ${summary.eventCoverage.ambient} ambient)`,
    `topology ${summary.topology.join(' | ')}`,
  ].join('\n');

export const canonicalContentRegistry = loadCanonicalContent();
