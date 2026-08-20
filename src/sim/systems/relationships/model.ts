import type { LordId } from '@contracts/ids';

export const RELATIONSHIP_MINIMUM = -100;
export const RELATIONSHIP_MAXIMUM = 100;

export type RelationshipReason = {
  readonly amount: number;
  readonly authoredReason: string;
  readonly id: string;
  readonly recordedAtDay: number;
};

export type RelationshipModifier = RelationshipReason & {
  readonly expiresAtDay: number | null;
};

export type DirectedRelationship = {
  readonly baseValue: number;
  readonly fromLordId: LordId;
  readonly history: readonly RelationshipReason[];
  readonly modifiers: readonly RelationshipModifier[];
  readonly toLordId: LordId;
};

export type RelationshipProjection = {
  readonly activeReasons: readonly RelationshipModifier[];
  readonly band: 'cold' | 'cordial' | 'hostile' | 'neutral' | 'trusted' | 'warm';
  readonly fromLordId: LordId;
  readonly supportIsIndependent: true;
  readonly toLordId: LordId;
  readonly value: number;
};

export function clampRelationship(value: number): number {
  return Math.max(RELATIONSHIP_MINIMUM, Math.min(RELATIONSHIP_MAXIMUM, Math.round(value)));
}

export function createDirectedRelationship(
  fromLordId: LordId,
  toLordId: LordId,
  baseValue: number,
): DirectedRelationship {
  if (fromLordId === toLordId) {
    throw new Error('A directed personal relationship must target another lord.');
  }
  return {
    baseValue: clampRelationship(baseValue),
    fromLordId,
    history: [],
    modifiers: [],
    toLordId,
  };
}

export function addRelationshipModifier(
  relationship: DirectedRelationship,
  modifier: RelationshipModifier,
): DirectedRelationship {
  if (!modifier.id || !modifier.authoredReason) {
    throw new Error('Relationship modifiers require an id and authored reason.');
  }
  if (modifier.expiresAtDay !== null && modifier.expiresAtDay < modifier.recordedAtDay) {
    throw new Error('A relationship modifier cannot expire before it begins.');
  }
  if (relationship.history.some(({ id }) => id === modifier.id)) {
    throw new Error(`Relationship modifier ${modifier.id} already exists.`);
  }
  return {
    ...relationship,
    history: [...relationship.history, modifier],
    modifiers: [...relationship.modifiers, modifier],
  };
}

export function expireRelationshipModifiers(
  relationship: DirectedRelationship,
  currentDay: number,
): DirectedRelationship {
  return {
    ...relationship,
    modifiers: relationship.modifiers.filter(
      ({ expiresAtDay }) => expiresAtDay === null || currentDay < expiresAtDay,
    ),
  };
}

export function relationshipValueAt(
  relationship: DirectedRelationship,
  currentDay: number,
): number {
  const activeAmount = relationship.modifiers
    .filter(({ expiresAtDay }) => expiresAtDay === null || currentDay < expiresAtDay)
    .reduce((sum, { amount }) => sum + amount, 0);
  return clampRelationship(relationship.baseValue + activeAmount);
}

export function relationshipBand(value: number): RelationshipProjection['band'] {
  if (value <= -40) return 'hostile';
  if (value <= -15) return 'cold';
  if (value <= 14) return 'neutral';
  if (value <= 39) return 'cordial';
  if (value <= 69) return 'warm';
  return 'trusted';
}

export function projectRelationship(
  relationship: DirectedRelationship,
  currentDay: number,
): RelationshipProjection {
  const value = relationshipValueAt(relationship, currentDay);
  return {
    activeReasons: relationship.modifiers.filter(
      ({ expiresAtDay }) => expiresAtDay === null || currentDay < expiresAtDay,
    ),
    band: relationshipBand(value),
    fromLordId: relationship.fromLordId,
    supportIsIndependent: true,
    toLordId: relationship.toLordId,
    value,
  };
}
