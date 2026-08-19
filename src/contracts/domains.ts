import type { DomainModule, DomainTransition, ScheduledResolver } from '../sim/kernel';
import type { DomainExtensions, JsonObject, JsonValue } from '../sim/state';
import type { SupportBasisId, SupportLevelId } from './ids';

export const WAVE2_DOMAIN_IDS = ['time', 'politics', 'war', 'knowledge'] as const;
export type Wave2DomainId = (typeof WAVE2_DOMAIN_IDS)[number];
export type DomainMessageKind<D extends Wave2DomainId = Wave2DomainId> = `${D}.${string}`;
export interface FoundationSystemNamespaces {
  readonly knowledge: JsonValue;
  readonly politics: JsonValue;
  readonly time: JsonValue;
  readonly war: JsonValue;
}
export type FoundationEffect<D extends Wave2DomainId = Wave2DomainId> = {
  readonly domain: D;
  readonly kind: DomainMessageKind<D>;
  readonly payload: JsonObject;
  readonly type: 'effect';
};
export type FoundationQuery<D extends Wave2DomainId = Wave2DomainId> = {
  readonly domain: D;
  readonly kind: DomainMessageKind<D>;
  readonly payload: JsonObject;
  readonly type: 'query';
};
export type FoundationQueryResult<D extends Wave2DomainId = Wave2DomainId> = {
  readonly domain: D;
  readonly kind: DomainMessageKind<D>;
  readonly payload: JsonObject;
  readonly type: 'query-result';
};
export type FoundationDomainTransition<D extends Wave2DomainId, E extends DomainExtensions> = Omit<
  DomainTransition<E>,
  'effects'
> & { readonly effects: FoundationEffect<D>[] };
export type FoundationScheduledResolver<D extends Wave2DomainId, E extends DomainExtensions> = (
  context: Parameters<ScheduledResolver<E>>[0],
) => FoundationDomainTransition<D, E>;
export type Wave2DomainModule<D extends Wave2DomainId, E extends DomainExtensions> = Omit<
  DomainModule<E>,
  'id' | 'scheduledResolvers'
> & {
  readonly id: D;
  readonly scheduledResolvers: Record<DomainMessageKind<D>, FoundationScheduledResolver<D, E>>;
};
export function unchangedTransition<D extends Wave2DomainId, E extends DomainExtensions>(
  state: Parameters<ScheduledResolver<E>>[0]['state'],
): FoundationDomainTransition<D, E> {
  return { effects: [], state };
}

export type AuthoritativeSupportLevelId = Exclude<SupportLevelId, 'under-duress'>;
export type SupportRecord = {
  readonly basis: SupportBasisId;
  readonly duress?: { readonly leverageId: string; readonly visibility: 'private' | 'public' };
  readonly level: AuthoritativeSupportLevelId;
};
export function isValidSupportRecord(record: SupportRecord): boolean {
  return record.duress === undefined || (record.level === 'pledged' && record.basis === 'coercion');
}
