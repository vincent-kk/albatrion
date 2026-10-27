import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../types/value';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as traversal from '../utils/compute/dirtyChildren';
import { gateSelectionTable } from '../utils/gates/gateSelectionTable';

it('S6 rejects an actual dirtyChildren call returning a consumed child', () => {
  const previous = { ...gateSelectionTable };
  const { root } = createDispatchTree({ type: 'object', properties: {
    a: { type: 'string', default: 'old' },
  } });
  dispatchMount(root, undefined);
  gateSelectionTable.mode = 'verify';
  const original = traversal.dirtyChildren;
  vi.spyOn(traversal, 'dirtyChildren').mockImplementation((node, context) => {
    // Force the forbidden intermediate query while retaining the consumed edge.
    Set.prototype.delete.call(context.dirtyPaths, '/a');
    return original(node, context);
  });
  try {
    expect(() => dispatchSetValue(root, { a: 'new' }, WriteOption.Merge)).toThrow(
      'S6 dirtyChildren returned a consumed child',
    );
    expect(gateSelectionTable.violations).toBe(previous.violations + 1);
  } finally {
    vi.restoreAllMocks();
    Object.assign(gateSelectionTable, previous);
  }
});
