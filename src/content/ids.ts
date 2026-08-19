import { z } from 'zod';

export const idSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'IDs must use lowercase kebab-case');

export const textKeySchema = z
  .string()
  .min(3)
  .regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/, 'Text keys must use lowercase dot/kebab segments');

export const LORD_IDS = ['greyfen', 'edric', 'ysabel', 'renard', 'oswin', 'mara'] as const;
export const lordIdSchema = z.enum(LORD_IDS);
export type LordId = z.infer<typeof lordIdSchema>;

export const TERRITORY_IDS = [
  'greyfen',
  'northkeep',
  'westmarch',
  'eastvale',
  'abbeylands',
  'southmere',
  'capital',
] as const;
export const territoryIdSchema = z.enum(TERRITORY_IDS);
export type TerritoryId = z.infer<typeof territoryIdSchema>;

export const PHASE_IDS = ['stable', 'ailing', 'gravely-ill', 'deathbed'] as const;
export const phaseIdSchema = z.enum(PHASE_IDS);
export type PhaseId = z.infer<typeof phaseIdSchema>;

export const SUPPORT_LEVEL_IDS = [
  'unaligned',
  'leaning',
  'pledged',
  'committed',
  'under-duress',
  'self',
] as const;
export const supportLevelIdSchema = z.enum(SUPPORT_LEVEL_IDS);

export const SUPPORT_BASIS_IDS = [
  'ideological',
  'legitimacy',
  'bargain',
  'opportunism',
  'protection',
  'coercion',
  'self',
] as const;
export const supportBasisIdSchema = z.enum(SUPPORT_BASIS_IDS);

export const CHURCH_STATE_IDS = [
  'condemned',
  'skeptical',
  'neutral',
  'favorable',
  'endorsed',
] as const;
export const churchStateIdSchema = z.enum(CHURCH_STATE_IDS);

export const CLAIM_BAND_IDS = [
  'none',
  'dubious',
  'plausible',
  'strong',
  'excellent',
  'overwhelming',
] as const;
export const claimBandIdSchema = z.enum(CLAIM_BAND_IDS);

export const OFFICE_IDS = ['marshal', 'chancellor'] as const;
export const officeIdSchema = z.enum(OFFICE_IDS);

export const POLICY_IDS = [
  'greyfen-charter',
  'church-immunities',
  'denounce-central-rule',
  'provincial-liberties',
] as const;
export const policyIdSchema = z.enum(POLICY_IDS);

export const BARGAIN_IDS = [
  'edric-marshal',
  'edric-border-aid',
  'edric-joint-campaign',
  'ysabel-escrow',
  'ysabel-chancellorship',
  'ysabel-protection',
  'oswin-abbey-endowment',
  'oswin-church-immunities',
  'oswin-renunciation',
  'mara-greyfen-charter',
  'mara-denounce-central-rule',
  'mara-provincial-aid',
] as const;
export const bargainIdSchema = z.enum(BARGAIN_IDS);

export const COLLATERAL_TYPE_IDS = [
  'gold-escrow',
  'gold-payment',
  'troop-lock',
  'office-reservation',
  'policy-concession',
  'completed-action',
  'shared-risk',
  'public-renunciation',
] as const;
export const collateralTypeIdSchema = z.enum(COLLATERAL_TYPE_IDS);

export const BASE_ACTION_FAMILY_IDS = [
  'gift',
  'offer-bargain',
  'request-declaration',
  'threaten',
  'spy',
  'build-claim',
  'expose-secret',
  'invade',
  'raise-taxes',
  'hold-court',
  'patronize-church',
] as const;
export const baseActionFamilyIdSchema = z.enum(BASE_ACTION_FAMILY_IDS);

export const ACTION_IDS = [
  'send-gift',
  'offer-bargain',
  'request-declaration',
  'threaten',
  'watch-court',
  'find-dirt',
  'research-lineage',
  'forge-royal-descent',
  'expose-secret',
  'invade-territory',
  'raise-taxes',
  'hold-court',
  'patronize-church',
  'declare-candidacy',
  'march-on-capital',
  'break-agreement',
  'withdraw-occupation',
  'confess-and-seek-penance',
  'cast-greyfens-vote',
] as const;
export const actionIdSchema = z.enum(ACTION_IDS);
export type ActionId = z.infer<typeof actionIdSchema>;

export const OPENING_IDS = [
  'fractured-court',
  'border-crisis',
  'holy-anxiety',
  'favorite-ascendant',
] as const;
export const openingIdSchema = z.enum(OPENING_IDS);

export const SECRET_IDS = [
  'renard-questioned-paternity',
  'renard-foreign-concession',
  'renard-bought-royal-testament',
  'edric-border-massacre',
  'ysabel-tax-embezzlement',
  'oswin-simony',
  'mara-smuggler-compact',
  'player-forgery-evidence',
] as const;
export const secretIdSchema = z.enum(SECRET_IDS);

export const EVENT_IDS = [
  'e01-prognosis',
  'e02-king-takes-to-bed',
  'e03-last-council',
  'e04-deathbed',
  'e05-failed-harvest',
  'e06-northern-raiders',
  'e07-forgotten-genealogy',
  'e08-saints-hand',
  'e09-unpaid-capital-guard',
  'e10-renards-progress',
  'e11-provincial-liberties',
  'e12-hawks-tournament',
  'e13-merchant-syndicate-loan',
  'e14-rumor-of-false-blood',
  'e15-dispossessed-retinue',
  'e16-funeral-preparations',
] as const;
export const eventIdSchema = z.enum(EVENT_IDS);

export const CONDITION_IDS = [
  'tax-strain',
  'unrest',
  'occupied',
  'disgraced',
  'greyfen-charter',
  'provincial-liberties',
  'defaulted-debtor',
  'laughable-pretender',
  'oathbreaker',
  'usurper',
  'royally-sanctioned',
  'broke-kings-peace',
  'guard-favor',
  'ysabel-access-debt',
  'compromised-sovereignty',
  'forgery-evidence',
  'church-patronage',
  'oswin-simony',
  'debt-leverage',
] as const;
export const conditionIdSchema = z.enum(CONDITION_IDS);

export const SHOCK_IDS = [
  'red-line-breach',
  'bargain-breach',
  'candidate-withdrawal',
  'coercive-leverage-lost',
  'seat-occupied',
  'capital-lost',
  'major-defeat',
  'all-other-support-lost',
  'forgery-exposed',
  'forgery-exposed-other-basis',
  'renard-paternity-oswin',
  'renard-paternity-ysabel',
  'renard-foreign-concession-edric',
  'renard-testament-voluntary',
  'renard-testament-oswin',
  'edric-massacre-pledges',
  'ysabel-embezzlement-opportunism',
  'church-condemnation',
  'public-oathbreaker',
] as const;
export const shockIdSchema = z.enum(SHOCK_IDS);

export const ENDING_LABEL_IDS = [
  'crowned-by-acclamation',
  'crowned-by-council',
  'crowned-by-church',
  'master-of-capital',
  'rightful-heir',
  'crowned-by-sword',
] as const;
export const endingLabelIdSchema = z.enum(ENDING_LABEL_IDS);

export const CHRONICLE_CATEGORY_IDS = [
  'succession',
  'war',
  'court',
  'intelligence',
  'economy',
  'church',
  'system',
] as const;
export const chronicleCategoryIdSchema = z.enum(CHRONICLE_CATEGORY_IDS);

export const EFFECT_IDS = [
  'adjust-gold',
  'set-gold',
  'adjust-influence',
  'adjust-prestige',
  'adjust-claim',
  'adjust-relationship',
  'adjust-church-conduct',
  'adjust-levies',
  'lock-gold',
  'lock-troops',
  'reserve-office',
  'enact-policy',
  'apply-condition',
  'remove-condition',
  'set-support-shock',
  'set-church-state',
  'remove-favorite',
  'disable-trait',
  'reveal-intelligence',
  'reveal-secret',
  'create-secret',
  'remove-secret',
  'create-temporary-troops',
  'schedule-decision',
  'set-capital-garrison-modifier',
  'set-intent-weight',
  'set-bargain-progress',
  'declare-candidate',
  'unlock-phase-rules',
  'none',
] as const;
export const effectIdSchema = z.enum(EFFECT_IDS);

export const PROOF_IDS = [
  'edric-major-victory',
  'edric-military-peer',
  'edric-border-aid',
  'edric-capital-control',
  'ysabel-public-support',
  'ysabel-claim-and-church',
  'ysabel-capital-control',
  'ysabel-rival-defeat',
  'ysabel-escrow',
  'ysabel-protection',
  'oswin-lawful-legitimacy',
  'mara-charter',
  'mara-provincial-aid',
  'mara-liberation',
] as const;
export const proofIdSchema = z.enum(PROOF_IDS);

export const RED_LINE_IDS = [
  'edric-broke-promised-aid',
  'edric-abandoned-shared-war',
  'edric-northkeep-occupied',
  'edric-destruction-program',
  'ysabel-eastvale-occupied',
  'ysabel-defaulted-debtor',
  'ysabel-network-destroyed',
  'ysabel-bargain-collapse',
  'oswin-abbeylands-attacked',
  'oswin-unconfessed-forgery',
  'oswin-church-wealth-seized',
  'oswin-sacrilegious-agreement',
  'oswin-public-coercion',
  'mara-westmarch-occupied',
  'mara-charter-revoked',
  'mara-centralizing-program',
  'mara-provincial-aid-betrayed',
] as const;
export const redLineIdSchema = z.enum(RED_LINE_IDS);
