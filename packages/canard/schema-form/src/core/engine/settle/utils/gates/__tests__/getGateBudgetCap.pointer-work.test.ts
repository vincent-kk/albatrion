import { expect, it, vi } from 'vitest';

import { parsePointer } from '@/schema-form/helpers/jsonPointer';

import { createDispatchTree } from '../../../../__tests__/fixtures/createDispatchTree';
import { createFixedBranchSchema } from '../../../__tests__/fixtures/childSelection/createFixedBranchSchema';
import { getTransitionBudgetCap } from '../getGateBudgetCap';

/** Counts decoding inside the pointer owner, including cached consumers. */
const decoder = vi.hoisted(() => vi.fn());
vi.mock(
  '@/schema-form/helpers/jsonPointer/utils/parsePointerSegments',
  async (importOriginal) => {
    const original = await importOriginal<{
      parsePointerSegments: (path: string | readonly string[]) => unknown;
    }>();
    return {
      ...original,
      parsePointerSegments: (path: string | readonly string[]) => {
        decoder(path);
        return original.parsePointerSegments(path);
      },
    };
  },
);

it('classifies each shared active gate once when preparing the oneOf-80 budget', () => {
  const { runtime } = createDispatchTree(createFixedBranchSchema(80));
  decoder.mockClear();
  parsePointer('/positive-control');
  expect(decoder).toHaveBeenCalledTimes(1);
  decoder.mockClear();
  expect(getTransitionBudgetCap(runtime.blueprint)).toBe(81);
  expect(decoder).toHaveBeenCalledTimes(80);
  decoder.mockClear();
  expect(getTransitionBudgetCap(runtime.blueprint)).toBe(81);
  expect(decoder).not.toHaveBeenCalled();
});
