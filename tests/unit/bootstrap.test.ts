import { bootstrapLinks, bootstrapTitle } from '@app/bootstrap';
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
});
