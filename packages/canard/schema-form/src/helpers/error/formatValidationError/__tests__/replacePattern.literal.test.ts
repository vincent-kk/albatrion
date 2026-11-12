import { expect, it } from 'vitest';
import { replacePattern } from '../utils/replacePattern';

it.each(['$&', '$$', "$'", '$`'])('inserts %s literally', (value) => {
  expect(replacePattern('Invalid {value}', undefined, value)).toBe('Invalid ' + value);
  expect(replacePattern('Limit {limit}', { limit: value }, undefined)).toBe('Limit ' + value);
});
it('keeps the first-occurrence and details-before-value contract', () => {
  expect(replacePattern('{limit} / {limit}', { limit: 5 }, undefined)).toBe('5 / {limit}');
  expect(replacePattern('{value} / {value}', { value: '$&' }, '$$')).toBe('$& / $$');
});
