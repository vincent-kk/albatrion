import { expect, it } from 'vitest';

import { NULL_FUNCTION } from '@winglet/common-utils/constant';

import { createFieldInputBridge } from '../utils/createFieldInputBridge';

it('returns the same shared empty component for null and undefined', () => {
  const absent = createFieldInputBridge(
    null,
    undefined,
    undefined,
    undefined,
    undefined,
    NULL_FUNCTION,
  );
  const missing = createFieldInputBridge(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    NULL_FUNCTION,
  );
  expect(absent).toBe(NULL_FUNCTION);
  expect(missing).toBe(absent);
  expect(NULL_FUNCTION()).toBeNull();
});
