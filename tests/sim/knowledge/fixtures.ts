import type { LordId } from '../../../src/contracts/ids';
import type { PublicRealmSnapshot } from '../../../src/sim/systems/knowledge/types';

const facts = (
  armyBand: PublicRealmSnapshot['lords'][LordId]['armyBand'],
  claim: number,
): PublicRealmSnapshot['lords'][LordId] => ({
  armyBand,
  candidacy: 'not-declared',
  church: 'neutral',
  claim,
  support: { basis: 'unknown', candidateId: null, level: 'unaligned' },
});

export const PUBLIC_REALM_FIXTURE: PublicRealmSnapshot = {
  capital: { controllerId: 'royal', garrisonBand: 'formidable' },
  lords: {
    greyfen: facts('strong', 10),
    edric: facts('formidable', 18),
    ysabel: facts('modest', 24),
    renard: { ...facts('strong', 72), candidacy: 'declared' },
    oswin: facts('modest', 16),
    mara: facts('strong', 12),
  },
  occupations: [],
  publicAgreements: ['renard-court-progress'],
  publicOffensiveWarCounts: {
    greyfen: 0,
    edric: 0,
    ysabel: 0,
    renard: 0,
    oswin: 0,
    mara: 0,
  },
  publicWars: [],
};
