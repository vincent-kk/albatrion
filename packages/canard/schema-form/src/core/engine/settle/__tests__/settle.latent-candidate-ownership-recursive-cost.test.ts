import { afterEach, expect, it, vi } from 'vitest';

import { createDispatchTree } from '../../__tests__/fixtures/createDispatchTree';
import * as bindings from '../../blueprint';
import type { BlueprintSchema } from '../../blueprint';
import { dispatchMount, dispatchSetValue } from '../../write';
import * as reaching from '../utils/transition/reachesLatentPath';
import { getDispatchNode } from './fixtures/getDispatchNode';

afterEach(() => vi.restoreAllMocks());

it('R2 recursive candidate exit bounds each path/token query linearly', () => {
  for (const depth of [4, 8, 12]) {
    const schema: BlueprintSchema = {
      type: 'object',
      $defs: {
        owned: {
          type: 'object',
          properties: {
            more: { type: 'boolean' },
            '0': {
              $ref: '#/$defs/owned',
              nullable: true,
              controls: { active: '../more' },
            },
            value: { type: 'string' },
          },
        },
        other: {
          type: 'array',
          allOf: [
            {
              controls: { active: false },
              items: { $ref: '#/$defs/altObject' },
            },
            {
              controls: { active: false },
              items: { $ref: '#/$defs/other' },
            },
          ],
        },
        altObject: {
          type: 'object',
          allOf: [
            {
              controls: { active: false },
              properties: { '0': { $ref: '#/$defs/altObject' } },
            },
            {
              controls: { active: false },
              properties: { '0': { $ref: '#/$defs/other' } },
            },
          ],
        },
      },
      properties: { a: { type: 'boolean' }, b: { type: 'boolean' } },
      allOf: [
        {
          controls: { active: './a' },
          properties: {
            v: { $ref: '#/$defs/owned', controls: { unsetOnInactive: true } },
          },
        },
        {
          controls: { active: './b' },
          properties: { v: { $ref: '#/$defs/other' } },
        },
      ],
    };
    let input: Record<string, unknown> = { more: false, value: 'leaf' };
    for (let level = 0; level < depth; level++)
      input = { more: true, '0': input, value: 'branch' };
    const { root } = createDispatchTree(schema);
    dispatchMount(root, { a: true, b: false, v: input });
    const lookups = vi.spyOn(bindings, 'getItemEntries');
    const arrayTemplates =
      root.runtime.blueprint?.nodes.filter((node) => node.kind === 'array')
        .length ?? 0;
    expect(arrayTemplates).toBeGreaterThan(0);
    const reach = reaching.reachesLatentPath;
    const queries = vi
      .spyOn(reaching, 'reachesLatentPath')
      .mockImplementation((node, segments, offset, token) => {
        const before = lookups.mock.calls.length;
        const result = reach(node, segments, offset, token);
        expect(lookups.mock.calls.length - before).toBeLessThanOrEqual(
          arrayTemplates * segments.length,
        );
        return result;
      });
    dispatchSetValue(getDispatchNode(root, 'a'), false);
    expect(root.local).toEqual({ a: false, b: false });
    queries.mockRestore();
    lookups.mockRestore();
  }
});
