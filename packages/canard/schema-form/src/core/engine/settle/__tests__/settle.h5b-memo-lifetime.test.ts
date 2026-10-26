import { expect, it } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount } from '../../write';
import { markCommitDeliveries } from '../utils/commit/markCommitDeliveries';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';

it('releases an active bit-only transition memo when the commit visitor throws', () => {
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: { child: { type: 'number' } },
  });
  dispatchMount(root, { child: 0 }, undefined, { deferValidation: true });
  const child = root.children![0];
  const scratch = getSettlementScratch(runtime);
  const context = createSettlementContext(root, 'load', 0, scratch);
  context.loadScope = root;
  context.changedNodes.add(root).add(child);
  const failure = new Error('visitor failed after the first revision');
  let reachedMemo = false;
  runtime.entryDepth = 1;
  try {
    expect(() =>
      markCommitDeliveries(context, (node) => {
        if (node !== child) return;
        expect(runtime.revisionTransitions).toBeDefined();
        reachedMemo = true;
        throw failure;
      }),
    ).toThrow(failure);
    expect(reachedMemo).toBe(true);
    expect(runtime.revisionTransitions).toBeUndefined();
  } finally {
    runtime.entryDepth = 0;
    releaseSettlementScratch(scratch);
  }
});
