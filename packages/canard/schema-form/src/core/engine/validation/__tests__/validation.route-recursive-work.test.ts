import { expect, it, vi } from 'vitest';

import * as pointer from '@/schema-form/helpers/jsonPointer';

import { readFieldNodeErrors } from '../utils/read/readFieldNodeErrors';
import { routeValidationIssues } from '../utils/route/routeValidationIssues';
import { createRoutingTree } from './fixtures/createRoutingTree';

/** Recursive hosts reuse the same branch definitions at every occurrence. */
const schema = {
  type: 'array' as const,
  items: { $ref: '#/$defs/item' },
  $defs: {
    item: {
      type: 'object' as const,
      controls: { discriminator: 'kind' },
      properties: {
        kind: { type: 'string' as const },
        value: { type: 'string' as const },
        children: { type: 'array' as const, items: { $ref: '#/$defs/item' } },
      },
      oneOf: [
        { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
        { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
      ],
    },
  },
};

it.each(['outer-first', 'inner-first'] as const)(
  'reads each live declaration at most once with %s errors',
  (order) => {
    let value: unknown;
    for (let i = 15; i >= 0; i--)
      value = {
        kind: i % 2 ? 'y' : 'x',
        value: 'a',
        children: value ? [value] : [],
      };
    const root = createRoutingTree({
      jsonSchema: schema,
      defaultValue: [value],
    });
    const nodes = [];
    const pending = [root];
    while (pending.length) {
      const node = pending.pop()!;
      nodes.push(node);
      pending.push(...(node.children ?? []));
    }
    const fields = nodes.filter((node) => node.name === 'value');
    const issues = fields.flatMap((node) =>
      [0, 1].map((branch) => ({
        dataPath: node.path,
        schemaPath: `#/$defs/item/oneOf/${branch}/properties/value/minLength`,
      })),
    );
    issues.sort((a, b) =>
      order === 'outer-first'
        ? a.dataPath.length - b.dataPath.length
        : b.dataPath.length - a.dataPath.length,
    );
    const paths = vi.spyOn(pointer, 'parsePointer');
    const reads = vi.spyOn(root.runtime.committedDeclarationIds!, 'get');
    try {
      routeValidationIssues([root], issues);
      expect(paths).toHaveBeenCalledTimes(fields.length);
      expect(reads.mock.calls.length).toBeLessThanOrEqual(nodes.length);
      for (const field of fields) {
        const kind = field.parent!.childrenByName!.kind.storedValue;
        const branch = kind === 'x' ? 0 : 1;
        expect(
          readFieldNodeErrors(field).map((issue) => issue.schemaPath),
        ).toEqual([`#/$defs/item/oneOf/${branch}/properties/value/minLength`]);
      }
      expect(new Set(reads.mock.calls.map(([key]) => key)).size).toBe(
        reads.mock.calls.length,
      );
      expect(root.runtime.globalErrors).toBe(issues);
    } finally {
      reads.mockRestore();
      paths.mockRestore();
    }
  },
);

it.each([1, 100])(
  'does not scan %i unrelated rows for a root branch issue',
  (count) => {
    const root = createRoutingTree({
      jsonSchema: {
        type: 'object',
        controls: { discriminator: 'kind' },
        properties: {
          kind: { type: 'string' },
          value: { type: 'string' },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: { a: { type: 'string' }, b: { type: 'string' } },
            },
          },
        },
        oneOf: [
          { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
          { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
        ],
      },
      defaultValue: {
        kind: 'x',
        value: 'a',
        rows: Array.from({ length: count }, () => ({ a: 'a', b: 'b' })),
      },
    });
    const reads = vi.spyOn(root.runtime.committedDeclarationIds!, 'get');
    const issue = {
      dataPath: '/value',
      schemaPath: '#/oneOf/1/properties/value/minLength',
    };
    try {
      routeValidationIssues([root], [issue]);
      expect(readFieldNodeErrors(root.childrenByName!.value)).toEqual([]);
      expect(reads).toHaveBeenCalledTimes(3);
    } finally {
      reads.mockRestore();
    }
  },
);
