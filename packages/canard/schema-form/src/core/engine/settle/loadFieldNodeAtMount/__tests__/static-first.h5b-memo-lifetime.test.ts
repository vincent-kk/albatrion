import { afterEach, expect, it, vi } from 'vitest';

import { pinSlotShipping } from '../../../../__tests__/fixtures/pinSlotShipping';
import { createDispatchTree } from '../../../__tests__/fixtures/createDispatchTree';
import { dispatchMount } from '../../../write';
import * as assembly from '../utils/staticFirst/assembleStaticFirstNode';

afterEach(() => vi.restoreAllMocks());

it('releases the first-load memo when assembly fails after a child commit', () => {
  // The injected assembly failure targets the shipping tree's private memo lifetime.
  pinSlotShipping();
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: { child: { type: 'number', default: 1 } },
  });
  const assemble = assembly.assembleStaticFirstNode;
  const failure = new Error('root assembly failed after its child');
  let reachedMemo = false;
  vi.spyOn(assembly, 'assembleStaticFirstNode').mockImplementation((node) => {
    if (node === root) {
      expect(runtime.revisionTransitions).toBeDefined();
      reachedMemo = true;
      throw failure;
    }
    assemble(node);
  });
  expect(() =>
    dispatchMount(root, undefined, undefined, { deferValidation: true }),
  ).toThrow(failure);
  expect(reachedMemo).toBe(true);
  expect(runtime.revisionTransitions).toBeUndefined();
});
