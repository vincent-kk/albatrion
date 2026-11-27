import { expect, it } from 'vitest';

import * as scenarios from '@aileron/schema-form-scenarios';

import { FormErrorCode, FormWarningCode } from '../../index';

const GROUP_QUALIFIED =
  /^(SCHEMA_FORM_ERROR|JSON_SCHEMA_ERROR|UNHANDLED_ERROR|VALIDATION_ERROR|SCHEMA_FORM_WARNING)\.[A-Z_]+$/;

/**
 * Collect every group-qualified code string reachable from the shared scenario data.
 * @param value - Scenario export or any nested part of it
 * @param found - Accumulated codes
 * @param seen - Objects already visited
 * @returns The accumulated codes
 */
const collectCodes = (
  value: unknown,
  found: Set<string> = new Set(),
  seen: WeakSet<object> = new WeakSet(),
): Set<string> => {
  if (typeof value === 'string') {
    if (GROUP_QUALIFIED.test(value)) found.add(value);
  } else if (value !== null && typeof value === 'object' && !seen.has(value)) {
    seen.add(value);
    for (const item of Object.values(value)) collectCodes(item, found, seen);
  }
  return found;
};

it('uses only FormErrorCode and FormWarningCode values in the shared scenarios', () => {
  const known = new Set<string>([
    ...Object.values(FormErrorCode),
    ...Object.values(FormWarningCode),
  ]);
  const codes = [...collectCodes(scenarios)];
  expect(codes.length).toBeGreaterThan(0);
  expect(codes.filter((code) => !known.has(code))).toEqual([]);
});
