import { afterEach } from 'vitest';
import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as capture from '../utils/literalStar/captureLiteralStarExit';
import * as latent from '../utils/literalStarStore/setLiteralStarRaw';
import { getDispatchNode } from './fixtures/getDispatchNode';

it('keeps a detached instance in the host without capturing latent raw', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, { open: true, value: 'held' });
  const old = getDispatchNode(root, 'value');
  const store = vi.spyOn(latent, 'setLiteralStarRaw');
  const serialize = vi.spyOn(capture, 'captureLiteralStarExit');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(store).not.toHaveBeenCalled();
  expect(serialize).not.toHaveBeenCalled();
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

afterEach(() => vi.restoreAllMocks());
