import { canonicalGameContent } from '../contracts/content';
import { projectFoundationContent } from '../contracts/projection';
import { createFoundationGameState, FOUNDATION_BUILD_VERSION } from '../contracts/state';

const state = createFoundationGameState({
  content: canonicalGameContent,
  seed: 'foundation-smoke',
});
const content = projectFoundationContent(canonicalGameContent);

export const foundationSmokeProjection = Object.freeze({
  buildVersion: FOUNDATION_BUILD_VERSION,
  contentHash: state.compatibility.contentHash,
  lordNames: Object.freeze(content.lords.map((lord) => lord.name)),
  territoryNames: Object.freeze(content.territories.map((territory) => territory.name)),
});
