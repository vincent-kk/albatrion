import type { AuthoredSchema } from '../../../../engine';
import type { BoundaryScene } from '../types';

/** Error schema path of the `x` branch, relative to the item definition. */
const BRANCH_X = '#/oneOf/0/properties/value/minLength';
/** Error schema path of the `y` branch, relative to the item definition. */
const BRANCH_Y = '#/oneOf/1/properties/value/minLength';

/**
 * Union host selected by `kind`: branch `x` requires `value` of `minLength: 3`, branch `y` requires `value` matching `^y`.
 * A `value` of `'a'` fails both branches, so a reading shows which branch's issue reaches the node.
 * @param more - Further property schemas beside `kind` and `value`.
 * @returns A fresh union host schema.
 */
const union = (more: Record<string, AuthoredSchema> = {}): AuthoredSchema => ({
  type: 'object',
  controls: { discriminator: 'kind' },
  properties: { kind: { type: 'string' }, value: { type: 'string' }, ...more },
  oneOf: [
    { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
    { properties: { kind: { const: 'y' }, value: { pattern: '^y' } } },
  ],
});

/** Validation routing: the errors a selected branch reports reach the node of that branch only. */
export const validationRoutingScenes: readonly BoundaryScene[] = [
  {
    id: 'validation-routing/recursive-item-branch-errors',
    origin:
      'settlement evaluation E5a, split from item-gates/nested-item-takes-own-branch: the error readings of each item',
    schema: {
      type: 'array',
      items: { $ref: '#/$defs/item' },
      $defs: {
        item: {
          type: 'object',
          properties: {
            kind: { type: 'string' },
            value: { type: 'string' },
            children: { type: 'array', items: { $ref: '#/$defs/item' } },
          },
          controls: { discriminator: 'kind' },
          oneOf: [
            { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
            { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
          ],
        },
      },
    },
    load: [
      {
        kind: 'x',
        value: 'a',
        children: [
          { kind: 'x', value: 'a', children: [] },
          { kind: 'x', value: 'a', children: [] },
        ],
      },
    ],
    validates: true,
    steps: [
      { set: '/0/children/0/kind', value: 'y' },
      { set: '/0/children/1/kind', value: 'y' },
      { push: '/0/children', value: { kind: 'y', value: 'a', children: [] } },
      { validate: true },
    ],
    probes: [
      'errors /0/value',
      'errors /0/children/0/value',
      'errors /0/children/2/value',
    ],
    modes: ['sequential'],
    state: 'expected',
    expected: {
      'errors /0/value': [BRANCH_X],
      'errors /0/children/0/value': [BRANCH_Y],
      'errors /0/children/2/value': [BRANCH_Y],
    },
  },
  {
    id: 'validation-routing/alias-chain-branch-errors',
    origin:
      'validation branch routing: a reference that reaches the union through another reference',
    schema: {
      type: 'object',
      properties: { u: { $ref: '#/$defs/a' } },
      $defs: {
        a: { $ref: '#/$defs/b' },
        b: { $ref: '#/$defs/item' },
        item: union(),
      },
    },
    load: { u: { kind: 'x', value: 'a' } },
    validates: true,
    steps: [{ validate: true }],
    probes: ['errors /u/value'],
    modes: ['sequential'],
    state: 'expected',
    expected: {
      'errors /u/value': ['#/$defs/a/oneOf/0/properties/value/minLength'],
    },
  },
  {
    id: 'validation-routing/reference-target-holding-a-reference',
    origin:
      'validation branch routing: the union sits in a reference target that holds a reference of its own',
    schema: {
      type: 'object',
      properties: { u: { $ref: '#/$defs/item' } },
      $defs: {
        item: union({ tag: { $ref: '#/$defs/tag' } }),
        tag: { type: 'string' },
      },
    },
    load: { u: { kind: 'y', value: 'a', tag: 't' } },
    validates: true,
    steps: [{ validate: true }],
    probes: ['errors /u/value'],
    modes: ['sequential'],
    state: 'expected',
    expected: { 'errors /u/value': ['#/oneOf/1/properties/value/pattern'] },
  },
  {
    id: 'validation-routing/root-union-repeated-by-nested-items',
    origin:
      'validation branch routing: a nested item issue was resolved to the root union and the selected branch issue was dropped',
    schema: {
      ...union({ list: { type: 'array', items: { $ref: '#/$defs/item' } } }),
      $defs: {
        item: union({
          list: { type: 'array', items: { $ref: '#/$defs/item' } },
        }),
      },
    },
    load: {
      kind: 'y',
      value: 'yabc',
      list: [{ kind: 'x', value: 'a', list: [] }],
    },
    validates: true,
    steps: [{ validate: true }],
    probes: ['errors /value', 'errors /list/0/value'],
    modes: ['sequential'],
    state: 'expected',
    expected: {
      'errors /value': [],
      'errors /list/0/value': ['#/oneOf/0/properties/value/minLength'],
    },
  },
  {
    id: 'validation-routing/two-unions-fit-a-separately-compiled-location',
    origin:
      'validation branch routing: a union beside a reference and another inside its separately compiled target',
    schema: {
      type: 'object',
      properties: { u: { $ref: '#/$defs/item', ...union() } },
      $defs: {
        item: union({ tag: { $ref: '#/$defs/tag' } }),
        tag: { type: 'string' },
      },
    },
    load: { u: { kind: 'x', value: 'a', tag: 't' } },
    validates: true,
    steps: [{ validate: true }],
    probes: ['errors /u/value'],
    modes: ['sequential'],
    state: 'known',
    expected: {
      'errors /u/value': [
        '#/oneOf/0/properties/value/minLength',
        '#/properties/u/oneOf/0/properties/value/minLength',
      ],
    },
    difference:
      "the unselected branch's pattern error of the target union stays visible: the target is compiled separately, so its location restarts at `#/oneOf/1` and fits both unions of the host, and an issue whose branch cannot be decided is kept",
    known: {
      sequential: {
        'errors /u/value': [
          '#/oneOf/0/properties/value/minLength',
          '#/oneOf/1/properties/value/pattern',
          '#/properties/u/oneOf/0/properties/value/minLength',
        ],
      },
    },
  },
];
