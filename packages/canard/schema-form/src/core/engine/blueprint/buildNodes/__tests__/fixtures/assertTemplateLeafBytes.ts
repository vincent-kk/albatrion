import { expect, vi } from 'vitest';

import { blueprint } from '../../../blueprint';
import type { BlueprintSchema } from '../../../types/schema';
import * as templateKeys from '../../utils/references/getTemplateKey';
import { getTemplateKeysHead } from './getTemplateKeysHead';

/**
 * Compare every actual template lookup with the independent JSON oracle.
 * @param schema - Authored schema whose nested and referenced inputs are exercised
 * @returns Number of real template key constructions compared
 */
export const assertTemplateLeafBytes = (schema: BlueprintSchema): number => {
  const original = templateKeys.getTemplateKey;
  let calls = 0;
  const spy = vi
    .spyOn(templateKeys, 'getTemplateKey')
    .mockImplementation((context, inputs) => {
      const expected = getTemplateKeysHead(context, inputs);
      const actual = original(context, inputs);
      expect(actual.key).toBe(expected.key);
      expect(actual.boundKey).toBe(expected.boundKey);
      calls++;
      return actual;
    });
  try {
    blueprint(schema);
  } finally {
    spy.mockRestore();
  }
  expect(calls).toBeGreaterThan(0);
  return calls;
};
