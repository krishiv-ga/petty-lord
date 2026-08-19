import { bootstrapLinks, bootstrapTitle } from '@app/bootstrap';
import { foundationSmokeProjection } from '@app/foundation';
import { describe, expect, it } from 'vitest';

describe('repository bootstrap', () => {
  it('exposes the project title and durable source entry points', () => {
    expect(bootstrapTitle).toBe('The Petty Lord');
    expect(bootstrapLinks.map((link) => link.label)).toEqual([
      'Canonical design',
      'Work packets',
      'Technical stack',
    ]);
  });

  it('exposes the integrated content/kernel smoke projection', () => {
    expect(foundationSmokeProjection).toMatchObject({
      buildVersion: '0.1.0-alpha.1',
      lordNames: ['Lord of Greyfen', 'Edric', 'Ysabel', 'Renard', 'Oswin', 'Mara'],
      territoryNames: [
        'Greyfen',
        'Northkeep',
        'Westmarch',
        'Eastvale',
        'Abbeylands',
        'Southmere',
        'Capital',
      ],
    });
    expect(foundationSmokeProjection.contentHash).toMatch(/^fnv1a64-[0-9a-f]{16}$/);
  });
});
