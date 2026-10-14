import { expect, vi } from 'vitest';

import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';
import type {
  ArrayArrangePlan,
  ArrayOperation,
} from '@/schema-form/core/engine/record';
import { WriteOption } from '@/schema-form/core/engine/types/value';

import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';
import { createTestTree } from '../../../__tests__/fixtures/createTestTree';
import * as tailModule from '../../utils/structure/applyArraySlots/utils/applyArrayTail';
import * as eligibility from '../../utils/structure/applyArraySlots/utils/canApplyArrayTail';
import { arrangeFieldNodeItems } from '../../utils/structure/arrangeFieldNodeItems';
import { writeFieldNode } from '../../utils/write/writeFieldNode';
import { observeArraySettlement } from './observeArraySettlement';
import { observeDetachedReads } from './observeDetachedReads';

/**
 * Run identical writes through the candidate and the unchanged general route.
 * @param schema - Shared authored declarations for independently owned trees
 * @param input - Initial whole-array source, left caller-owned
 * @param operation - Public verb applied after initial settlement
 * @param prepare - Optional identical snapshot/store setup on each tree
 * @param plan - Optional multi-tail proposal supplied by the test behavior
 * @param expectTail - Whether the candidate must settle through the tail path (true) or the general route (false)
 * @returns Candidate and oracle for additional identity and lifecycle assertions
 */
export const compareArrayTail = (
  schema: BlueprintSchema,
  input: unknown,
  operation: ArrayOperation,
  prepare: ((root: PlainNode) => void) | undefined,
  plan: Extract<ArrayArrangePlan, { kind: 'slots' }> | undefined,
  expectTail: boolean,
) => {
  const actual = createTestTree(schema).root;
  const oracle = createTestTree(schema).root;
  for (const root of [actual, oracle]) {
    writeFieldNode(root, input, 'callerReplace', WriteOption.Overwrite);
    root.runtime.loadSnapshot = input;
    prepare?.(root);
    if (plan) root.behavior.arrange = () => plan;
  }
  const previousChildren = actual.children;
  const previousSnapshot = actual.runtime.loadSnapshot;
  const snapshotCopy = structuredClone(previousSnapshot);
  const former = [...(actual.children ?? [])];
  const formerOracle = [...(oracle.children ?? [])];
  const forceGeneral = vi
    .spyOn(eligibility, 'canApplyArrayTail')
    .mockReturnValue(false);
  let expected: unknown;
  try {
    expected = arrangeFieldNodeItems(oracle, operation);
  } finally {
    forceGeneral.mockRestore();
  }
  const spy = vi.spyOn(tailModule, 'applyArrayTail');
  let result: unknown;
  try {
    result = arrangeFieldNodeItems(actual, operation);
  } finally {
    expect(spy).toHaveBeenCalledTimes(expectTail ? 1 : 0);
    spy.mockRestore();
  }
  expect(result).toEqual(expected);
  expect(observeArraySettlement(actual)).toEqual(
    observeArraySettlement(oracle),
  );
  expect(observeDetachedReads(actual, former)).toEqual(
    observeDetachedReads(oracle, formerOracle),
  );
  expect(previousChildren).toEqual(former);
  expect(previousSnapshot).toEqual(snapshotCopy);
  return { actual, oracle, result, former, previousChildren };
};
