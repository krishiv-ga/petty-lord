export const LORD_IDS = ['greyfen', 'edric', 'ysabel', 'renard', 'oswin', 'mara'] as const;
export const TERRITORY_IDS = [
  'greyfen',
  'northkeep',
  'westmarch',
  'eastvale',
  'abbeylands',
  'southmere',
  'capital',
] as const;
export const PHASE_IDS = ['stable', 'ailing', 'gravely-ill', 'deathbed'] as const;
export const SUPPORT_LEVEL_IDS = [
  'unaligned',
  'leaning',
  'pledged',
  'committed',
  'under-duress',
  'self',
] as const;
export const SUPPORT_BASIS_IDS = [
  'ideological',
  'legitimacy',
  'bargain',
  'opportunism',
  'protection',
  'coercion',
  'self',
] as const;
export const CHURCH_STATE_IDS = [
  'condemned',
  'skeptical',
  'neutral',
  'favorable',
  'endorsed',
] as const;
export const CLAIM_BAND_IDS = [
  'none',
  'dubious',
  'plausible',
  'strong',
  'excellent',
  'overwhelming',
] as const;
export const OFFICE_IDS = ['marshal', 'chancellor'] as const;
export const POLICY_IDS = [
  'greyfen-charter',
  'church-immunities',
  'denounce-central-rule',
  'provincial-liberties',
] as const;
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
export const OPENING_IDS = [
  'fractured-court',
  'border-crisis',
  'holy-anxiety',
  'favorite-ascendant',
] as const;
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
export const ENDING_LABEL_IDS = [
  'crowned-by-acclamation',
  'crowned-by-council',
  'crowned-by-church',
  'master-of-capital',
  'rightful-heir',
  'crowned-by-sword',
] as const;
export const CHRONICLE_CATEGORY_IDS = [
  'succession',
  'war',
  'court',
  'intelligence',
  'economy',
  'church',
  'system',
] as const;
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

export type LordId = (typeof LORD_IDS)[number];
export type TerritoryId = (typeof TERRITORY_IDS)[number];
export type PhaseId = (typeof PHASE_IDS)[number];
export type SupportLevelId = (typeof SUPPORT_LEVEL_IDS)[number];
export type SupportBasisId = (typeof SUPPORT_BASIS_IDS)[number];
export type ChurchStateId = (typeof CHURCH_STATE_IDS)[number];
export type ClaimBandId = (typeof CLAIM_BAND_IDS)[number];
export type OfficeId = (typeof OFFICE_IDS)[number];
export type PolicyId = (typeof POLICY_IDS)[number];
export type BargainId = (typeof BARGAIN_IDS)[number];
export type CollateralTypeId = (typeof COLLATERAL_TYPE_IDS)[number];
export type BaseActionFamilyId = (typeof BASE_ACTION_FAMILY_IDS)[number];
export type ActionId = (typeof ACTION_IDS)[number];
export type OpeningId = (typeof OPENING_IDS)[number];
export type SecretId = (typeof SECRET_IDS)[number];
export type EventId = (typeof EVENT_IDS)[number];
export type ConditionId = (typeof CONDITION_IDS)[number];
export type ShockId = (typeof SHOCK_IDS)[number];
export type EndingLabelId = (typeof ENDING_LABEL_IDS)[number];
export type ChronicleCategoryId = (typeof CHRONICLE_CATEGORY_IDS)[number];
export type EffectId = (typeof EFFECT_IDS)[number];
export type ProofId = (typeof PROOF_IDS)[number];
export type RedLineId = (typeof RED_LINE_IDS)[number];
