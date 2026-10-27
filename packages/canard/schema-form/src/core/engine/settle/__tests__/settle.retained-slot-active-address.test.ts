import { afterEach, expect, it, vi } from 'vitest';

import { pinSlotShipping } from '../../../__tests__/fixtures/pinSlotShipping';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import { DetachedWriteAddress } from '../utils/latentStore/DetachedWriteAddress';
import { getDispatchNode } from './fixtures/getDispatchNode';

afterEach(() => vi.restoreAllMocks());

it('allocates a clone write address only when that lifetime departs', () => {
  // Address allocation is a shipping-path cost, independent of shadow replay.
  pinSlotShipping();
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, { open: true, value: 'held' });
  const first = getDispatchNode(root, 'value');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  const firstAddress = DetachedWriteAddress.read(first);
  expect(firstAddress).toBeDefined();

  const retain = vi.spyOn(DetachedWriteAddress, 'retain');
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  const second = getDispatchNode(root, 'value');
  expect(second).not.toBe(first);
  expect(retain.mock.calls.some(([node]) => node === second)).toBe(false);
  expect(DetachedWriteAddress.read(second)).toBeUndefined();
  expect(DetachedWriteAddress.read(first)).toBe(firstAddress);

  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(retain).toHaveBeenCalledWith(second, expect.anything(), runtime);
  expect(DetachedWriteAddress.read(second)?.path).toBe('/value');
  dispatchSetValue(first, 'patched');
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(getDispatchNode(root, 'value').raw).toBe('patched');
  expect(first.raw).toBe('held');
});
