import { expect, it } from 'vitest';

import { pinLatentBaseline } from '../../../__tests__/fixtures/pinLatentBaseline';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import {
  dispatchInsert,
  dispatchMount,
  dispatchRemove,
  dispatchSetValue,
} from '../../write';
import { HostLatent } from '../utils/latentStore/HostLatent';
import { getDispatchNode } from './fixtures/getDispatchNode';

it.each(['items', 'prefixItems'] as const)(
  '%s single-kind off-write retains whole raw, inactiveValues and entry interpretation',
  (keyword) => {
    // These assertions inspect the latent-store baseline directly.
    pinLatentBaseline();
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        list: {
          type: 'array',
          controls: { active: '../open' },
          [keyword]:
            keyword === 'items' ? { type: 'number' } : [{ type: 'number' }],
        },
      },
    });
    dispatchMount(root, { open: false, list: [] });
    dispatchSetValue(root, { open: false, list: ['7'] });
    expect(root.blueprintNode.hasCandidateDescendants).toBeUndefined();
    const latent = runtime.latentRaw.get(JSON.stringify(['/list', 'array']));
    expect(latent).toBeInstanceOf(HostLatent);
    expect(latent).toEqual(new HostLatent(['7'], undefined));
    expect([...runtime.latentRaw.keys()]).toEqual([
      JSON.stringify(['/list', 'array']),
    ]);
    expect(runtime.inactiveValuesMemo.get('')).toEqual([
      { path: '/list', value: ['7'] },
    ]);
    dispatchSetValue(getDispatchNode(root, 'open'), true);
    expect(root.emit).toEqual({ open: true, list: [7] });
    expect(runtime.inactiveValuesMemo.get('')).toEqual([]);
  },
);

it('candidate-free structural moves reuse their existing source records', () => {
  // These assertions inspect the latent-store baseline directly.
  pinLatentBaseline();
  const { root, runtime } = createDispatchTree({
    type: 'array',
    items: { type: 'number' },
  });
  dispatchMount(root, [1, 2]);
  const first = getDispatchNode(root, '0');
  const second = getDispatchNode(root, '1');
  dispatchInsert(root, 0, 3);
  expect(getDispatchNode(root, '1')).toBe(first);
  expect(getDispatchNode(root, '2')).toBe(second);
  dispatchRemove(root, 0);
  expect(getDispatchNode(root, '0')).toBe(first);
  expect(getDispatchNode(root, '1')).toBe(second);
  expect(root.emit).toEqual([1, 2]);
  expect(runtime.latentRaw.size).toBe(0);
});
