import type { GameContent } from './content';
import type { LordId, TerritoryId } from './ids';

export interface LordIdentityProjection {
  readonly epithet: string;
  readonly id: LordId;
  readonly name: string;
  readonly title: string;
}

export interface TerritoryIdentityProjection {
  readonly id: TerritoryId;
  readonly name: string;
}

export interface FoundationContentProjection {
  readonly contentHash: string;
  readonly lords: readonly LordIdentityProjection[];
  readonly territories: readonly TerritoryIdentityProjection[];
}

export function projectFoundationContent(content: GameContent): FoundationContentProjection {
  const text = new Map(content.text.map((entry) => [entry.key, entry.defaultText]));
  const display = (key: string): string => text.get(key) ?? `[missing text: ${key}]`;

  return Object.freeze({
    contentHash: content.contentHash,
    lords: Object.freeze(
      content.lords.map((lord) =>
        Object.freeze({
          epithet: display(lord.epithetKey),
          id: lord.id,
          name: display(lord.labelKey),
          title: display(lord.titleKey),
        }),
      ),
    ),
    territories: Object.freeze(
      content.territories.map((territory) =>
        Object.freeze({ id: territory.id, name: display(territory.labelKey) }),
      ),
    ),
  });
}
