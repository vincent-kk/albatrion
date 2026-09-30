import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import {
  type BooleanNode,
  type ObjectNode,
  type StringNode,
  nodeFromJSONSchema,
} from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

/**
 * Node-tree twin of the `[default-after-null]` cases in
 * `nullable.object-blank-state.render.test.tsx`: what a node was built with
 * outlives a `null`, and `resetSubtree()` brings it back from any node.
 */
describe('ObjectNode branch — the initial value after the object was null', () => {
  const schema = {
    type: 'object',
    properties: {
      target: {
        type: ['object', 'null'],
        properties: {
          kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
          note: { type: 'string', default: 'N' },
          flag: { type: 'boolean', default: true },
          extra: {
            type: 'string',
            default: 'E',
            computed: { active: '../flag === true' },
          },
        },
        oneOf: [
          {
            '&if': "./kind === 'a'",
            properties: { aValue: { type: 'string' } },
          },
          {
            '&if': "./kind === 'b'",
            properties: { bValue: { type: 'string', default: 'B' } },
          },
        ],
      },
    },
  } satisfies JSONSchema;
  const seed = {
    target: { kind: 'b', note: 'seeded', flag: true, extra: 'x', bValue: 'x' },
  };

  /** Builds the seeded form and takes `target` through `null` and back by a child write. */
  const throughNull = async () => {
    const node = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: seed,
    });
    await delay(10);
    (node.find('target') as ObjectNode).setValue(null);
    await delay(10);
    (node.find('target/note') as StringNode).setValue('typed');
    await delay(10);
    return node;
  };

  /** Switches the branch away and back, and turns `extra` off and on. */
  const roundTrip = async (node: Awaited<ReturnType<typeof throughNull>>) => {
    (node.find('target/kind') as StringNode).setValue('a');
    await delay(10);
    (node.find('target/kind') as StringNode).setValue('b');
    await delay(10);
    (node.find('target/flag') as BooleanNode).setValue(false);
    await delay(10);
    (node.find('target/flag') as BooleanNode).setValue(true);
    await delay(10);
    return node.value;
  };

  it('[default-after-null] keeps the restores blank while nothing was reset', async () => {
    const node = await throughNull();
    (node.find('target/kind') as StringNode).setValue('b');
    await delay(10);

    expect(await roundTrip(node)).toEqual({
      target: { kind: 'b', note: 'typed', flag: true, extra: 'E', bValue: 'B' },
    });
  });

  it('[default-after-null] a reset form round-trips like a form just built', async () => {
    const fresh = nodeFromJSONSchema({
      onChange: () => {},
      jsonSchema: schema,
      defaultValue: seed,
    });
    await delay(10);
    const node = await throughNull();
    node.resetSubtree();
    await delay(10);

    expect(node.value).toEqual(seed);
    expect(await roundTrip(node)).toEqual(await roundTrip(fresh));
  });
});
