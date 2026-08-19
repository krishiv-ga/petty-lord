import { actions, bargains } from './actions';
import { assets } from './assets';
import { endings, events, secrets } from './narrative';
import { candidateEvaluations, catalogs, churchStates, constants, shocks } from './rules';
import { sourceMappings } from './source-mappings';
import { buildTextCatalog } from './text';
import { lords, openings, phases, proofs, redLines, relationships, territories } from './world';

const authoredDefinitions = {
  phases,
  lords,
  territories,
  relationships,
  actions,
  bargains,
  proofs,
  redLines,
  candidateEvaluations,
  secrets,
  openings,
  events,
  shocks,
  churchStates,
  endings,
  assets,
  catalogs,
  constants,
  sourceMappings,
};

export const canonicalContentPackInput = {
  schemaVersion: 1,
  idConvention: 'lowercase-kebab-case',
  ...authoredDefinitions,
  text: buildTextCatalog(authoredDefinitions),
} as const;
