import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as latent from '../utils/latentStore/setLatentRaw';
import * as capture from '../utils/transition/captureExitedRaw';
import { getDispatchNode } from './fixtures/getDispatchNode';

const previous = engineModes.slots;
beforeEach(() => engineModes.setMode('slots', 'on'));
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('slots', previous);
});

it('keeps a detached instance in the host without capturing latent raw', () => {
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, { open: true, value: 'held' });
  const old = getDispatchNode(root, 'value');
  const store = vi.spyOn(latent, 'setLatentRaw');
  const serialize = vi.spyOn(capture, 'captureExitedRaw');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(store).not.toHaveBeenCalled();
  expect(serialize).not.toHaveBeenCalled();
  expect(runtime.latentRaw.size).toBe(0);
  expect(root.inactiveSlots).toBeInstanceOf(Map);
  expect([...(root.inactiveSlots?.values() ?? [])]).toContain(old);
  expect(old.detached).toBe(true);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(getDispatchNode(root, 'value')).not.toBe(old);
  expect(getDispatchNode(root, 'value').raw).toBe('held');
});

it('does not retain an entry whose effective exit policy clears its source', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: {
        type: 'string',
        controls: { active: '../open', unsetOnInactive: true },
      },
    },
  });
  dispatchMount(root, { open: true, value: 'cleared' });
  const old = getDispatchNode(root, 'value');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect([...(root.inactiveSlots?.values() ?? [])]).not.toContain(old);
  dispatchSetValue(getDispatchNode(root, 'open'), true);
  expect(getDispatchNode(root, 'value').raw).toBeUndefined();
});

it('retains same-name candidates under separate blueprint child entries', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: { kind: { type: 'string' } },
    oneOf: [
      {
        controls: { active: './kind === "string"' },
        properties: { value: { type: 'string' } },
      },
      {
        controls: { active: './kind === "number"' },
        properties: { value: { type: 'number', default: 7 } },
      },
    ],
  });
  dispatchMount(root, { kind: 'string', value: 'first' });
  const string = getDispatchNode(root, 'value');
  dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
  const number = getDispatchNode(root, 'value');
  dispatchSetValue(getDispatchNode(root, 'kind'), 'none');
  const values = [...(root.inactiveSlots?.values() ?? [])];
  expect(values).toContain(string);
  expect(values).toContain(number);
  expect(values).toHaveLength(2);
  dispatchSetValue(getDispatchNode(root, 'kind'), 'string');
  expect(getDispatchNode(root, 'value').raw).toBe('first');
  dispatchSetValue(getDispatchNode(root, 'kind'), 'number');
  expect(getDispatchNode(root, 'value').raw).toBe(7);
});

it('keeps the latent reference path available when slots are disabled', () => {
  engineModes.setMode('slots', 'off');
  const { root, runtime } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, { open: true, value: 'held' });
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(root.inactiveSlots).toBeUndefined();
  expect(runtime.latentRaw.get(JSON.stringify(['/value', 'string']))).toBe(
    'held',
  );
});
