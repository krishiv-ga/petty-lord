import { z } from 'zod';
import {
  ACTION_IDS,
  BARGAIN_IDS,
  BASE_ACTION_FAMILY_IDS,
  CHRONICLE_CATEGORY_IDS,
  CHURCH_STATE_IDS,
  CLAIM_BAND_IDS,
  COLLATERAL_TYPE_IDS,
  CONDITION_IDS,
  EFFECT_IDS,
  ENDING_LABEL_IDS,
  EVENT_IDS,
  LORD_IDS,
  OFFICE_IDS,
  OPENING_IDS,
  PHASE_IDS,
  POLICY_IDS,
  PROOF_IDS,
  RED_LINE_IDS,
  SECRET_IDS,
  SHOCK_IDS,
  SUPPORT_BASIS_IDS,
  SUPPORT_LEVEL_IDS,
  TERRITORY_IDS,
} from '../contracts/ids';

export * from '../contracts/ids';
export const idSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'IDs must use lowercase kebab-case');
export const textKeySchema = z
  .string()
  .min(3)
  .regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/, 'Text keys must use lowercase dot/kebab segments');
export const lordIdSchema = z.enum(LORD_IDS);
export const territoryIdSchema = z.enum(TERRITORY_IDS);
export const phaseIdSchema = z.enum(PHASE_IDS);
export const supportLevelIdSchema = z.enum(SUPPORT_LEVEL_IDS);
export const supportBasisIdSchema = z.enum(SUPPORT_BASIS_IDS);
export const churchStateIdSchema = z.enum(CHURCH_STATE_IDS);
export const claimBandIdSchema = z.enum(CLAIM_BAND_IDS);
export const officeIdSchema = z.enum(OFFICE_IDS);
export const policyIdSchema = z.enum(POLICY_IDS);
export const bargainIdSchema = z.enum(BARGAIN_IDS);
export const collateralTypeIdSchema = z.enum(COLLATERAL_TYPE_IDS);
export const baseActionFamilyIdSchema = z.enum(BASE_ACTION_FAMILY_IDS);
export const actionIdSchema = z.enum(ACTION_IDS);
export const openingIdSchema = z.enum(OPENING_IDS);
export const secretIdSchema = z.enum(SECRET_IDS);
export const eventIdSchema = z.enum(EVENT_IDS);
export const conditionIdSchema = z.enum(CONDITION_IDS);
export const shockIdSchema = z.enum(SHOCK_IDS);
export const endingLabelIdSchema = z.enum(ENDING_LABEL_IDS);
export const chronicleCategoryIdSchema = z.enum(CHRONICLE_CATEGORY_IDS);
export const effectIdSchema = z.enum(EFFECT_IDS);
export const proofIdSchema = z.enum(PROOF_IDS);
export const redLineIdSchema = z.enum(RED_LINE_IDS);
