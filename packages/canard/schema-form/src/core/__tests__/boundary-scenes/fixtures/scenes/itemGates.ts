import type { AuthoredSchema } from '../../../../engine';
import type { BoundaryScene } from '../types';

/** An item that recurses through `children`, with a gate declared on the item template. */
const recursiveItems = (gate: Record<string, unknown>): AuthoredSchema => ({
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
      ...gate,
    },
  },
});

/** Each item takes the `oneOf` branch of its own `kind`: `x` needs 3 characters, `y` needs 5. */
const ownBranch = recursiveItems({
  controls: { discriminator: 'kind' },
  oneOf: [
    { properties: { kind: { const: 'x' }, value: { minLength: 3 } } },
    { properties: { kind: { const: 'y' }, value: { minLength: 5 } } },
  ],
});

/** A `strict` item declares a 3-character minimum on the values of its child items. */
const childDeclaration = recursiveItems({
  if: { properties: { kind: { const: 'strict' } }, required: ['kind'] },
  then: {
    properties: {
      children: { items: { properties: { value: { minLength: 3 } } } },
    },
  },
});

/** Error schema path of the `x` branch, relative to the item definition. */
const BRANCH_X = '#/oneOf/0/properties/value/minLength';
/** Error schema path of the `y` branch, relative to the item definition. */
const BRANCH_Y = '#/oneOf/1/properties/value/minLength';

/** A strict item over a loose child, and a loose item over a strict child, each with one grandchild. */
const strictAndLoose = [
  {
    kind: 'strict',
    value: 'a',
    children: [
      {
        kind: 'loose',
        value: 'b',
        children: [{ kind: 'loose', value: 'g', children: [] }],
      },
    ],
  },
  {
    kind: 'loose',
    value: 'c',
    children: [
      {
        kind: 'strict',
        value: 'd',
        children: [{ kind: 'loose', value: 'h', children: [] }],
      },
    ],
  },
];

/** Item gates: a gate on an item template evaluated for the wrong instance, in plain and recursive lists. */
export const itemGateScenes: readonly BoundaryScene[] = [
  {
    id: 'item-gates/nested-item-takes-own-branch',
    origin:
      'settlement evaluation E5a and design section 12: nested items take the branch of the outer item',
    schema: ownBranch,
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
    state: 'known',
    expected: {
      'errors /0/value': [BRANCH_X],
      'errors /0/children/0/value': [BRANCH_Y],
      'errors /0/children/2/value': [BRANCH_Y],
    },
    difference:
      "every item of the recursive list, the outer item included, reports the minLength errors of both oneOf branches instead of only its own kind's branch",
    known: {
      sequential: {
        'errors /0/value': [BRANCH_X, BRANCH_Y],
        'errors /0/children/0/value': [BRANCH_X, BRANCH_Y],
        'errors /0/children/2/value': [BRANCH_X, BRANCH_Y],
      },
    },
  },
  {
    id: 'item-gates/outer-item-declares-on-its-children',
    origin:
      'settlement evaluation E6 (if form, depth one): an outer instance declares on its child items',
    schema: childDeclaration,
    load: strictAndLoose,
    steps: [{ note: 'mount' }, { set: '/1/kind', value: 'strict' }],
    probes: [
      'schema.minLength /0/children/0/value',
      'schema.minLength /1/children/0/value',
    ],
    modes: ['sequential', 'fresh'],
    state: 'expected',
    expected: {
      'mount: schema.minLength /0/children/0/value': 3,
      'mount: schema.minLength /1/children/0/value': undefined,
      'schema.minLength /0/children/0/value': 3,
      'schema.minLength /1/children/0/value': 3,
    },
  },
  {
    id: 'item-gates/outer-item-declares-at-depth-two',
    origin:
      'settlement evaluation E6 (if form, depth two): the declaration of a depth-one item on its children',
    schema: childDeclaration,
    load: strictAndLoose,
    steps: [{ note: 'mount' }, { set: '/1/kind', value: 'strict' }],
    probes: [
      'schema.minLength /0/children/0/children/0/value',
      'schema.minLength /1/children/0/children/0/value',
    ],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: {
      'mount: schema.minLength /0/children/0/children/0/value': undefined,
      'mount: schema.minLength /1/children/0/children/0/value': 3,
      'schema.minLength /0/children/0/children/0/value': undefined,
      'schema.minLength /1/children/0/children/0/value': 3,
    },
    difference:
      'at mount the depth-two declaration is decided by the outermost item /1 instead of /1/children/0, so the child of the strict /1/children/0 gets no minLength',
    known: {
      sequential: {
        'mount: schema.minLength /0/children/0/children/0/value': undefined,
        'mount: schema.minLength /1/children/0/children/0/value': undefined,
        'schema.minLength /0/children/0/children/0/value': undefined,
        'schema.minLength /1/children/0/children/0/value': 3,
      },
      fresh: {
        'schema.minLength /0/children/0/children/0/value': undefined,
        'schema.minLength /1/children/0/children/0/value': 3,
      },
    },
  },
  {
    id: 'item-gates/item-level-if-on-the-item-itself',
    origin:
      'settlement evaluation E12b: an item-level if/then adds a keyword to the item itself',
    schema: {
      type: 'object',
      properties: {
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: { k: { type: 'string' } },
            if: { properties: { k: { const: 'n' } }, required: ['k'] },
            then: { minProperties: 2 },
          },
        },
      },
    },
    load: { list: [{ k: 'n' }, { k: 's' }] },
    steps: [],
    probes: ['schema.minProperties /list/0', 'schema.minProperties /list/1'],
    modes: ['sequential'],
    state: 'known',
    expected: {
      'schema.minProperties /list/0': 2,
      'schema.minProperties /list/1': undefined,
    },
    difference:
      'the then of an item-level if is not composed into the item schema',
    known: {
      sequential: {
        'schema.minProperties /list/0': undefined,
        'schema.minProperties /list/1': undefined,
      },
    },
  },
];
