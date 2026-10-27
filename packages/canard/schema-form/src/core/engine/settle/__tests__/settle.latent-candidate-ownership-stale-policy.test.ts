import { expect, it } from 'vitest';

import { pinLatentBaseline } from '../../../__tests__/fixtures/pinLatentBaseline';
import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import type { BlueprintSchema } from '../../blueprint';
import { dispatchMount, dispatchSetValue } from '../../write';
import { getDispatchNode } from './fixtures/getDispatchNode';

it.each([
  { host: 'array', clear: false, label: '[control] W3' },
  { host: 'array', clear: true, label: 'W3' },
  { host: 'object', clear: false, label: 'W3' },
  { host: 'object', clear: true, label: 'W3' },
] as const)(
  '$label $host clear=$clear removes an unreachable key without metadata',
  ({ host, clear }) => {
    // These assertions inspect the latent-store baseline directly.
    pinLatentBaseline();
    const candidate: BlueprintSchema =
      host === 'array'
        ? {
            type: 'array',
            controls: { unsetOnInactive: clear },
            items: { type: 'number' },
          }
        : {
            type: 'object',
            controls: { unsetOnInactive: clear },
            properties: { x: { type: 'number' } },
          };
    const { root, runtime } = createDispatchTree({
      type: 'object',
      properties: { a: { type: 'boolean' } },
      allOf: [
        { controls: { active: './a' }, properties: { v: candidate } },
        { controls: { active: false }, properties: { v: { type: 'string' } } },
      ],
    });
    dispatchMount(root, { a: true, v: host === 'array' ? [1] : { x: 1 } });
    const key = JSON.stringify(['/v/stale', 'number']);
    runtime.latentRaw.set(key, 99);
    expect(runtime.latentRawMetadata?.has(key) ?? false).toBe(false);
    dispatchSetValue(getDispatchNode(root, 'a'), false);
    expect(runtime.latentRaw.has(key)).toBe(false);
    expect(runtime.latentRawMetadata?.has(key) ?? false).toBe(false);
  },
);
