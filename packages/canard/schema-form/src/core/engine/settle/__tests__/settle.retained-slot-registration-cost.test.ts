import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { WriteOption } from '../../types/value';
import { dispatchMount, dispatchSetValue } from '../../write';
import { createChildNode } from '../utils/compute/createChildNode';
import { getGateRegistry } from '../utils/gates/getGateRegistry';
import { getSettlementScratch } from '../utils/scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../utils/scratch/releaseSettlementScratch';
import { createSettlementContext } from '../utils/settlement/createSettlementContext';
import { cloneFromSlot } from '../utils/slots/cloneFromSlot';
import { getRetainedChildEntry } from '../utils/slots/getRetainedChildEntry';
import { getDispatchNode } from './fixtures/getDispatchNode';

afterEach(() => vi.restoreAllMocks());

it('leaves gate binding to selected entry for both source constructors', () => {
  // Both shipping constructors restore records before selected-entry binding.
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      group: {
        type: 'object',
        controls: { active: '../open' },
        properties: { value: { type: 'string', default: 'held' } },
      },
    },
  });
  dispatchMount(root, { open: true, group: { value: 'held' } });
  const source = getDispatchNode(root, 'group');
  const entry = getRetainedChildEntry(root, source.name, source.blueprintNode);
  if (!entry) throw new Error('Expected a retained group binding');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  const scratch = getSettlementScratch(runtime);
  const context = createSettlementContext(
    root,
    'callerReplace',
    WriteOption.Overwrite,
    scratch,
  );
  const register = vi.spyOn(getGateRegistry(runtime), 'register');
  try {
    const fresh = createChildNode(root, entry);
    expect(register).not.toHaveBeenCalled();
    const clone = cloneFromSlot(root, entry, source, context);
    expect(register).not.toHaveBeenCalled();
    expect(clone).not.toBe(source);
    expect(clone).not.toBe(fresh);
    expect(getDispatchNode(clone, 'value').raw).toBe('held');
    expect(context.entered.has(getDispatchNode(clone, 'value'))).toBe(true);
  } finally {
    releaseSettlementScratch(scratch);
  }
});
