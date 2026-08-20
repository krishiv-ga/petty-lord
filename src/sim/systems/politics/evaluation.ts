import type { ChurchStateId, ClaimBandId, LordId, RedLineId } from '@contracts/ids';

export type ThreatBand = 'concern' | 'existential' | 'low' | 'serious';
export type BargainStage = 'accepted' | 'fulfilled' | 'none' | 'offered' | 'shared-risk';
export type CandidateSupportStanding =
  | 'coerced-pledge'
  | 'none'
  | 'voluntary-commitment'
  | 'voluntary-pledge';

export type DesireFlag =
  | 'abbeylands-defended-or-liberated'
  | 'active-troop-protection'
  | 'all-other-support-lost-after-risk'
  | 'border-aid-fulfilled'
  | 'broke-peace-ailing'
  | 'capital-controlled'
  | 'capital-held-three-days'
  | 'centralizing-program'
  | 'church-immunities'
  | 'defaulted-debtor-to-ysabel'
  | 'defeated-renard'
  | 'denounced-central-rule'
  | 'defied-peace-stable'
  | 'eastvale-protected'
  | 'exposed-renard-secret'
  | 'exposed-rival-impiety-lawfully'
  | 'fulfilled-provincial-aid'
  | 'funeral'
  | 'greyfen-charter'
  | 'liberated-westmarch'
  | 'major-defeat-recent'
  | 'major-victory-recent'
  | 'military-below-half-edric'
  | 'military-existential-to-edric'
  | 'military-peer-edric'
  | 'military-respected-edric'
  | 'military-strong-edric'
  | 'oathbreaker-military-aid'
  | 'patronage-or-endowment'
  | 'protected-or-restored-southmere'
  | 'public-oathbreaker'
  | 'publicly-abandoned-ally'
  | 'royal-centralization-defended'
  | 'second-offensive-war'
  | 'seized-capital-against-renard'
  | 'shared-campaign-victory'
  | 'southmere-occupied'
  | 'supported-provincial-liberties'
  | 'usurper';

export type EvaluationReasonCategory =
  | 'bargain'
  | 'binding-support'
  | 'desire-conduct'
  | 'fear'
  | 'legitimacy'
  | 'proof-maturation'
  | 'red-line'
  | 'relationship'
  | 'viability';

export type EvaluationReason = {
  readonly category: EvaluationReasonCategory;
  readonly id: string;
  readonly value: number | null;
};

export type CandidateEvaluationInput = {
  readonly bargainStage: BargainStage;
  readonly bindingSupport: CandidateSupportStanding;
  readonly candidateId: LordId;
  readonly churchState: ChurchStateId;
  readonly claimBand: ClaimBandId;
  readonly declarationDay: number | null;
  readonly desireFlags: Readonly<Partial<Record<DesireFlag, boolean>>>;
  readonly knownThreatBand: ThreatBand;
  readonly proofState: 'maturing' | 'missing' | 'not-required' | 'satisfied';
  readonly redLines: readonly RedLineId[];
  readonly relationshipValue: number;
  readonly viability: {
    readonly capitalControlled: boolean;
    readonly dispossessed: boolean;
    readonly majorDefeatRecent: boolean;
    readonly majorVictoryRecent: boolean;
    readonly supportStanding: CandidateSupportStanding;
  };
  readonly voterId: LordId;
};

export type CandidateEvaluation = {
  readonly candidateId: LordId;
  readonly components: {
    readonly bargain: number;
    readonly desireAndConduct: number;
    readonly fear: number;
    readonly legitimacy: number;
    readonly relationship: number;
    readonly viability: number;
  };
  readonly excluded: boolean;
  readonly orderedReasons: readonly EvaluationReason[];
  readonly redLines: readonly RedLineId[];
  readonly total: number | null;
  readonly voterId: LordId;
};

export type DeclarationPrecedence = {
  readonly day: number | null;
  readonly sequenceId: number | null;
};

export type PreferenceResult = {
  readonly bestCandidateId: LordId | null;
  readonly decision: 'lean' | 'retain' | 'unalign';
  readonly lead: number | null;
  readonly orderedCandidates: readonly CandidateEvaluation[];
};

export type CouncilFallbackFact = {
  readonly candidateId: LordId;
  readonly currentViolenceAgainstVoterSeat: boolean;
  readonly declarationSequenceId: number;
  readonly declarationTime: number;
  readonly exactClaim: number;
};

export type CouncilVoteChoice = {
  readonly candidateId: LordId;
  readonly reasons: readonly EvaluationReason[];
  readonly usedExcludedFinalistFallback: boolean;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.max(minimum, Math.min(maximum, value));

const CLAIM_VIABILITY: Record<ClaimBandId, number> = {
  dubious: -4,
  excellent: 6,
  none: -8,
  overwhelming: 8,
  plausible: 0,
  strong: 3,
};

const BARGAIN_VALUES: Record<BargainStage, number> = {
  accepted: 12,
  fulfilled: 20,
  none: 0,
  offered: 8,
  'shared-risk': 25,
};

const LEGITIMACY = {
  edric: {
    claim: { none: -6, dubious: -3, plausible: 0, strong: 2, excellent: 4, overwhelming: 5 },
    church: { condemned: -4, skeptical: -1, neutral: 0, favorable: 1, endorsed: 2 },
    clamp: [-8, 7],
  },
  mara: {
    claim: { none: 3, dubious: 2, plausible: 0, strong: -2, excellent: -4, overwhelming: -6 },
    church: { condemned: 0, skeptical: 1, neutral: 0, favorable: -1, endorsed: -3 },
    clamp: [-9, 4],
  },
  oswin: {
    claim: { none: -15, dubious: -10, plausible: 0, strong: 5, excellent: 8, overwhelming: 10 },
    church: { condemned: 0, skeptical: -5, neutral: 0, favorable: 3, endorsed: 5 },
    clamp: [-20, 15],
  },
  renard: {
    claim: { none: -10, dubious: -6, plausible: 0, strong: 4, excellent: 7, overwhelming: 9 },
    church: { condemned: -8, skeptical: -3, neutral: 0, favorable: 3, endorsed: 6 },
    clamp: [-18, 15],
  },
  ysabel: {
    claim: { none: -8, dubious: -4, plausible: 0, strong: 2, excellent: 4, overwhelming: 5 },
    church: { condemned: -5, skeptical: -2, neutral: 0, favorable: 2, endorsed: 4 },
    clamp: [-12, 9],
  },
} as const;

const DESIRE: Record<Exclude<LordId, 'greyfen'>, Partial<Record<DesireFlag, number>>> = {
  edric: {
    'border-aid-fulfilled': 10,
    'capital-held-three-days': 5,
    'major-defeat-recent': -8,
    'major-victory-recent': 8,
    'military-below-half-edric': -12,
    'military-existential-to-edric': 5,
    'military-peer-edric': 8,
    'military-respected-edric': -5,
    'military-strong-edric': 5,
    'oathbreaker-military-aid': -20,
    'publicly-abandoned-ally': -15,
    'shared-campaign-victory': 12,
  },
  mara: {
    'centralizing-program': -20,
    'denounced-central-rule': 8,
    'fulfilled-provincial-aid': 12,
    'greyfen-charter': 20,
    'liberated-westmarch': 20,
    'public-oathbreaker': -10,
    'royal-centralization-defended': -12,
    'seized-capital-against-renard': 3,
    'supported-provincial-liberties': 6,
  },
  oswin: {
    'abbeylands-defended-or-liberated': 10,
    'broke-peace-ailing': -4,
    'church-immunities': 8,
    'defied-peace-stable': -8,
    'exposed-rival-impiety-lawfully': 5,
    funeral: 3,
    'patronage-or-endowment': 5,
    'public-oathbreaker': -8,
    'second-offensive-war': -5,
    usurper: -8,
  },
  renard: {
    'defeated-renard': -10,
    'denounced-central-rule': -8,
    'exposed-renard-secret': -20,
    'greyfen-charter': -10,
    'protected-or-restored-southmere': 15,
    'public-oathbreaker': -8,
    'southmere-occupied': -25,
    usurper: -10,
  },
  ysabel: {
    'active-troop-protection': 8,
    'all-other-support-lost-after-risk': -12,
    'capital-controlled': 4,
    'defaulted-debtor-to-ysabel': -25,
    'eastvale-protected': 15,
    'major-defeat-recent': -6,
    'major-victory-recent': 4,
    'public-oathbreaker': -8,
  },
};

const FEAR: Record<Exclude<LordId, 'greyfen'>, Record<ThreatBand, number>> = {
  edric: { low: 0, concern: 3, serious: -8, existential: -20 },
  mara: { low: 0, concern: -2, serious: -10, existential: -20 },
  oswin: { low: 0, concern: -2, serious: -8, existential: -15 },
  renard: { low: 0, concern: 2, serious: -5, existential: -15 },
  ysabel: { low: 0, concern: 2, serious: -6, existential: -15 },
};

const REASON_ORDER: Record<EvaluationReasonCategory, number> = {
  'red-line': 0,
  'binding-support': 1,
  'proof-maturation': 2,
  'desire-conduct': 3,
  bargain: 4,
  legitimacy: 5,
  viability: 6,
  fear: 7,
  relationship: 8,
};

function legitimacyFor(input: CandidateEvaluationInput): number {
  if (input.voterId === 'greyfen') {
    throw new Error('Greyfen preference is player-controlled and must never be auto-evaluated.');
  }
  const table = LEGITIMACY[input.voterId];
  return clamp(
    table.claim[input.claimBand] + table.church[input.churchState],
    table.clamp[0],
    table.clamp[1],
  );
}

function desireFor(input: CandidateEvaluationInput): {
  reasons: EvaluationReason[];
  value: number;
} {
  if (input.voterId === 'greyfen') {
    throw new Error('Greyfen preference is player-controlled and must never be auto-evaluated.');
  }
  const weights = DESIRE[input.voterId];
  const reasons = Object.entries(input.desireFlags)
    .filter(([, active]) => active)
    .flatMap(([id]) => {
      const value = weights[id as DesireFlag];
      return value === undefined ? [] : [{ category: 'desire-conduct' as const, id, value }];
    });
  return {
    reasons,
    value: clamp(
      reasons.reduce((sum, reason) => sum + (reason.value ?? 0), 0),
      -25,
      25,
    ),
  };
}

function viabilityFor(input: CandidateEvaluationInput): number {
  let value = CLAIM_VIABILITY[input.claimBand];
  if (input.viability.supportStanding === 'voluntary-pledge') value += 5;
  if (input.viability.supportStanding === 'voluntary-commitment') value += 8;
  if (input.viability.supportStanding === 'coerced-pledge') {
    value += input.voterId === 'ysabel' ? 2 : input.voterId === 'oswin' ? -2 : 0;
  }
  if (input.churchState === 'favorable') value += 3;
  if (input.churchState === 'endorsed') value += 7;
  if (input.viability.capitalControlled) value += 5;
  if (input.viability.majorVictoryRecent) value += 4;
  if (input.viability.majorDefeatRecent) value -= 5;
  if (input.viability.dispossessed) value -= 6;
  const multiplier = input.voterId === 'ysabel' ? 1.25 : input.voterId === 'mara' ? 0.6 : 1;
  return clamp(Math.round(value * multiplier), -20, 20);
}

function fearFor(input: CandidateEvaluationInput): number {
  if (input.voterId === 'greyfen') {
    throw new Error('Greyfen preference is player-controlled and must never be auto-evaluated.');
  }
  if (
    input.voterId === 'ysabel' &&
    input.knownThreatBand === 'serious' &&
    input.desireFlags['active-troop-protection']
  ) {
    return 4;
  }
  return FEAR[input.voterId][input.knownThreatBand];
}

export function evaluateCandidate(input: CandidateEvaluationInput): CandidateEvaluation {
  if (input.voterId === input.candidateId) {
    throw new Error(
      'Candidate self-votes are constitutional bindings, not preference evaluations.',
    );
  }
  const relationship = clamp(Math.round(input.relationshipValue / 5), -20, 20);
  const legitimacy = legitimacyFor(input);
  const desire = desireFor(input);
  const bargain = input.voterId === 'renard' ? 0 : BARGAIN_VALUES[input.bargainStage];
  const viability = viabilityFor(input);
  const fear = fearFor(input);
  const excluded = input.voterId === 'oswin' && input.churchState === 'condemned';
  const redLineReasons = input.redLines.map((id) => ({
    category: 'red-line' as const,
    id,
    value: null,
  }));
  const reasons: EvaluationReason[] = [
    ...redLineReasons,
    ...(input.bindingSupport === 'none'
      ? []
      : [
          {
            category: 'binding-support' as const,
            id: `binding-${input.bindingSupport}`,
            value: null,
          },
        ]),
    ...(input.proofState === 'not-required'
      ? []
      : [
          {
            category: 'proof-maturation' as const,
            id: `proof-${input.proofState}`,
            value: null,
          },
        ]),
    ...desire.reasons,
    { category: 'bargain', id: `bargain-${input.bargainStage}`, value: bargain },
    { category: 'legitimacy', id: 'authored-legitimacy', value: legitimacy },
    { category: 'viability', id: 'known-viability', value: viability },
    { category: 'fear', id: `known-threat-${input.knownThreatBand}`, value: fear },
    { category: 'relationship', id: 'directed-relationship', value: relationship },
  ];
  if (excluded) {
    reasons.unshift({ category: 'red-line', id: 'oswin-church-condemned', value: null });
  }
  const isExcluded = excluded || input.redLines.length > 0;
  return {
    candidateId: input.candidateId,
    components: {
      bargain,
      desireAndConduct: desire.value,
      fear,
      legitimacy,
      relationship,
      viability,
    },
    excluded: isExcluded,
    orderedReasons: reasons.sort((left, right) => {
      const categoryOrder = REASON_ORDER[left.category] - REASON_ORDER[right.category];
      if (categoryOrder !== 0) return categoryOrder;
      const magnitude = Math.abs(right.value ?? 0) - Math.abs(left.value ?? 0);
      return magnitude !== 0 ? magnitude : left.id.localeCompare(right.id);
    }),
    redLines: input.redLines,
    total: isExcluded
      ? null
      : relationship + legitimacy + viability + desire.value + bargain + fear,
    voterId: input.voterId,
  };
}

function comparison(
  left: CandidateEvaluation,
  right: CandidateEvaluation,
  declarations: ReadonlyMap<LordId, DeclarationPrecedence>,
): number {
  const total =
    (right.total ?? Number.NEGATIVE_INFINITY) - (left.total ?? Number.NEGATIVE_INFINITY);
  if (total !== 0) return total;
  const relationship = right.components.relationship - left.components.relationship;
  if (relationship !== 0) return relationship;
  const legitimacy = right.components.legitimacy - left.components.legitimacy;
  if (legitimacy !== 0) return legitimacy;
  const leftDeclaration = declarations.get(left.candidateId);
  const rightDeclaration = declarations.get(right.candidateId);
  const leftDay = leftDeclaration?.day ?? Number.POSITIVE_INFINITY;
  const rightDay = rightDeclaration?.day ?? Number.POSITIVE_INFINITY;
  if (leftDay !== rightDay) return leftDay - rightDay;
  const leftSequence = leftDeclaration?.sequenceId ?? Number.POSITIVE_INFINITY;
  const rightSequence = rightDeclaration?.sequenceId ?? Number.POSITIVE_INFINITY;
  if (leftSequence !== rightSequence) return leftSequence - rightSequence;
  return left.candidateId.localeCompare(right.candidateId);
}

export function choosePreference(
  evaluations: readonly CandidateEvaluation[],
  declarations: ReadonlyMap<LordId, DeclarationPrecedence>,
  currentLeaningCandidateId: LordId | null,
): PreferenceResult {
  const eligible = evaluations.filter(({ excluded, total }) => !excluded && total !== null);
  const exactBest = Math.max(...eligible.map(({ total }) => total ?? Number.NEGATIVE_INFINITY));
  const tiedBest = eligible.filter(({ total }) => total === exactBest);
  const retained = tiedBest.find(({ candidateId }) => candidateId === currentLeaningCandidateId);
  const ordered = [...eligible].sort((left, right) => comparison(left, right, declarations));
  if (retained) {
    ordered.splice(ordered.indexOf(retained), 1);
    ordered.unshift(retained);
  }
  const best = ordered[0];
  const second = ordered[1];
  if (!best) {
    return { bestCandidateId: null, decision: 'unalign', lead: null, orderedCandidates: [] };
  }
  const lead = second ? (best.total ?? 0) - (second.total ?? 0) : Number.POSITIVE_INFINITY;
  if (retained && tiedBest.length > 1 && (best.total ?? Number.NEGATIVE_INFINITY) >= 10) {
    return {
      bestCandidateId: best.candidateId,
      decision: 'retain',
      lead,
      orderedCandidates: ordered,
    };
  }
  if ((best.total ?? Number.NEGATIVE_INFINITY) >= 15 && lead >= 8) {
    return {
      bestCandidateId: best.candidateId,
      decision: 'lean',
      lead,
      orderedCandidates: ordered,
    };
  }
  if ((best.total ?? Number.NEGATIVE_INFINITY) < 10 || lead < 4) {
    return { bestCandidateId: null, decision: 'unalign', lead, orderedCandidates: ordered };
  }
  const current = eligible.find(({ candidateId }) => candidateId === currentLeaningCandidateId);
  if (current) {
    const retainedOrder = [
      current,
      ...ordered.filter(({ candidateId }) => candidateId !== current.candidateId),
    ];
    return {
      bestCandidateId: current.candidateId,
      decision: 'retain',
      lead,
      orderedCandidates: retainedOrder,
    };
  }
  return { bestCandidateId: null, decision: 'unalign', lead, orderedCandidates: ordered };
}

export function chooseCouncilVote(
  evaluations: readonly CandidateEvaluation[],
  fallbackFacts: readonly CouncilFallbackFact[],
): CouncilVoteChoice {
  if (evaluations.length === 0) throw new Error('Council evaluation requires a legal candidate.');
  const facts = new Map(fallbackFacts.map((fact) => [fact.candidateId, fact]));
  for (const evaluation of evaluations) {
    if (!facts.has(evaluation.candidateId)) {
      throw new Error(`Missing Council fallback facts for ${evaluation.candidateId}.`);
    }
  }
  const nonExcluded = evaluations.filter(({ excluded, total }) => !excluded && total !== null);
  if (nonExcluded.length > 0) {
    const declarations = new Map<LordId, DeclarationPrecedence>(
      fallbackFacts.map(({ candidateId, declarationSequenceId, declarationTime }) => [
        candidateId,
        { day: declarationTime, sequenceId: declarationSequenceId },
      ]),
    );
    const winner = [...nonExcluded].sort((left, right) => comparison(left, right, declarations))[0];
    if (!winner) throw new Error('Council evaluation lost its legal candidate.');
    return {
      candidateId: winner.candidateId,
      reasons: winner.orderedReasons,
      usedExcludedFinalistFallback: false,
    };
  }
  const winner = [...evaluations].sort((left, right) => {
    const leftFact = facts.get(left.candidateId);
    const rightFact = facts.get(right.candidateId);
    if (!leftFact || !rightFact) throw new Error('Council fallback facts became unavailable.');
    const violence =
      Number(leftFact.currentViolenceAgainstVoterSeat) -
      Number(rightFact.currentViolenceAgainstVoterSeat);
    if (violence !== 0) return violence;
    const relationship = right.components.relationship - left.components.relationship;
    if (relationship !== 0) return relationship;
    const claim = rightFact.exactClaim - leftFact.exactClaim;
    if (claim !== 0) return claim;
    const declarationTime = leftFact.declarationTime - rightFact.declarationTime;
    if (declarationTime !== 0) return declarationTime;
    const declarationSequence = leftFact.declarationSequenceId - rightFact.declarationSequenceId;
    return declarationSequence !== 0
      ? declarationSequence
      : left.candidateId.localeCompare(right.candidateId);
  })[0];
  if (!winner) throw new Error('Council fallback lost its forced finalist.');
  const winnerFact = facts.get(winner.candidateId);
  return {
    candidateId: winner.candidateId,
    reasons: [
      {
        category: 'red-line',
        id: winnerFact?.currentViolenceAgainstVoterSeat
          ? 'forced-choice-after-both-excluded'
          : 'forced-choice-no-current-seat-violence',
        value: null,
      },
      ...winner.orderedReasons,
    ],
    usedExcludedFinalistFallback: true,
  };
}
