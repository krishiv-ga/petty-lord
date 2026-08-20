export { timeEffect } from './effects';
export { createWp020DomainModule } from './module';
export { createTimeResolvers } from './resolvers';
export {
  createWp020GameState,
  importWp020GameState,
  TIME_EVENT_KINDS,
  validateWp020System,
} from './state';
export type {
  ActionCostProjection,
  ActionIntent,
  ActionPreview,
  ActionUseRecord,
  ConsequenceSeverity,
  KingHealthState,
  LordResourceState,
  OrderPayload,
  OrderRecord,
  OrderStatus,
  PrognosisId,
  ReactionRecord,
  ResourceDeltaRecord,
  ResourceKind,
  TerritoryEconomyState,
  TimedCondition,
  Wp020GameState,
  Wp020SystemShape,
  Wp020SystemState,
} from './types';
export {
  CRISIS_DAYS,
  FRACTION_SCALE,
  getWp020,
  HOURS_PER_DAY,
  PLAYER_ORDER_SLOTS,
  setWp020,
} from './types';
