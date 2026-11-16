import { expect, it, vi } from 'vitest';

import { createTestValidator } from '@/schema-form/core/__tests__/fixtures/createTestValidator';
import {
  dispatchRemove,
  dispatchUpdate,
} from '@/schema-form/core/engine/write';

import { createValidatorCopy } from '../utils/copy/createValidatorCopy';
import { readFieldNodeErrors } from '../utils/read/readFieldNodeErrors';
import { routeValidationIssues } from '../utils/route/routeValidationIssues';
import { createRoutingTree } from './fixtures/createRoutingTree';

/** Explicit branches share a field but impose different constraints. */
const item = {
  type: 'object' as const,
  controls: { discriminator: 'kind' },
  properties: {
    kind: { type: 'string' as const },
    value: { type: 'string' as const },
  },
  oneOf: [
    { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
    { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
  ],
};

it.each([false, true])(
  'filters actual AJV errors per array item with mixed branches=%s',
  async (mixed) => {
    const schema = { type: 'array' as const, items: item };
    const value = mixed
      ? [
          { kind: 'x', value: 'a' },
          { kind: 'y', value: 'a' },
        ]
      : [{ kind: 'x', value: 'a' }];
    const validator = createTestValidator();
    const root = createRoutingTree({
      jsonSchema: schema,
      defaultValue: value,
      validator,
    });
    const issues = (await validator.compile(createValidatorCopy(schema))(
      value,
    ))!;
    routeValidationIssues([root], issues);
    for (let index = 0; index < value.length; index++) {
      const node = root.childrenByName![index].childrenByName!.value;
      expect(
        readFieldNodeErrors(node).map((issue) => issue.schemaPath),
      ).toEqual([`#/items/oneOf/${index}/properties/value/minLength`]);
    }
    expect(root.runtime.globalErrors).toBe(issues);
  },
);

it('keeps branch selection attached to an item after removal shifts its address', () => {
  const root = createRoutingTree({
    jsonSchema: { type: 'array', items: item },
    defaultValue: [
      { kind: 'x', value: 'a' },
      { kind: 'y', value: 'a' },
    ],
  });
  dispatchRemove(root, 0);
  const issues = [0, 1].map((branch) => ({
    dataPath: '/0/value',
    schemaPath: `#/items/oneOf/${branch}/properties/value/minLength`,
  }));
  routeValidationIssues([root], issues);
  expect(
    readFieldNodeErrors(root.childrenByName!['0'].childrenByName!.value),
  ).toEqual([issues[1]]);
});

it('binds every level of nested array templates independently', () => {
  const root = createRoutingTree({
    jsonSchema: { type: 'array', items: { type: 'array', items: item } },
    defaultValue: [[{ kind: 'x', value: 'a' }], [{ kind: 'y', value: 'a' }]],
  });
  const issues = [0, 1].flatMap((row) =>
    [0, 1].map((branch) => ({
      dataPath: `/${row}/0/value`,
      schemaPath: `#/items/items/oneOf/${branch}/properties/value/minLength`,
    })),
  );
  routeValidationIssues([root], issues);
  expect(
    readFieldNodeErrors(
      root.childrenByName!['0'].childrenByName!['0'].childrenByName!.value,
    ),
  ).toEqual([issues[0]]);
  expect(
    readFieldNodeErrors(
      root.childrenByName!['1'].childrenByName!['0'].childrenByName!.value,
    ),
  ).toEqual([issues[3]]);
});

it('refreshes anyOf selection without retaining the previous routing cache', () => {
  const { oneOf, ...base } = item;
  const root = createRoutingTree({
    jsonSchema: { type: 'array', items: { ...base, anyOf: oneOf } },
    defaultValue: [{ kind: 'x', value: 'a' }],
  });
  const issues = [0, 1].map((branch) => ({
    dataPath: '/0/value',
    schemaPath: `#/items/anyOf/${branch}/properties/value/minLength`,
  }));
  routeValidationIssues([root], issues);
  expect(
    readFieldNodeErrors(root.childrenByName!['0'].childrenByName!.value),
  ).toEqual([issues[0]]);
  dispatchUpdate(root, 0, { kind: 'y', value: 'a' });
  routeValidationIssues([root], issues);
  expect(
    readFieldNodeErrors(root.childrenByName!['0'].childrenByName!.value),
  ).toEqual([issues[1]]);
});

it('preserves host errors and unknown schema locations in the full result', () => {
  const root = createRoutingTree({
    jsonSchema: { type: 'array', items: item },
    defaultValue: [{ kind: 'x', value: 'a' }],
  });
  const host = {
    dataPath: '/0',
    schemaPath: '#/items/oneOf',
    keyword: 'oneOf',
  };
  const unknown = {
    dataPath: '/0/value',
    schemaPath: '#/$defs/unknown/minLength',
  };
  routeValidationIssues([root], [host, unknown]);
  expect(readFieldNodeErrors(root.childrenByName!['0'])).toEqual([host]);
  expect(
    readFieldNodeErrors(root.childrenByName!['0'].childrenByName!.value),
  ).toEqual([unknown]);
  expect(root.runtime.globalErrors).toEqual([host, unknown]);
});

it.each([false, true])(
  'rebinds reused reference hosts with array=%s',
  (array) => {
    const ref = { $ref: '#/$defs/item' };
    const property = array ? { type: 'array' as const, items: ref } : ref;
    const schema = {
      type: 'object' as const,
      $defs: { item },
      properties: { a: property, b: property },
    };
    const value = { kind: 'x', value: 'a' };
    const root = createRoutingTree({
      jsonSchema: schema,
      defaultValue: { a: array ? [value] : value, b: array ? [value] : value },
    });
    const path = array ? '/b/0/value' : '/b/value';
    const issues = [0, 1].map((branch) => ({
      dataPath: path,
      schemaPath: `#/$defs/item/oneOf/${branch}/properties/value/minLength`,
    }));
    routeValidationIssues([root], issues);
    const host = root.childrenByName!.b;
    const field = (array ? host.childrenByName!['0'] : host).childrenByName!
      .value;
    expect(readFieldNodeErrors(field)).toEqual([issues[0]]);
  },
);

it('indexes only live nodes of the queried host once for repeated issues', () => {
  const root = createRoutingTree({
    jsonSchema: { type: 'array', items: item },
    defaultValue: [
      { kind: 'x', value: 'a' },
      { kind: 'y', value: 'a' },
    ],
  });
  const reads = vi.spyOn(root.runtime.committedDeclarationIds!, 'get');
  const issue = {
    dataPath: '/0/value',
    schemaPath: '#/items/oneOf/1/properties/value/minLength',
  };
  try {
    routeValidationIssues(
      [root],
      Array.from({ length: 20 }, () => issue),
    );
    expect(
      readFieldNodeErrors(root.childrenByName!['0'].childrenByName!.value),
    ).toEqual([]);
    expect(reads).toHaveBeenCalledTimes(3);
  } finally {
    reads.mockRestore();
  }
});
