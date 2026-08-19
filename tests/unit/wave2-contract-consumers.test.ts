import type {
  ActionId,
  DomainModule,
  FoundationDomainExtensions,
  FoundationGameState,
  LordId,
  TerritoryId,
} from '@contracts/index';
import {
  ACTION_IDS,
  canonicalGameContent,
  createFoundationGameState,
  createKernelRegistry,
  LORD_IDS,
  projectFoundationContent,
  TERRITORY_IDS,
} from '@contracts/index';
import { describe, expect, it } from 'vitest';

const representativeWave2Module: DomainModule<FoundationDomainExtensions> = {
  id: 'representative-wave2-consumer',
  scheduledResolvers: {},
};

function acceptsFrozenIds(action: ActionId, lord: LordId, territory: TerritoryId): string {
  return `${action}:${lord}:${territory}`;
}

function acceptsFoundationState(state: FoundationGameState): string {
  return state.compatibility.contentHash;
}

describe('representative Wave 2 consumers', () => {
  it('compile against the frozen imports without editing shared modules', () => {
    const state = createFoundationGameState({
      content: canonicalGameContent,
      seed: 'wave2-consumer',
    });
    expect(createKernelRegistry([representativeWave2Module]).scheduledResolvers.size).toBe(0);
    expect(acceptsFoundationState(state)).toBe(canonicalGameContent.contentHash);
    expect(acceptsFrozenIds(ACTION_IDS[0], LORD_IDS[0], TERRITORY_IDS[0])).toBe(
      'send-gift:greyfen:greyfen',
    );
    expect(projectFoundationContent(canonicalGameContent).lords).toHaveLength(6);
  });
});
