import type { DomainMessageKind, FoundationEffect } from '../../../contracts/domains';
import type { JsonObject } from '../../state';

export function timeEffect(
  kind: DomainMessageKind<'time'>,
  payload: JsonObject,
): FoundationEffect<'time'> {
  return { domain: 'time', kind, payload, type: 'effect' };
}
