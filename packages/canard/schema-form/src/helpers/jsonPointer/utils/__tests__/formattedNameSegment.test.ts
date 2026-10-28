import { describe, expect, it } from 'vitest';

import { readFormattedNameSegment } from '../readPointerSegment';

describe('canonical formatted name segments', () => {
  it.each(['*', '..', '.', '@'])('rejects raw operator %s', (operator) => {
    expect(readFormattedNameSegment(`/host/${operator}`, -1)).toBeUndefined();
  });

  it('keeps exact percent literals and tilde escapes in encoded form', () => {
    for (const name of ['%2A', '%2E%2E', '%2E', '%40', 'a~1b', '~0'])
      expect(readFormattedNameSegment(`/host/${name}`, -1)).toBe(name);
  });

  it('preserves ordinary percent, hash and empty names at their position', () => {
    expect(readFormattedNameSegment('/host/rate%20', -1)).toBe('rate%20');
    expect(readFormattedNameSegment('/host/#', -1)).toBe('#');
    expect(readFormattedNameSegment('/host/', -1)).toBe('');
    expect(readFormattedNameSegment('/%2A/child', 0)).toBe('%2A');
    expect(readFormattedNameSegment('', 0)).toBeUndefined();
  });
});
