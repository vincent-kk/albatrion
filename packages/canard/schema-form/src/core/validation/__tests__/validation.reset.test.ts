import { describe, expect, it, vi } from 'vitest';

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
    const request = vi.fn();
    runtime.requestValidation = request;
    const a = root.structure?.a ?? root;
    const b = root.structure?.b ?? root;
    const bValue = b.emit;
    dispatchResetSubtree(a);
    expect(request).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenLastCalledWith(a);
    dispatchBatch(root, () => {
      dispatchResetSubtree(a);
      expect(a.emit).toBe('A');
      expect(request).toHaveBeenCalledTimes(1);
    });
    expect(request).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenLastCalledWith(a);
    expect(b.emit).toBe(bValue);
    expect(runtime.warningKeys).toEqual(new Set(['other-subtree-warning']));
    expect(runtime.typeMismatchPaths.has('/b')).toBe(true);
  });
});
