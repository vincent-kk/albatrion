import { describe, expect, it } from 'vitest';

import { createDispatchTree } from '@/schema-form/core/engine/__tests__/fixtures/createDispatchTree';
import { ValidationMode } from '@/schema-form/core/engine/types/state';
import {
  dispatchBatch,
  dispatchMount,
  dispatchResetSubtree,
} from '@/schema-form/core/engine/write';

import { pinSlotShipping } from '../../../__tests__/fixtures/pinSlotShipping';

// filid:contract validation-lifetime
describe('subtree load validation scope', () => {
  it('18C-101 EVENT-072 requests only the loaded subtree outside and inside batch', () => {
    // This fixture injects private warning and misfit state into one shipping tree.
    pinSlotShipping();
    const { root, runtime } = createDispatchTree(
      {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
      },
      { a: 'A', b: 'B' },
    );
    dispatchMount(root, { a: 'A', b: 'B' });
    runtime.validationMode = ValidationMode.OnChange;
    runtime.warningKeys = new Set(['other-subtree-warning']);
    runtime.misfitPaths.add('/b');
    const before = runtime.validationStamp ?? 0;
    const a = root.structure?.a ?? root;
    const b = root.structure?.b ?? root;
    const bValue = b.emit;
    dispatchResetSubtree(a);
    expect(runtime.validationStamp).toBe(before + 1);
    expect(runtime.validationPendingTargets?.has(a)).toBe(true);
    expect(runtime.validationPendingTargets?.has(root)).toBe(false);
    dispatchBatch(root, () => {
      dispatchResetSubtree(a);
      expect(a.emit).toBe('A');
      expect(runtime.validationStamp).toBe(before + 1);
    });
    expect(runtime.validationStamp).toBe(before + 2);
    expect(runtime.validationPendingTargets?.has(a)).toBe(true);
    expect(runtime.validationPendingTargets?.has(root)).toBe(false);
    expect(b.emit).toBe(bValue);
    expect(runtime.warningKeys).toEqual(new Set(['other-subtree-warning']));
    expect(runtime.misfitPaths.has('/b')).toBe(true);
  });
});
