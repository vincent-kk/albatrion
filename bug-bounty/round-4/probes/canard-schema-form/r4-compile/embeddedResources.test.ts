import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

const attempt = <T>(fn: () => T): T | { error: string } => {
  try {
    return fn();
  } catch (error) {
    return { error: String((error as any)?.code ?? error) };
  }
};

/** Type AJV (2020-12) accepts at `path` among string and number probes. */
const ajvType = (schema: any, wrap: (leaf: unknown) => unknown) => {
  const validate = new Ajv2020({ strict: false }).compile(schema);
  const accepts = (leaf: unknown) => validate(wrap(leaf));
  return accepts('s') && !accepts(1) ? 'string' : accepts(1) && !accepts('s') ? 'number' : 'other';
};

const cases: Array<{
  name: string;
  schema: any;
  path: string;
  wrap: (leaf: unknown) => unknown;
}> = [
  {
    name: 'E1 inline embedded resource whose child refs #/$defs/X',
    schema: {
      $id: 'https://example.test/root.json',
      type: 'object',
      properties: {
        a: {
          $id: 'https://example.test/a.json',
          type: 'object',
          properties: { x: { $ref: '#/$defs/X' } },
          $defs: { X: { type: 'string', default: 'inner' } },
        },
      },
      $defs: { X: { type: 'number', default: 1 } },
    },
    path: '/a/x',
    wrap: (leaf) => ({ a: { x: leaf } }),
  },
  {
    name: 'E2 embedded resource as an allOf member whose own allOf refs #/$defs/X (type inferred from it)',
    schema: {
      $id: 'https://example.test/root.json',
      type: 'object',
      properties: {
        a: {
          allOf: [
            {
              $id: 'https://example.test/a.json',
              allOf: [{ $ref: '#/$defs/X' }],
              $defs: { X: { type: 'string', default: 'inner' } },
            },
          ],
        },
      },
      $defs: { X: { type: 'number', default: 1 } },
    },
    path: '/a',
    wrap: (leaf) => ({ a: leaf }),
  },
  {
    name: 'E3 property with $id whose allOf member refs #/$defs/X',
    schema: {
      $id: 'https://example.test/root.json',
      type: 'object',
      properties: {
        a: {
          $id: 'https://example.test/a.json',
          allOf: [{ $ref: '#/$defs/X' }],
          $defs: { X: { type: 'string', default: 'inner' } },
        },
      },
      $defs: { X: { type: 'number', default: 1 } },
    },
    path: '/a',
    wrap: (leaf) => ({ a: leaf }),
  },
  {
    name: 'E4 relative URI reference a.json#/$defs/X from the root',
    schema: {
      $id: 'https://example.test/root.json',
      type: 'object',
      properties: { v: { $ref: 'a.json#/$defs/X' } },
      $defs: {
        A: {
          $id: 'https://example.test/a.json',
          $defs: { X: { type: 'string', default: 'inner' } },
        },
        X: { type: 'number', default: 1 },
      },
    },
    path: '/v',
    wrap: (leaf) => ({ v: leaf }),
  },
  {
    name: 'E5 nested resource with a relative $id resolved against its parent resource',
    schema: {
      $id: 'https://example.test/root.json',
      type: 'object',
      properties: { v: { $ref: 'https://example.test/dir/b.json' } },
      $defs: {
        A: {
          $id: 'https://example.test/dir/a.json',
          $defs: { B: { $id: 'b.json', type: 'string', default: 'inner' } },
        },
        B: { $id: 'https://example.test/b.json', type: 'number', default: 1 },
      },
    },
    path: '/v',
    wrap: (leaf) => ({ v: leaf }),
  },
  {
    name: 'E6 $ref "#" inside an embedded resource means that resource',
    schema: {
      $id: 'https://example.test/root.json',
      type: 'object',
      properties: {
        n: { $ref: '#/$defs/Leaf' },
        tag: { type: 'number', default: 1 },
      },
      $defs: {
        Leaf: {
          $id: 'https://example.test/leaf.json',
          type: 'object',
          properties: {
            tag: { type: 'string', default: 'leaf' },
            self: { $ref: '#/properties/tag' },
          },
        },
      },
    },
    path: '/n/self',
    wrap: (leaf) => ({ n: { tag: 'leaf', self: leaf } }),
  },
];

describe('embedded $id resources against AJV 2020-12 (round 3 item 15 neighbors)', () => {
  for (const { name, schema, path, wrap } of cases) {
    it(name, () => {
      const expected = ajvType(schema, wrap);
      const actual = attempt(() => tree(schema, {}).find(path)?.type ?? 'missing');
      expect({ form: actual }).toEqual({ form: expected });
    });
  }
});
