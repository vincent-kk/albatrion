import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as cloning from '../utils/slots/cloneFromSlot';
import { getDispatchNode } from './fixtures/getDispatchNode';

const previous = engineModes.slots;
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('slots', previous);
});

it('checks slot and latent public results after every verified commit', () => {
  engineModes.setMode('slots', 'verify');
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, { open: true, value: 'held' });
  const old = getDispatchNode(root, 'value');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(root.inactiveSlots).toBeInstanceOf(Map);
  dispatchSetValue(old, 'overlay');
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(getDispatchNode(root, 'value').raw).toBe('overlay');
  expect(old.raw).toBe('held');
  expect(root.runtime.slotVerification?.commits).toBeGreaterThanOrEqual(3);
  expect(root.runtime.slotVerification?.differences).toBe(0);
});

it('rejects a cloned source mutation instead of counting an unchecked shadow pass', () => {
  engineModes.setMode('slots', 'verify');
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, { open: true, value: 'held' });
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  const clone = cloning.cloneFromSlot;
  vi.spyOn(cloning, 'cloneFromSlot').mockImplementation((...arguments_) => {
    const copied = clone(...arguments_);
    copied.raw = 'corrupted';
    return copied;
  });
  expect(() => dispatchSetValue(getDispatchNode(root, 'open'), true)).toThrow(
    /slot.*shadow|shadow.*slot/i,
  );
  expect(root.runtime.slotVerification?.differences).toBeGreaterThan(0);
});
