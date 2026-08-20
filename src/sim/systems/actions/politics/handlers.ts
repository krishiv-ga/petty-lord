import type { BargainId, LordId, PhaseId, SecretId } from '@contracts/ids';
import { bargainTarget } from '../../politics/bargains';
import type { PledgeStartAssessment } from '../../support';

export type PoliticalActionIntent =
  | 'confirm'
  | 'destructive'
  | 'historical-choice'
  | 'hostile'
  | 'restorative';

type LeverageAssessmentBase = {
  readonly leverageId: string;
  readonly valid: boolean;
};

export type LeverageAssessment = LeverageAssessmentBase &
  (
    | { readonly source: 'military' | 'occupation'; readonly visibility: 'public' }
    | { readonly source: 'secret'; readonly visibility: 'private' }
  );

export type DiscoveredSecretPayload = {
  readonly discovered: boolean;
  readonly exposed: boolean;
  readonly secretId: SecretId;
  readonly targetId: LordId;
};

type BaseRequest = { readonly actorId: LordId; readonly id: string };

export type PoliticalActionRequest =
  | (BaseRequest & {
      readonly action: 'offer-bargain';
      readonly bargainId: BargainId;
      readonly targetId: LordId;
    })
  | (BaseRequest & {
      readonly action: 'request-declaration';
      readonly startAssessment: PledgeStartAssessment;
      readonly targetId: LordId;
    })
  | (BaseRequest & {
      readonly action: 'threaten';
      readonly leverage: LeverageAssessment;
      readonly targetId: LordId;
    })
  | (BaseRequest & { readonly action: 'research-lineage' | 'forge-royal-descent' })
  | (BaseRequest & { readonly action: 'patronize-church' })
  | (BaseRequest & { readonly action: 'expose-secret'; readonly secret: DiscoveredSecretPayload })
  | (BaseRequest & { readonly action: 'declare-candidacy' })
  | (BaseRequest & { readonly action: 'break-agreement'; readonly agreementId: string })
  | (BaseRequest & { readonly action: 'confess-and-seek-penance' })
  | (BaseRequest & { readonly action: 'cast-greyfens-vote'; readonly candidateId: LordId });

export type PoliticalActionContext = {
  readonly activeFraudCondemnation: boolean;
  readonly availableGold: number;
  readonly availableInfluence: number;
  readonly candidateDeclared: boolean;
  readonly claimProjectUsage: { readonly forgeUsed: boolean; readonly researchUsed: boolean };
  readonly currentDay: number;
  readonly eligibleVoteCandidateIds: readonly LordId[];
  readonly lastPatronizeCompletionDay: number | null;
  readonly phase: PhaseId;
  readonly playerAlreadyLost: boolean;
  readonly threatHistory: readonly {
    readonly leverageId: string;
    readonly phase: PhaseId;
    readonly targetId: LordId;
  }[];
};

export type PoliticalActionEffect =
  | { readonly amount: number; readonly kind: 'charge-gold' | 'charge-influence' }
  | {
      readonly kind: 'open-bargain-resolution';
      readonly bargainId: BargainId;
      readonly targetId: LordId;
    }
  | {
      readonly kind: 'request-pledge-resolution';
      readonly startAssessment: PledgeStartAssessment;
      readonly targetId: LordId;
    }
  | {
      readonly kind: 'threaten-resolution';
      readonly leverage: LeverageAssessment;
      readonly targetId: LordId;
    }
  | { readonly kind: 'complete-claim-project'; readonly project: 'forge' | 'research' }
  | { readonly kind: 'complete-patronage' }
  | { readonly kind: 'expose-secret'; readonly secret: DiscoveredSecretPayload }
  | { readonly kind: 'complete-declaration' }
  | { readonly agreementId: string; readonly kind: 'break-agreement' }
  | { readonly kind: 'complete-penance' }
  | {
      readonly candidateId: LordId;
      readonly kind: 'record-greyfen-vote';
      readonly playerRemainsLost: true;
    };

export type PoliticalActionPlan = {
  readonly action: PoliticalActionRequest['action'];
  readonly completesAtDay: number;
  readonly effectsAtResolution: readonly PoliticalActionEffect[];
  readonly effectsAtStart: readonly PoliticalActionEffect[];
  readonly id: string;
  readonly intent: PoliticalActionIntent;
  readonly ok: boolean;
  readonly reason: string;
  readonly revalidateAtResolution: boolean;
};

const duration = (ordinary: number, phase: PhaseId, shortInDeathbed: boolean) =>
  phase === 'deathbed' && shortInDeathbed ? Math.max(1, ordinary - 1) : ordinary;

const failed = (
  request: PoliticalActionRequest,
  context: PoliticalActionContext,
  reason: string,
): PoliticalActionPlan => ({
  action: request.action,
  completesAtDay: context.currentDay,
  effectsAtResolution: [],
  effectsAtStart: [],
  id: request.id,
  intent: intentForPoliticalAction(request.action),
  ok: false,
  reason,
  revalidateAtResolution: false,
});

export function intentForPoliticalAction(
  action: PoliticalActionRequest['action'],
): PoliticalActionIntent {
  if (action === 'break-agreement') return 'destructive';
  if (action === 'threaten') return 'hostile';
  if (action === 'confess-and-seek-penance') return 'restorative';
  if (action === 'cast-greyfens-vote') return 'historical-choice';
  return 'confirm';
}

export function planPoliticalAction(
  request: PoliticalActionRequest,
  context: PoliticalActionContext,
): PoliticalActionPlan {
  const plan = (
    days: number,
    effectsAtStart: readonly PoliticalActionEffect[],
    effectsAtResolution: readonly PoliticalActionEffect[],
    revalidateAtResolution = true,
  ): PoliticalActionPlan => ({
    action: request.action,
    completesAtDay: context.currentDay + days,
    effectsAtResolution,
    effectsAtStart,
    id: request.id,
    intent: intentForPoliticalAction(request.action),
    ok: true,
    reason: 'scheduled',
    revalidateAtResolution,
  });

  switch (request.action) {
    case 'offer-bargain':
      if (context.phase === 'stable') return failed(request, context, 'public-bargains-locked');
      if (!context.candidateDeclared) return failed(request, context, 'candidate-not-declared');
      if (bargainTarget(request.bargainId) !== request.targetId) {
        return failed(request, context, 'bargain-target-mismatch');
      }
      if (context.availableInfluence < 8) return failed(request, context, 'insufficient-influence');
      return plan(
        duration(2, context.phase, true),
        [{ amount: 8, kind: 'charge-influence' }],
        [
          {
            bargainId: request.bargainId,
            kind: 'open-bargain-resolution',
            targetId: request.targetId,
          },
        ],
      );
    case 'request-declaration':
      if (context.phase === 'stable') return failed(request, context, 'public-pledges-locked');
      if (!context.candidateDeclared) return failed(request, context, 'candidate-not-declared');
      if (
        request.startAssessment.candidateId !== request.actorId ||
        request.startAssessment.voterId !== request.targetId ||
        request.startAssessment.assessedAtDay !== context.currentDay
      ) {
        return failed(request, context, 'invalid-pledge-start-assessment');
      }
      if (context.availableInfluence < 8) return failed(request, context, 'insufficient-influence');
      return plan(
        duration(2, context.phase, true),
        [{ amount: 8, kind: 'charge-influence' }],
        [
          {
            kind: 'request-pledge-resolution',
            startAssessment: {
              ...request.startAssessment,
              proofIds: [...request.startAssessment.proofIds],
            },
            targetId: request.targetId,
          },
        ],
      );
    case 'threaten':
      if (context.phase === 'stable') return failed(request, context, 'public-pledges-locked');
      if (!context.candidateDeclared) return failed(request, context, 'candidate-not-declared');
      if (!request.leverage.valid) return failed(request, context, 'leverage-invalid-at-start');
      if (
        context.threatHistory.some(
          ({ leverageId, phase, targetId }) =>
            targetId === request.targetId &&
            phase === context.phase &&
            leverageId === request.leverage.leverageId,
        )
      ) {
        return failed(request, context, 'threat-target-already-attempted');
      }
      if (context.availableInfluence < 12)
        return failed(request, context, 'insufficient-influence');
      return plan(
        duration(2, context.phase, true),
        [{ amount: 12, kind: 'charge-influence' }],
        [{ kind: 'threaten-resolution', leverage: request.leverage, targetId: request.targetId }],
      );
    case 'research-lineage':
    case 'forge-royal-descent': {
      const forge = request.action === 'forge-royal-descent';
      if (context.phase === 'deathbed') return failed(request, context, 'long-preparations-locked');
      if (forge ? context.claimProjectUsage.forgeUsed : context.claimProjectUsage.researchUsed) {
        return failed(request, context, 'claim-project-already-used');
      }
      const gold = forge ? 50 : 35;
      const influence = forge ? 25 : 12;
      if (context.availableGold < gold) return failed(request, context, 'insufficient-gold');
      if (context.availableInfluence < influence)
        return failed(request, context, 'insufficient-influence');
      return plan(
        forge ? 8 : 6,
        [
          { amount: gold, kind: 'charge-gold' },
          { amount: influence, kind: 'charge-influence' },
        ],
        [{ kind: 'complete-claim-project', project: forge ? 'forge' : 'research' }],
      );
    }
    case 'patronize-church':
      if (
        context.lastPatronizeCompletionDay !== null &&
        context.currentDay - context.lastPatronizeCompletionDay < 21
      ) {
        return failed(request, context, 'patronage-cooldown');
      }
      if (context.availableGold < 50) return failed(request, context, 'insufficient-gold');
      return plan(
        duration(4, context.phase, true),
        [{ amount: 50, kind: 'charge-gold' }],
        [{ kind: 'complete-patronage' }],
      );
    case 'expose-secret':
      if (!request.secret.discovered || request.secret.exposed) {
        return failed(request, context, 'secret-not-exposable');
      }
      if (context.availableInfluence < 10)
        return failed(request, context, 'insufficient-influence');
      return plan(
        duration(2, context.phase, true),
        [{ amount: 10, kind: 'charge-influence' }],
        [{ kind: 'expose-secret', secret: request.secret }],
      );
    case 'declare-candidacy':
      if (context.phase === 'stable')
        return failed(request, context, 'candidacy-locked-until-ailing');
      if (context.candidateDeclared) return failed(request, context, 'already-declared');
      if (context.availableInfluence < 15)
        return failed(request, context, 'insufficient-influence');
      return plan(
        1,
        [{ amount: 15, kind: 'charge-influence' }],
        [{ kind: 'complete-declaration' }],
      );
    case 'break-agreement':
      return plan(0, [], [{ agreementId: request.agreementId, kind: 'break-agreement' }], false);
    case 'confess-and-seek-penance':
      if (!context.activeFraudCondemnation)
        return failed(request, context, 'no-fraud-condemnation');
      if (context.availableGold < 40) return failed(request, context, 'insufficient-gold');
      if (context.availableInfluence < 10)
        return failed(request, context, 'insufficient-influence');
      return plan(
        3,
        [
          { amount: 40, kind: 'charge-gold' },
          { amount: 10, kind: 'charge-influence' },
        ],
        [{ kind: 'complete-penance' }],
      );
    case 'cast-greyfens-vote':
      if (request.actorId !== 'greyfen' || !context.playerAlreadyLost) {
        return failed(request, context, 'greyfen-vote-only-after-player-loss');
      }
      if (!context.eligibleVoteCandidateIds.includes(request.candidateId)) {
        return failed(request, context, 'candidate-not-eligible-for-historical-vote');
      }
      return plan(
        0,
        [],
        [
          {
            candidateId: request.candidateId,
            kind: 'record-greyfen-vote',
            playerRemainsLost: true,
          },
        ],
        false,
      );
  }
}

export const POLITICAL_ACTION_HANDLERS = Object.freeze({ plan: planPoliticalAction });
