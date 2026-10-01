import { describe, expect, it } from 'vitest';

import { dispatchBatch, dispatchMount, dispatchResetSubtree } from '../../dispatch';
import { createDispatchTree } from '../../dispatch/__tests__/fixtures/createDispatchTree';
import { ValidationMode } from '../../types/state';

// filid:contract validation-lifetime
describe('subtree load validation scope', () => {
  it('18C-101 EVENT-072 requests only the loaded subtree outside and inside batch', () => {
    const { root, runtime } = createDispatchTree({ type: 'object', properties: {
      a: { type: 'string' }, b: { type: 'string' },
    } }, { a: 'A', b: 'B' });
    dispatchMount(root, { a: 'A', b: 'B' });
    runtime.validationMode = ValidationMode.OnChange;
    runtime.warningKeys = new Set(['other-subtree-warning']);
    runtime.typeMismatchPaths.add('/b');
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
    expect(runtime.typeMismatchPaths.has('/b')).toBe(true);
  });
});
