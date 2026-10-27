import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { engineModes } from '../../utils/cache/engineModes';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as memo from '../utils/commit/updateInactiveValuesMemo';
import * as reads from '../utils/detached/readFieldNodeInactiveValues';
import { getDispatchNode } from './fixtures/getDispatchNode';

const previous = engineModes.slots;
beforeEach(() => engineModes.setMode('slots', 'on'));
afterEach(() => {
  vi.restoreAllMocks();
  engineModes.setMode('slots', previous);
});

it('commits a slot exit without rebuilding inactive lists or capturing their reads', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, { open: true, value: 'held' });
  const rebuild = vi.spyOn(memo, 'updateInactiveValuesMemo');
  const read = vi.spyOn(reads, 'readFieldNodeInactiveValues');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(rebuild).not.toHaveBeenCalled();
  expect(read).not.toHaveBeenCalled();
  expect(reads.readFieldNodeInactiveValues(root)).toEqual([
    { path: '/value', value: 'held' },
  ]);
});

it('publishes detached overlays only at a later commit while retaining old arrays', () => {
  const { root, runtime } = createDispatchTree({
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
  const published = reads.readFieldNodeInactiveValues(root);
  const commit = runtime.commitNumber;
  dispatchSetValue(old, 'overlay');
  expect(runtime.commitNumber).toBe(commit);
  expect(reads.readFieldNodeInactiveValues(root)).toBe(published);
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(reads.readFieldNodeInactiveValues(root)).toEqual([
    { path: '/value', value: 'overlay' },
  ]);
  expect(reads.readFieldNodeInactiveValues(root)).not.toBe(published);
  expect(published).toEqual([{ path: '/value', value: 'held' }]);
});
