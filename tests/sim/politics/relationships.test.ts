import { describe, expect, it } from 'vitest';
import {
  addRelationshipModifier,
  createDirectedRelationship,
  expireRelationshipModifiers,
  projectRelationship,
  relationshipValueAt,
} from '../../../src/sim/systems/relationships';

describe('directed relationships', () => {
  it('bounds values, preserves authored history and expires only temporary reasons', () => {
    let relationship = createDirectedRelationship('ysabel', 'greyfen', 95);
    relationship = addRelationshipModifier(relationship, {
      amount: 12,
      authoredReason: 'A costly gift was remembered.',
      expiresAtDay: 8,
      id: 'gift-1',
      recordedAtDay: 1,
    });
    relationship = addRelationshipModifier(relationship, {
      amount: -25,
      authoredReason: 'Greyfen broke an agreement.',
      expiresAtDay: null,
      id: 'betrayal-1',
      recordedAtDay: 2,
    });
    expect(relationshipValueAt(relationship, 4)).toBe(82);
    expect(relationshipValueAt(relationship, 8)).toBe(70);
    const expired = expireRelationshipModifiers(relationship, 8);
    expect(expired.modifiers.map(({ id }) => id)).toEqual(['betrayal-1']);
    expect(expired.history.map(({ id }) => id)).toEqual(['gift-1', 'betrayal-1']);
    expect(() =>
      addRelationshipModifier(structuredClone(expired), {
        amount: 12,
        authoredReason: 'A replayed gift must not return.',
        expiresAtDay: 16,
        id: 'gift-1',
        recordedAtDay: 9,
      }),
    ).toThrow(/already exists/);
  });

  it('projects relationship independently from support', () => {
    const projection = projectRelationship(createDirectedRelationship('mara', 'greyfen', 45), 0);
    expect(projection).toMatchObject({
      band: 'warm',
      supportIsIndependent: true,
      value: 45,
    });
  });
});
