import { expect, it } from 'vitest';

import { pinLatentBaseline } from '../../../__tests__/fixtures/pinLatentBaseline';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import { dispatchMount, dispatchSetValue } from '../../write';
import { getDispatchNode } from './fixtures/getDispatchNode';

it('K1 removes a stale key reached by no candidate on array exit', () => {
  // These assertions inspect the latent-store baseline directly.
  pinLatentBaseline();
  const { root } = createDispatchTree({
    type: 'object',
    properties: { a: { type: 'boolean' } },
    allOf: [
      {
        controls: { active: './a' },
        properties: { v: { type: 'array', items: { type: 'number' } } },
      },
      { controls: { active: false }, properties: { v: { type: 'string' } } },
    ],
  });
  dispatchMount(root, { a: true, v: [1] });
  const stale = JSON.stringify(['/v/stale', 'number']);
  root.runtime.latentRaw.set(stale, 99);
  dispatchSetValue(getDispatchNode(root, 'a'), false);
  expect(root.runtime.latentRaw.has(stale)).toBe(false);
});
