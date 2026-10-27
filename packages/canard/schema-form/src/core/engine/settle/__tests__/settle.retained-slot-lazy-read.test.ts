import { afterEach } from 'vitest';
import { expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as reads from '../utils/detached/readFieldNodeInactiveValues';
import * as memo from '../utils/literalStar/updateLiteralStarValues';
import { getDispatchNode } from './fixtures/getDispatchNode';

it('commits a slot exit without rebuilding inactive lists or capturing their reads', () => {
  const { root } = createDispatchTree({
    type: 'object',
    properties: {
      open: { type: 'boolean' },
      value: { type: 'string', controls: { active: '../open' } },
    },
  });
  dispatchMount(root, { open: true, value: 'held' });
  const rebuild = vi.spyOn(memo, 'updateLiteralStarValues');
  const read = vi.spyOn(reads, 'readFieldNodeInactiveValues');
  dispatchSetValue(getDispatchNode(root, 'open'), false);
  expect(rebuild).not.toHaveBeenCalled();
  expect(read).not.toHaveBeenCalled();
  expect(reads.readFieldNodeInactiveValues(root)).toEqual([
    { path: '/value', value: 'held' },
  ]);
});

it('publishes detached overlays only at the next live commit', () => {
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

afterEach(() => vi.restoreAllMocks());
