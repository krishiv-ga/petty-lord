import { describe, expect, it } from 'vitest';
import { BASE_ACTION_FAMILY_IDS, idSchema } from './ids';
import {
  canonicalContentRegistry,
  formatValidationSummary,
  loadCanonicalContent,
  summarizeCanonicalContent,
} from './loader';
import { canonicalContentPackInput } from './pack';
import { type ImmutableContentRegistry, rasterAssetSourceSchema } from './schemas';

type BargainStage = 'none' | 'offered' | 'accepted' | 'fulfilled' | 'sharedRisk';
interface CandidateScoreInput {
  evaluatorLordId: 'edric' | 'ysabel' | 'oswin' | 'mara' | 'renard';
  candidateId: string;
  relationship: number;
  claimBand: 'none' | 'dubious' | 'plausible' | 'strong' | 'excellent' | 'overwhelming';
  churchState: 'condemned' | 'skeptical' | 'neutral' | 'favorable' | 'endorsed';
  viabilityBeforeMultiplier: number;
  desireAndConduct?: number;
  bargainStage?: BargainStage;
  fear?: number;
}
interface CandidateScore {
  candidateId: string;
  total: number | null;
}
const clamp = (value: number, bounds: readonly [number, number]): number =>
  Math.max(bounds[0], Math.min(bounds[1], value));
const scoreCandidate = (
  registry: ImmutableContentRegistry,
  input: CandidateScoreInput,
): CandidateScore => {
  const evaluation = registry.candidateEvaluations.find(
    (entry) => entry.lordId === input.evaluatorLordId,
  );
  if (evaluation === undefined) throw new Error(`Missing evaluation for ${input.evaluatorLordId}`);
  const church = evaluation.legitimacy.church[input.churchState];
  if (church === 'excluded') return { candidateId: input.candidateId, total: null };
  const relationship = clamp(
    Math.round(input.relationship / registry.constants.politics.evaluation.relationshipDivisor),
    registry.constants.politics.evaluation.relationshipClamp,
  );
  const legitimacy = clamp(
    evaluation.legitimacy.claim[input.claimBand] + church,
    evaluation.legitimacy.clamp,
  );
  const viability = clamp(
    input.viabilityBeforeMultiplier *
      registry.constants.politics.viability.lordMultipliers[input.evaluatorLordId],
    registry.constants.politics.viability.clamp,
  );
  const total =
    relationship +
    legitimacy +
    viability +
    clamp(input.desireAndConduct ?? 0, evaluation.desireAndConductClamp) +
    registry.constants.politics.evaluation.bargainValues[input.bargainStage ?? 'none'] +
    (input.fear ?? 0);
  return { candidateId: input.candidateId, total };
};
const derivesLeaning = (
  registry: ImmutableContentRegistry,
  best: CandidateScore,
  runnerUp: CandidateScore,
): boolean =>
  best.total !== null &&
  best.total >= registry.constants.politics.leanAt &&
  (runnerUp.total === null || best.total - runnerUp.total >= registry.constants.politics.leanLead);

describe('canonical content registry', () => {
  it('validates the complete canonical pack with exact launch counts', () => {
    const summary = summarizeCanonicalContent();

    expect(summary.counts).toMatchObject({
      lords: 6,
      territories: 7,
      actions: 19,
      bargains: 12,
      secrets: 8,
      openings: 4,
      events: 16,
    });
    expect(summary.unresolvedReferences).toEqual([]);
    expect(summary.missingTextKeys).toEqual([]);
    expect(summary.missingAssetSlots).toEqual([]);
    expect(summary.openingCoverage).toEqual({ total: 4, renardGuaranteed: 4 });
    expect(summary.eventCoverage).toEqual({ total: 16, mandatory: 4, ambient: 12 });
  });

  it('matches the final seven-territory topology symmetrically', () => {
    const adjacency = Object.fromEntries(
      canonicalContentRegistry.territories.map((territory) => [
        territory.id,
        [...territory.adjacentTerritoryIds].sort(),
      ]),
    );

    expect(adjacency).toEqual({
      abbeylands: ['capital', 'greyfen', 'southmere'],
      capital: ['abbeylands', 'eastvale', 'greyfen', 'northkeep', 'southmere', 'westmarch'],
      eastvale: ['capital', 'northkeep', 'southmere'],
      greyfen: ['abbeylands', 'capital', 'westmarch'],
      northkeep: ['capital', 'eastvale', 'westmarch'],
      southmere: ['abbeylands', 'capital', 'eastvale'],
      westmarch: ['capital', 'greyfen', 'northkeep'],
    });
  });

  it('rejects asymmetric topology through the canonical loader', () => {
    const invalid: unknown = structuredClone(canonicalContentPackInput);
    const mutable = invalid as {
      territories: Array<{ id: string; adjacentTerritoryIds: string[] }>;
    };
    const greyfen = mutable.territories.find((territory) => territory.id === 'greyfen');
    expect(greyfen).toBeDefined();
    greyfen?.adjacentTerritoryIds.splice(greyfen.adjacentTerritoryIds.indexOf('westmarch'), 1);

    expect(() => loadCanonicalContent(invalid)).toThrow(/Adjacency is not symmetric/);
  });

  it('preserves exact canonical starting military and economy values', () => {
    const byLord = Object.fromEntries(
      canonicalContentRegistry.lords.map((lord) => [lord.id, lord.starting]),
    );

    expect(byLord).toMatchObject({
      greyfen: {
        gold: 70,
        availableLevies: 360,
        levyCapacity: 420,
        prestige: 12,
        claim: 10,
        influence: 35,
      },
      edric: {
        gold: 55,
        availableLevies: 620,
        levyCapacity: 720,
        prestige: 55,
        claim: 18,
        influence: 35,
      },
      ysabel: {
        gold: 170,
        availableLevies: 240,
        levyCapacity: 300,
        prestige: 36,
        claim: 24,
        influence: 55,
      },
      renard: {
        gold: 110,
        availableLevies: 450,
        levyCapacity: 520,
        prestige: 48,
        claim: 72,
        influence: 60,
      },
      oswin: {
        gold: 85,
        availableLevies: 210,
        levyCapacity: 260,
        prestige: 42,
        claim: 16,
        influence: 50,
      },
      mara: {
        gold: 65,
        availableLevies: 430,
        levyCapacity: 500,
        prestige: 34,
        claim: 12,
        influence: 40,
      },
    });

    expect(canonicalContentRegistry.constants.economy.levyRecoveryRate).toBe(0.005);
    expect(canonicalContentRegistry.constants.economy.occupationIncomeMultiplier).toBe(0.25);
    expect(canonicalContentRegistry.constants.war.hereditaryGarrison).toBe(75);
    expect(canonicalContentRegistry.constants.war.capitalGarrison).toBe(200);
  });

  it('represents every base action family and complete action contract', () => {
    const represented = new Set(
      canonicalContentRegistry.actions.flatMap((action) =>
        action.familyId === null ? [] : [action.familyId],
      ),
    );
    expect(represented).toEqual(new Set(BASE_ACTION_FAMILY_IDS));

    for (const action of canonicalContentRegistry.actions) {
      expect(action.legalPhaseIds.length).toBeGreaterThan(0);
      expect(action.previewFieldKeys).toEqual(
        expect.arrayContaining([
          'preview.duration',
          'preview.start-cost',
          'preview.acceptance-collateral',
          'preview.cancellation',
          'preview.invalidation',
        ]),
      );
      expect(action.cancellationPolicyId).toMatch(/^[a-z0-9-]+$/);
      expect(action.invalidationPolicyId).toMatch(/^[a-z0-9-]+$/);
      expect(action.resultEffectIds.length).toBeGreaterThan(0);
    }

    expect(
      canonicalContentRegistry.actions.find((action) => action.id === 'offer-bargain'),
    ).toMatchObject({
      startCost: { influence: 8 },
      acceptanceCollateralTiming: 'acceptance',
    });
    expect(
      canonicalContentRegistry.actions.find((action) => action.id === 'find-dirt')?.legalPhaseIds,
    ).not.toContain('deathbed');
    expect(
      canonicalContentRegistry.actions.find((action) => action.id === 'threaten')
        ?.visibilityVariants,
    ).toEqual([
      {
        ruleId: 'military-or-occupation-leverage',
        visibility: 'public',
        supportLabel: 'under-duress',
      },
      {
        ruleId: 'secret-blackmail-leverage',
        visibility: 'private-to-parties',
        supportLabel: 'pledged',
      },
    ]);
    expect(
      canonicalContentRegistry.actions.find((action) => action.id === 'march-on-capital')
        ?.durationVariants,
    ).toEqual([{ ruleId: 'capital-uncontrolled', days: 1 }]);
  });

  it('stores collateral only at acceptance and keeps future rewards distinct', () => {
    for (const bargain of canonicalContentRegistry.bargains) {
      expect(bargain.negotiationInfluenceCost).toBe(8);
      for (const collateral of bargain.presentCollateral)
        expect(collateral.timing).toBe('acceptance');
    }

    expect(
      canonicalContentRegistry.bargains.find((bargain) => bargain.id === 'edric-marshal'),
    ).toMatchObject({
      presentCollateral: [],
      reservedFutureOffice: 'marshal',
      supportEffect: 'leaning-only',
    });
    expect(
      canonicalContentRegistry.bargains.find((bargain) => bargain.id === 'oswin-abbey-endowment'),
    ).toMatchObject({
      presentCollateral: [{ type: 'gold-payment', amount: 60, timing: 'acceptance' }],
      effects: expect.arrayContaining([
        expect.objectContaining({
          effectId: 'apply-condition',
          referenceId: 'church-patronage',
        }),
      ]),
    });
    expect(
      canonicalContentRegistry.actions.find((action) => action.id === 'patronize-church')
        ?.canonicalResults,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effectId: 'apply-condition',
          referenceId: 'church-patronage',
        }),
      ]),
    );
  });

  it('encodes opening support expectations without equating relationship and support', () => {
    const initialSupport = Object.fromEntries(
      canonicalContentRegistry.lords.map((lord) => [lord.id, lord.initialSupport]),
    );

    expect(initialSupport.ysabel).toMatchObject({ candidateId: 'renard', level: 'leaning' });
    expect(initialSupport.oswin).toMatchObject({ candidateId: 'renard', level: 'leaning' });
    expect(initialSupport.edric).toMatchObject({ candidateId: null, level: 'unaligned' });
    expect(initialSupport.mara).toMatchObject({ candidateId: null, level: 'unaligned' });

    const ysabelRenard = scoreCandidate(canonicalContentRegistry, {
      evaluatorLordId: 'ysabel',
      candidateId: 'renard',
      relationship: 20,
      claimBand: 'excellent',
      churchState: 'favorable',
      viabilityBeforeMultiplier: 9,
    });
    const ysabelGreyfen = scoreCandidate(canonicalContentRegistry, {
      evaluatorLordId: 'ysabel',
      candidateId: 'greyfen',
      relationship: 5,
      claimBand: 'dubious',
      churchState: 'neutral',
      viabilityBeforeMultiplier: -4,
    });
    const oswinRenard = scoreCandidate(canonicalContentRegistry, {
      evaluatorLordId: 'oswin',
      candidateId: 'renard',
      relationship: 15,
      claimBand: 'excellent',
      churchState: 'favorable',
      viabilityBeforeMultiplier: 9,
    });
    const oswinGreyfen = scoreCandidate(canonicalContentRegistry, {
      evaluatorLordId: 'oswin',
      candidateId: 'greyfen',
      relationship: 0,
      claimBand: 'dubious',
      churchState: 'neutral',
      viabilityBeforeMultiplier: -4,
    });
    expect(derivesLeaning(canonicalContentRegistry, ysabelRenard, ysabelGreyfen)).toBe(true);
    expect(derivesLeaning(canonicalContentRegistry, oswinRenard, oswinGreyfen)).toBe(true);
    const edricRenard = scoreCandidate(canonicalContentRegistry, {
      evaluatorLordId: 'edric',
      candidateId: 'renard',
      relationship: -20,
      claimBand: 'excellent',
      churchState: 'favorable',
      viabilityBeforeMultiplier: 9,
    });
    const edricGreyfen = scoreCandidate(canonicalContentRegistry, {
      evaluatorLordId: 'edric',
      candidateId: 'greyfen',
      relationship: 0,
      claimBand: 'dubious',
      churchState: 'neutral',
      viabilityBeforeMultiplier: -4,
    });
    const maraGreyfen = scoreCandidate(canonicalContentRegistry, {
      evaluatorLordId: 'mara',
      candidateId: 'greyfen',
      relationship: 10,
      claimBand: 'dubious',
      churchState: 'neutral',
      viabilityBeforeMultiplier: -4,
    });
    const maraRenard = scoreCandidate(canonicalContentRegistry, {
      evaluatorLordId: 'mara',
      candidateId: 'renard',
      relationship: -30,
      claimBand: 'excellent',
      churchState: 'favorable',
      viabilityBeforeMultiplier: 9,
    });
    expect(derivesLeaning(canonicalContentRegistry, edricRenard, edricGreyfen)).toBe(false);
    expect(derivesLeaning(canonicalContentRegistry, maraGreyfen, maraRenard)).toBe(false);
    expect(canonicalContentRegistry.constants.politics.evaluation).toMatchObject({
      relationshipDivisor: 5,
      relationshipClamp: [-20, 20],
      bargainValues: { none: 0, offered: 8, accepted: 12, fulfilled: 20, sharedRisk: 25 },
      exactTieRetainsCurrentLeaning: true,
      noLeaningTieBreakOrder: ['relationship', 'legitimacy', 'declaration-time', 'candidate-id'],
    });
    expect(
      canonicalContentRegistry.candidateEvaluations.find((entry) => entry.lordId === 'ysabel')
        ?.fearOverrides,
    ).toEqual([
      {
        threatBand: 'serious',
        whenRuleId: 'active-protection-benefits-ysabel',
        value: 4,
        mode: 'replace',
      },
    ]);
  });

  it('authors exact secret shock selectors and values', () => {
    const byId = new Map(canonicalContentRegistry.secrets.map((secret) => [secret.id, secret]));
    expect(byId.get('renard-questioned-paternity')?.effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: 'oswin',
          value: 15,
          referenceId: 'renard-paternity-oswin',
        }),
        expect.objectContaining({
          target: 'ysabel',
          value: 8,
          referenceId: 'renard-paternity-ysabel',
        }),
      ]),
    );
    expect(byId.get('edric-border-massacre')?.effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: 'all-edric-candidate-pledges',
          value: 10,
          referenceId: 'edric-massacre-pledges',
        }),
      ]),
    );
    expect(byId.get('ysabel-tax-embezzlement')?.effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: 'ysabel-opportunistic-pledge',
          value: 10,
          referenceId: 'ysabel-embezzlement-opportunism',
        }),
      ]),
    );
    expect(byId.get('player-forgery-evidence')?.effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          target: 'all-player-supporters',
          value: 20,
          referenceId: 'forgery-exposed',
        }),
        expect.objectContaining({
          target: 'all-player-supporters',
          value: 10,
          referenceId: 'forgery-exposed-other-basis',
        }),
      ]),
    );
    expect(
      canonicalContentRegistry.shocks.find((shock) => shock.id === 'forgery-exposed'),
    ).toMatchObject({ basisFilter: ['legitimacy'], value: 20 });
    expect(
      canonicalContentRegistry.shocks.find((shock) => shock.id === 'forgery-exposed-other-basis'),
    ).toMatchObject({ excludeBasisFilter: ['legitimacy'], value: 10 });
  });

  it('guarantees one authored Renard vulnerability in every opening', () => {
    const secretsById = new Map(
      canonicalContentRegistry.secrets.map((secret) => [secret.id, secret]),
    );

    for (const opening of canonicalContentRegistry.openings) {
      expect(opening.guaranteedSecretTargetId).toBe('renard');
      expect(opening.guaranteedSecretPool).toHaveLength(3);
      expect(opening.additionalSecretCount).toBe(2);
      expect(opening.additionalSecretPool).toHaveLength(4);
      for (const secretId of opening.guaranteedSecretPool) {
        expect(secretsById.get(secretId)).toMatchObject({
          targetLordId: 'renard',
          pool: 'renard-guaranteed',
          blackmailUseLimit: 1,
          exposeUseLimit: 1,
        });
      }
      for (const secretId of opening.additionalSecretPool) {
        expect(secretsById.get(secretId)).toMatchObject({ pool: 'additional-npc' });
      }
    }
  });

  it('contains sixteen legal authored events with a zero-Gold choice', () => {
    expect(canonicalContentRegistry.events).toHaveLength(16);
    for (const event of canonicalContentRegistry.events) {
      expect(event.choices.some((choice) => choice.goldCost === 0)).toBe(true);
      for (const eventChoice of event.choices)
        expect(eventChoice.effects.length).toBeGreaterThan(0);
    }

    expect(
      canonicalContentRegistry.events.find((event) => event.id === 'e13-merchant-syndicate-loan'),
    ).toMatchObject({
      phaseIds: ['stable', 'ailing'],
      elapsedDayWindow: [0, 27],
      followUpDecisions: [
        {
          id: 'merchant-loan-repayment',
          delayDays: 14,
          mandatory: true,
          choices: [
            expect.objectContaining({ id: 'merchant-loan-repay', goldCost: 105 }),
            expect.objectContaining({ id: 'merchant-loan-default', goldCost: 0 }),
          ],
        },
      ],
    });

    const randomChoices = new Map(
      canonicalContentRegistry.events.flatMap((event) =>
        event.choices.flatMap((eventChoice) =>
          eventChoice.randomOutcome === undefined
            ? []
            : ([[eventChoice.id, eventChoice.randomOutcome]] as const),
        ),
      ),
    );
    expect(randomChoices.get('e06-send-levies')).toMatchObject({
      distribution: 'uniform-integer',
      values: [0, 20],
    });
    expect(randomChoices.get('e09-ignore')).toMatchObject({
      distribution: 'weighted',
      values: [0, -25, -50],
      weights: [50, 25, 25],
    });
    expect(randomChoices.get('e12-sponsor')).toMatchObject({
      distribution: 'coin-flip',
      values: [5, 2],
    });
    expect(randomChoices.get('e14-blame-renard')).toMatchObject({
      distribution: 'coin-flip',
      values: [1, 0],
    });
  });

  it('rejects SVG, SVG data URIs and icon fonts while allowing approved rasters', () => {
    expect(rasterAssetSourceSchema.safeParse('assets/icons/crown.png').success).toBe(true);
    expect(rasterAssetSourceSchema.safeParse('assets/portraits/king.webp').success).toBe(true);
    expect(rasterAssetSourceSchema.safeParse('assets/icons/crown.svg').success).toBe(false);
    expect(rasterAssetSourceSchema.safeParse('data:image/svg+xml;base64,PHN2Zz4=').success).toBe(
      false,
    );
    expect(rasterAssetSourceSchema.safeParse('icon-font:crown').success).toBe(false);
    expect(
      rasterAssetSourceSchema.safeParse('  data:image/svg+xml;base64,PHN2Zz4=.png').success,
    ).toBe(false);
    expect(rasterAssetSourceSchema.safeParse('  icon-font:crown.png').success).toBe(false);
  });

  it('rejects unresolved typed effects, duplicate secret pools, and malformed weights', () => {
    const unresolved = structuredClone(canonicalContentPackInput) as unknown as {
      actions: Array<{
        id: string;
        canonicalResults: Array<{ referenceId?: string }>;
      }>;
    };
    const forge = unresolved.actions.find((action) => action.id === 'forge-royal-descent');
    expect(forge).toBeDefined();
    if (forge !== undefined && forge.canonicalResults[1] !== undefined)
      forge.canonicalResults[1].referenceId = 'missing-secret';
    expect(() => loadCanonicalContent(unresolved)).toThrow(/Unresolved typed effect reference/);

    const duplicatePool = structuredClone(canonicalContentPackInput) as unknown as {
      openings: Array<{ additionalSecretPool: string[] }>;
    };
    const firstOpening = duplicatePool.openings[0];
    expect(firstOpening).toBeDefined();
    if (firstOpening !== undefined) {
      const firstSecret = firstOpening.additionalSecretPool[0];
      expect(firstSecret).toBeDefined();
      if (firstSecret !== undefined) firstOpening.additionalSecretPool[3] = firstSecret;
    }
    expect(() => loadCanonicalContent(duplicatePool)).toThrow(
      /Duplicate additional secret|Missing canonical ID/,
    );

    const malformedWeights = structuredClone(canonicalContentPackInput) as unknown as {
      events: Array<{
        choices: Array<{
          randomOutcome?: { distribution: string; weights?: number[] };
        }>;
      }>;
    };
    const weighted = malformedWeights.events
      .flatMap((event) => event.choices)
      .find((choice) => choice.randomOutcome?.distribution === 'weighted');
    expect(weighted?.randomOutcome?.weights).toBeDefined();
    weighted?.randomOutcome?.weights?.pop();
    expect(() => loadCanonicalContent(malformedWeights)).toThrow(/Weights must match values/);
  });

  it('rejects contradictory effect targets, values, delays, and duplicate decision IDs', () => {
    type MutableEffect = {
      effectId: string;
      target: string;
      value?: number;
      referenceId?: string;
    };
    type MutableEvent = {
      choices: Array<{ id: string; effects: MutableEffect[] }>;
      followUpDecisions?: Array<{ id: string; delayDays: number }>;
    };

    const wrongTarget = structuredClone(canonicalContentPackInput) as unknown as {
      secrets: Array<{ effects: MutableEffect[] }>;
    };
    const churchEffect = wrongTarget.secrets
      .flatMap((secret) => secret.effects)
      .find((effect) => effect.effectId === 'set-church-state');
    expect(churchEffect).toBeDefined();
    if (churchEffect !== undefined) churchEffect.target = 'player';
    expect(() => loadCanonicalContent(wrongTarget)).toThrow(/invalid-target-player/);

    const wrongShockValue = structuredClone(canonicalContentPackInput) as unknown as {
      secrets: Array<{ effects: MutableEffect[] }>;
    };
    const shockEffect = wrongShockValue.secrets
      .flatMap((secret) => secret.effects)
      .find((effect) => effect.referenceId === 'renard-paternity-oswin');
    expect(shockEffect).toBeDefined();
    if (shockEffect !== undefined) shockEffect.value = 99;
    expect(() => loadCanonicalContent(wrongShockValue)).toThrow(/value-99-expected-15/);

    const wrongDelay = structuredClone(canonicalContentPackInput) as unknown as {
      events: MutableEvent[];
    };
    const scheduled = wrongDelay.events
      .flatMap((event) => event.choices)
      .flatMap((choice) => choice.effects)
      .find((effect) => effect.referenceId === 'merchant-loan-repayment');
    expect(scheduled).toBeDefined();
    if (scheduled !== undefined) scheduled.value = 1;
    expect(() => loadCanonicalContent(wrongDelay)).toThrow(/delay-1-expected-14/);

    const duplicateDecision = structuredClone(canonicalContentPackInput) as unknown as {
      events: MutableEvent[];
    };
    const decisions = duplicateDecision.events.flatMap((event) => event.followUpDecisions ?? []);
    expect(decisions).toHaveLength(2);
    if (decisions[0] !== undefined && decisions[1] !== undefined) decisions[1].id = decisions[0].id;
    expect(() => loadCanonicalContent(duplicateDecision)).toThrow(
      /Duplicate global follow-up decision ID/,
    );

    const duplicateChoice = structuredClone(canonicalContentPackInput) as unknown as {
      events: MutableEvent[];
    };
    const firstChoice = duplicateChoice.events[0]?.choices[0];
    const secondEventChoice = duplicateChoice.events[1]?.choices[0];
    expect(firstChoice).toBeDefined();
    expect(secondEventChoice).toBeDefined();
    if (firstChoice !== undefined && secondEventChoice !== undefined)
      secondEventChoice.id = firstChoice.id;
    expect(() => loadCanonicalContent(duplicateChoice)).toThrow(
      /Duplicate global event\/follow-up choice ID/,
    );
  });

  it('encodes action edge contracts and the two Raise Taxes branches', () => {
    const actions = new Map(canonicalContentRegistry.actions.map((action) => [action.id, action]));
    expect(actions.get('offer-bargain')?.duration.deathbedDays).toBe(1);
    expect(actions.get('send-gift')?.repeatRule.effectMultipliers).toEqual([1, 0.5, 0]);
    expect(actions.get('send-gift')?.repeatRule).toMatchObject({
      refuseAfterUses: 2,
      chargeOnRefusal: false,
    });
    expect(actions.get('watch-court')?.intelligenceFreshDays).toBe(7);
    expect(actions.get('threaten')?.repeatRule.resetRuleIds).toEqual([
      'new-qualifying-leverage-acquired',
    ]);
    expect(actions.get('raise-taxes')?.resultBranches).toEqual([
      expect.objectContaining({
        id: 'first-unstrained-collection',
        effects: expect.arrayContaining([
          expect.objectContaining({ effectId: 'adjust-gold', value: 14 }),
          expect.objectContaining({
            effectId: 'apply-condition',
            referenceId: 'tax-strain',
            durationDays: 21,
          }),
        ]),
      }),
      expect.objectContaining({
        id: 'strained-repeat',
        effects: expect.arrayContaining([
          expect.objectContaining({ effectId: 'adjust-gold', value: 7 }),
          expect.objectContaining({ effectId: 'remove-condition', referenceId: 'tax-strain' }),
          expect.objectContaining({
            effectId: 'apply-condition',
            referenceId: 'unrest',
            durationDays: 21,
          }),
        ]),
      }),
    ]);
  });

  it('provides every referenced text key and required raster slot metadata', () => {
    const textKeys = new Set(canonicalContentRegistry.text.map((entry) => entry.key));
    expect(textKeys.has('preview.acceptance-collateral')).toBe(true);
    expect(textKeys.has('ending.section.constitution')).toBe(true);
    for (const entry of canonicalContentRegistry.text) {
      expect(entry.defaultText.length).toBeLessThanOrEqual(entry.maxLength);
    }

    expect(canonicalContentRegistry.assets.length).toBeGreaterThanOrEqual(40);
    for (const asset of canonicalContentRegistry.assets) {
      expect(asset.allowedFormats.every((format) => format === 'png' || format === 'webp')).toBe(
        true,
      );
      expect(asset.logicalWidth / asset.logicalHeight).toBeCloseTo(asset.aspectRatio, 10);
    }
  });

  it('uses category-scoped lowercase kebab IDs and immutable serializable data', () => {
    const categories = [
      canonicalContentRegistry.lords,
      canonicalContentRegistry.territories,
      canonicalContentRegistry.actions,
      canonicalContentRegistry.bargains,
      canonicalContentRegistry.secrets,
      canonicalContentRegistry.events,
      canonicalContentRegistry.assets,
    ];
    for (const category of categories) {
      const ids = category.map((entry) => entry.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(idSchema.safeParse(id).success).toBe(true);
    }

    expect(Object.isFrozen(canonicalContentRegistry)).toBe(true);
    expect(Object.isFrozen(canonicalContentRegistry.lords)).toBe(true);
    expect(Object.isFrozen(canonicalContentRegistry.lords[0])).toBe(true);
    expect(JSON.parse(JSON.stringify(canonicalContentRegistry))).toBeDefined();
  });

  it('rejects executable behavior hidden inside JSON-like content', () => {
    const invalid: unknown = structuredClone(canonicalContentPackInput);
    const mutable = invalid as { actions: Array<Record<string, unknown>> };
    const firstAction = mutable.actions[0];
    expect(firstAction).toBeDefined();
    if (firstAction !== undefined) firstAction.resolve = () => 'hidden transition';

    expect(() => loadCanonicalContent(invalid)).toThrow(/Executable content is forbidden/);
  });

  it('emits a deterministic content hash and concise validation snapshot', () => {
    const first = loadCanonicalContent(structuredClone(canonicalContentPackInput));
    const second = loadCanonicalContent(structuredClone(canonicalContentPackInput));
    expect(first.contentHash).toMatch(/^fnv1a64-[0-9a-f]{16}$/);
    expect(first.contentHash).toBe(second.contentHash);

    const report = formatValidationSummary();
    console.info(report);
    expect(report).toContain(`content ${first.contentHash}`);
    expect(report).toContain('lords=6 territories=7 actions=19');
    expect(report).toContain('references unresolved=0');
    expect(report).toContain('openings=4/4 renard-guaranteed');
    expect(report).toContain('events=16 (4 mandatory, 12 ambient)');
  });

  it('maps every canonical design source to concrete content entities', () => {
    expect(canonicalContentRegistry.sourceMappings).toHaveLength(9);
    expect(canonicalContentRegistry.sourceMappings.map((mapping) => mapping.designSection)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('game-rules.md'),
        expect.stringContaining('world-and-actors.md'),
        expect.stringContaining('candidate-evaluation.md'),
        expect.stringContaining('balance-sheet.md'),
        expect.stringContaining('final-amendments.md'),
      ]),
    );
  });
});
