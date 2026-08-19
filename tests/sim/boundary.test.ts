import { describe, expect, it } from 'vitest';

describe('simulation test boundary', () => {
  it('runs headlessly without browser globals', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });
});
