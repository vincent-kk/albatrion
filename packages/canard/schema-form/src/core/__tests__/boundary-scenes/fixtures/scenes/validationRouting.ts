import type { BoundaryScene } from '../types';

/** Error schema path of the `x` branch, relative to the item definition. */
const BRANCH_X = '#/oneOf/0/properties/value/minLength';
/** Error schema path of the `y` branch, relative to the item definition. */
const BRANCH_Y = '#/oneOf/1/properties/value/minLength';

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
    state: 'known',
    expected: {
      'errors /0/value': [BRANCH_X],
      'errors /0/children/0/value': [BRANCH_Y],
      'errors /0/children/2/value': [BRANCH_Y],
    },
    difference:
      "every nested item of the recursive list reports the minLength errors of both oneOf branches instead of only its own kind's branch",
    known: {
      sequential: {
        'errors /0/value': [BRANCH_X],
        'errors /0/children/0/value': [BRANCH_X, BRANCH_Y],
        'errors /0/children/2/value': [BRANCH_X, BRANCH_Y],
      },
    },
  },
];
