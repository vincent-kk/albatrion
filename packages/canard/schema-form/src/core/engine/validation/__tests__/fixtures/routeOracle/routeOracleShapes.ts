import type { BlueprintSchema } from '@/schema-form/core/engine/blueprint';

import type { RouteOracleDialect } from './routeOracleValidators';

/** Where the load value fails relative to each union host's committed branch. */
export type RouteOracleScenario =
  | 'selected only'
  | 'unselected only'
  | 'both'
  | 'neither';

/** Scenarios run for every shape, in table order. */
export const routeOracleScenarios: readonly RouteOracleScenario[] = [
  'selected only',
  'unselected only',
  'both',
  'neither',
];

/** One schema shape of the routing matrix. */
export interface RouteOracleShape {
  /** Unique row name used as the matrix row key. */
  readonly name: string;
  /** Dialects whose validators accept the shape; absent means every dialect. */
  readonly dialects?: readonly RouteOracleDialect[];
  /** Authored schema; a fresh object per call so no run shares state with another. */
  readonly schema: () => BlueprintSchema;
  /** Load value for one scenario. */
  readonly value: (scenario: RouteOracleScenario) => unknown;
}

/**
 * `value` string per committed kind and scenario: branch `x` requires `minLength: 3`,
 * branch `y` requires `pattern: '^y'`, so every combination of passing and failing exists.
 */
const TEXT: Readonly<Record<'x' | 'y', Record<RouteOracleScenario, string>>> = {
  x: {
    'selected only': 'ya',
    'unselected only': 'abc',
    both: 'a',
    neither: 'yabc',
  },
  y: {
    'selected only': 'abc',
    'unselected only': 'ya',
    both: 'a',
    neither: 'yabc',
  },
};

/**
 * Item value that selects branch `kind` and fails as the scenario says.
 * @param kind - Discriminator value of the branch the form commits.
 * @param scenario - Where the `value` text fails.
 * @param extra - Further members of the item, such as recursive children.
 * @returns A fresh item object.
 */
const item = (
  kind: 'x' | 'y',
  scenario: RouteOracleScenario,
  extra: object = {},
) => ({ kind, value: TEXT[kind][scenario], ...extra });

/** The two discriminated branches; each branch constrains `kind` and `value`. */
const branches = () => [
  {
    properties: {
      kind: { type: 'string', const: 'x' },
      value: { type: 'string', minLength: 3 },
    },
  },
  {
    properties: {
      kind: { type: 'string', const: 'y' },
      value: { type: 'string', pattern: '^y' },
    },
  },
];

/**
 * Object schema whose own union selects by `kind`.
 * @param more - Further property schemas beside `kind` and `value`.
 * @returns A fresh union host schema.
 */
const union = (more: object = {}) => ({
  type: 'object',
  controls: { discriminator: 'kind' },
  properties: { kind: { type: 'string' }, value: { type: 'string' }, ...more },
  oneOf: branches(),
});

/** Every shape of the matrix, in report order. */
export const routeOracleShapes: readonly RouteOracleShape[] = [
  {
    name: 'property oneOf',
    schema: () => ({ type: 'object', properties: { u: union() } }),
    value: (s) => ({ u: item('x', s) }),
  },
  {
    name: 'items oneOf',
    schema: () => ({ type: 'array', items: union() }),
    value: (s) => [item('x', s), item('y', s)],
  },
  {
    name: '$ref to $defs',
    schema: () => ({
      type: 'object',
      properties: { u: { $ref: '#/$defs/item' } },
      $defs: { item: union() },
    }),
    value: (s) => ({ u: item('y', s) }),
  },
  {
    name: '$ref to definitions',
    schema: () => ({
      type: 'object',
      properties: { u: { $ref: '#/definitions/item' } },
      definitions: { item: union() },
    }),
    value: (s) => ({ u: item('y', s) }),
  },
  {
    name: 'one target at two properties',
    schema: () => ({
      type: 'object',
      properties: { u: { $ref: '#/$defs/item' }, w: { $ref: '#/$defs/item' } },
      $defs: { item: union() },
    }),
    value: (s) => ({ u: item('x', s), w: item('y', s) }),
  },
  {
    name: '$ref target holding a $ref',
    schema: () => ({
      type: 'object',
      properties: { u: { $ref: '#/$defs/item' } },
      $defs: {
        item: union({ tag: { $ref: '#/$defs/tag' } }),
        tag: { type: 'string' },
      },
    }),
    value: (s) => ({ u: item('y', s, { tag: 't' }) }),
  },
  {
    name: 'alias chain',
    schema: () => ({
      type: 'object',
      properties: { u: { $ref: '#/$defs/a' } },
      $defs: {
        a: { $ref: '#/$defs/b' },
        b: { $ref: '#/$defs/item' },
        item: union(),
      },
    }),
    value: (s) => ({ u: item('x', s) }),
  },
  {
    name: 'alias chain to a recursive definition',
    schema: () => ({
      type: 'object',
      properties: { u: { $ref: '#/$defs/a' } },
      $defs: {
        a: { $ref: '#/$defs/node' },
        node: union({ next: { type: 'array', items: { $ref: '#/$defs/a' } } }),
      },
    }),
    value: (s) => ({ u: item('x', s, { next: [item('y', s, { next: [] })] }) }),
  },
  {
    name: 'recursive object to depth 3',
    schema: () => ({
      type: 'object',
      properties: { u: { $ref: '#/$defs/node' } },
      $defs: {
        node: union({
          next: { type: 'array', items: { $ref: '#/$defs/node' } },
        }),
      },
    }),
    value: (s) => ({
      u: item('x', s, {
        next: [item('y', s, { next: [item('x', s, { next: [] })] })],
      }),
    }),
  },
  {
    name: 'recursive root $ref to depth 3',
    schema: () => ({
      $ref: '#/$defs/node',
      $defs: {
        node: union({
          next: { type: 'array', items: { $ref: '#/$defs/node' } },
        }),
      },
    }),
    value: (s) =>
      item('x', s, {
        next: [item('y', s, { next: [item('x', s, { next: [] })] })],
      }),
  },
  {
    name: 'recursive items to depth 3',
    schema: () => ({
      type: 'array',
      items: { $ref: '#/$defs/item' },
      $defs: {
        item: union({
          children: { type: 'array', items: { $ref: '#/$defs/item' } },
        }),
      },
    }),
    value: (s) => [
      item('x', s, {
        children: [
          item('y', s, { children: [item('x', s, { children: [] })] }),
        ],
      }),
    ],
  },
  {
    name: 'recursive items under a wrapper object',
    schema: () => ({
      type: 'object',
      properties: { list: { type: 'array', items: { $ref: '#/$defs/item' } } },
      $defs: {
        item: union({
          children: { type: 'array', items: { $ref: '#/$defs/item' } },
        }),
      },
    }),
    value: (s) => ({
      list: [item('y', s, { children: [item('x', s, { children: [] })] })],
    }),
  },
  {
    name: 'tuple items inline and $ref',
    dialects: ['draft-07'],
    schema: () => ({
      type: 'array',
      items: [union(), { $ref: '#/$defs/item' }],
      $defs: { item: union() },
    }),
    value: (s) => [item('x', s), item('y', s)],
  },
  {
    name: 'tuple positions',
    dialects: ['draft-07'],
    schema: () => ({
      type: 'array',
      items: [{ type: 'string' }, union(), { $ref: '#/$defs/item' }],
      $defs: { item: union() },
    }),
    value: (s) => ['t', item('y', s), item('x', s)],
  },
  {
    name: 'prefixItems inline and $ref',
    dialects: ['2020-12'],
    schema: () => ({
      type: 'array',
      prefixItems: [union(), { $ref: '#/$defs/item' }],
      $defs: { item: union() },
    }),
    value: (s) => [item('x', s), item('y', s)],
  },
  {
    name: 'prefixItems positions',
    dialects: ['2020-12'],
    schema: () => ({
      type: 'array',
      prefixItems: [{ type: 'string' }, union(), { $ref: '#/$defs/item' }],
      $defs: { item: union() },
    }),
    value: (s) => ['t', item('y', s), item('x', s)],
  },
  {
    name: 'recursive prefixItems to depth 3',
    dialects: ['2020-12'],
    schema: () => ({
      type: 'array',
      prefixItems: [{ $ref: '#/$defs/item' }],
      $defs: {
        item: union({
          children: { type: 'array', prefixItems: [{ $ref: '#/$defs/item' }] },
        }),
      },
    }),
    value: (s) => [
      item('x', s, {
        children: [
          item('y', s, { children: [item('x', s, { children: [] })] }),
        ],
      }),
    ],
  },
  {
    name: 'if then else in a recursive definition',
    schema: () => ({
      type: 'object',
      properties: { u: { $ref: '#/$defs/node' } },
      $defs: {
        node: {
          type: 'object',
          properties: {
            kind: { type: 'string' },
            value: { type: 'string' },
            next: { type: 'array', items: { $ref: '#/$defs/node' } },
          },
          if: { properties: { kind: { const: 'x' } } },
          then: { properties: { value: { minLength: 3 } } },
          else: { properties: { value: { pattern: '^y' } } },
        },
      },
    }),
    value: (s) => ({ u: item('x', s, { next: [item('y', s)] }) }),
  },
  {
    name: 'recursive branch value through $ref',
    schema: () => ({
      type: 'object',
      properties: { u: { $ref: '#/$defs/node' } },
      $defs: {
        node: {
          type: 'object',
          controls: { discriminator: 'kind' },
          properties: {
            kind: { type: 'string' },
            value: { type: 'string' },
            next: { type: 'array', items: { $ref: '#/$defs/node' } },
          },
          oneOf: [
            {
              properties: {
                kind: { const: 'x' },
                value: { $ref: '#/$defs/x' },
              },
            },
            {
              properties: {
                kind: { const: 'y' },
                value: { $ref: '#/$defs/y' },
              },
            },
          ],
        },
        x: { type: 'string', minLength: 3 },
        y: { type: 'string', pattern: '^y' },
      },
    }),
    value: (s) => ({ u: item('x', s, { next: [item('y', s)] }) }),
  },
  {
    name: 'one definition in a selected and an unselected branch',
    schema: () => ({
      type: 'object',
      properties: {
        u: {
          type: 'object',
          controls: { discriminator: 'kind' },
          properties: { kind: { type: 'string' }, value: { type: 'string' } },
          oneOf: [
            {
              properties: {
                kind: { const: 'x' },
                value: { $ref: '#/$defs/rule' },
              },
            },
            {
              properties: {
                kind: { const: 'y' },
                value: { $ref: '#/$defs/rule' },
              },
            },
          ],
        },
      },
      $defs: { rule: { type: 'string', minLength: 3 } },
    }),
    value: (s) => ({ u: item('x', s) }),
  },
  {
    name: 'recursive required additionalProperties and not',
    schema: () => ({
      type: 'array',
      items: { $ref: '#/$defs/node' },
      $defs: {
        node: {
          type: 'object',
          controls: { discriminator: 'kind' },
          properties: {
            kind: { type: 'string' },
            value: { type: 'string' },
            need: { type: 'string' },
            next: { type: 'array', items: { $ref: '#/$defs/node' } },
          },
          oneOf: [
            {
              properties: { kind: { const: 'x' }, value: { minLength: 3 } },
              required: ['need'],
            },
            {
              properties: {
                kind: { const: 'y' },
                value: { pattern: '^y' },
                next: {},
              },
              additionalProperties: false,
              not: { required: ['nope'] },
            },
          ],
        },
      },
    }),
    value: (s) => [
      item('x', s, { next: [item('y', s, { next: [], extra: 1, nope: 1 })] }),
    ],
  },
  {
    name: 'root oneOf beside a recursive definition',
    schema: () => ({
      ...union({ child: { type: 'array', items: { $ref: '#/$defs/node' } } }),
      $defs: {
        node: union({
          child: { type: 'array', items: { $ref: '#/$defs/node' } },
        }),
      },
    }),
    value: (s) =>
      item('y', s, {
        child: [item('x', s, { child: [item('y', s, { child: [] })] })],
      }),
  },
  {
    name: 'root oneOf beside inline item oneOf',
    schema: () => union({ list: { type: 'array', items: union() } }),
    value: (s) => item('y', s, { list: [item('x', s), item('y', s)] }),
  },
  {
    name: 'inline oneOf inside a branch',
    schema: () => ({
      type: 'object',
      properties: {
        u: {
          ...union(),
          oneOf: [
            {
              properties: {
                kind: { type: 'string', const: 'x' },
                value: { type: 'string', minLength: 3 },
                inner: union(),
              },
            },
            {
              properties: {
                kind: { type: 'string', const: 'y' },
                value: { type: 'string', pattern: '^y' },
              },
            },
          ],
        },
      },
    }),
    value: (s) => ({ u: item('x', s, { inner: item('y', s) }) }),
  },
  {
    name: 'oneOf beside $ref and inside its target',
    schema: () => ({
      type: 'object',
      properties: { u: { $ref: '#/$defs/item', ...union() } },
      $defs: { item: union() },
    }),
    value: (s) => ({ u: item('x', s) }),
  },
  {
    name: 'inline $ref ending in allOf index',
    schema: () => ({
      type: 'object',
      properties: { u: { $ref: '#/$defs/wrap/allOf/0' } },
      $defs: { wrap: { allOf: [union()] } },
    }),
    value: (s) => ({ u: item('y', s) }),
  },
  {
    name: 'oneOf under dependentSchemas',
    schema: () => ({
      type: 'object',
      properties: {
        u: {
          type: 'object',
          controls: { discriminator: 'kind' },
          properties: {
            kind: { type: 'string' },
            value: { type: 'string' },
            flag: { type: 'boolean' },
          },
          dependentSchemas: { flag: { oneOf: branches() } },
        },
      },
    }),
    value: (s) => ({ u: item('x', s, { flag: true }) }),
  },
  {
    name: 'if then inside a branch',
    schema: () => ({
      type: 'object',
      properties: {
        u: {
          ...union(),
          oneOf: [
            {
              properties: { kind: { const: 'x' } },
              if: { properties: { value: { minLength: 1 } } },
              then: { properties: { value: { minLength: 3 } } },
            },
            { properties: { kind: { const: 'y' }, value: { pattern: '^y' } } },
          ],
        },
      },
    }),
    value: (s) => ({ u: item('x', s) }),
  },
  {
    name: 'oneOf inside a oneOf branch at one host',
    schema: () => ({
      type: 'object',
      properties: {
        u: {
          ...union(),
          oneOf: [
            {
              oneOf: [
                {
                  properties: { kind: { const: 'x' }, value: { minLength: 3 } },
                },
                {
                  properties: { kind: { const: 'z' }, value: { maxLength: 0 } },
                },
              ],
            },
            { properties: { kind: { const: 'y' }, value: { pattern: '^y' } } },
          ],
        },
      },
    }),
    value: (s) => ({ u: item('x', s) }),
  },
];
