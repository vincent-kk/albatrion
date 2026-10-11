import { afterEach, expect, it, vi } from 'vitest';

import { blueprint } from '../../../blueprint';
import { getDeriveRuleTable } from '../index';

afterEach(() => vi.restoreAllMocks());

it('82C-01 does not search fragment child targets when only active gates exist', () => {
  const analysis = blueprint({ type: 'object', properties: {
    kind: { type: 'string' },
  }, oneOf: Array.from({ length: 64 }, (_, index) => ({
    controls: { active: `./kind === '${index}'` },
    properties: { [`value${index}`]: { type: 'string' } },
  })) });
  const filter = Array.prototype.filter;
  let inspected = 0;
  vi.spyOn(Array.prototype, 'filter').mockImplementation(function (this: unknown[], callback, receiver) {
    return filter.call(this, (value, index, array) => {
      if (value && typeof value === 'object' && 'schemaPath' in value && 'scope' in value)
        inspected++;
      return callback.call(receiver, value, index, array);
    });
  });
  expect(getDeriveRuleTable(analysis).rules).toEqual([]);
  expect(inspected).toBe(0);
});
