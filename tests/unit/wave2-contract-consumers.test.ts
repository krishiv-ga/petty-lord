import { canonicalGameContent } from '@contracts/content';
import type { ActionId, LordId, TerritoryId } from '@contracts/ids';
import { ACTION_IDS, LORD_IDS, TERRITORY_IDS } from '@contracts/ids';
import { projectFoundationContent } from '@contracts/projection';
import { createKernelRegistry } from '@contracts/simulation';
import type { FoundationGameState } from '@contracts/state';
import { createFoundationGameState } from '@contracts/state';
import { describe, expect, it } from 'vitest';
import { knowledgeModule } from './wave2-consumers/knowledge';
import { politicsModule } from './wave2-consumers/politics';
import { timeModule } from './wave2-consumers/time';
import { warModule } from './wave2-consumers/war';

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
    expect(
      createKernelRegistry([timeModule, politicsModule, warModule, knowledgeModule])
        .scheduledResolvers.size,
    ).toBe(4);
    expect(acceptsFoundationState(state)).toBe(canonicalGameContent.contentHash);
    expect(acceptsFrozenIds(ACTION_IDS[0], LORD_IDS[0], TERRITORY_IDS[0])).toBe(
      'send-gift:greyfen:greyfen',
    );
    expect(projectFoundationContent(canonicalGameContent).lords).toHaveLength(6);
  });
});
