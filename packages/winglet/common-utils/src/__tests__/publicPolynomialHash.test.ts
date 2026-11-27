import { expect, it } from 'vitest';

import { polynomialHash } from '../index';

it('returns the documented example values', () => {
  expect(polynomialHash('cache-key')).toBe('1putuhg');
  expect(polynomialHash('cache-key', 4)).toBe('tuhg');
});
