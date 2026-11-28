import type { BoundaryScene } from '../types';

/** Child consistency: a branch whose selected schema changes keeps children chosen under the old one. */
export const childConsistencyScenes: readonly BoundaryScene[] = [
  {
    id: 'child-consistency/if-turned-off-two-levels-up',
    origin:
      'acceptance line C: an if without else turns off and its declaration two levels down stays',
    schema: {
      type: 'object',
      properties: {
        k: { type: 'string' },
        list: {
          type: 'array',
          items: { type: 'object', properties: { v: { type: 'string' } } },
        },
      },
      allOf: [
        {
          if: { properties: { k: { const: '1' } }, required: ['k'] },
          then: {
            properties: {
              list: { items: { properties: { v: { maxLength: 5 } } } },
            },
          },
        },
      ],
    },
    load: { k: '1', list: [{ v: 'a' }] },
    steps: [{ note: 'load' }, { set: '/k', value: '0' }],
    probes: ['schema.maxLength /list/0/v'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: {
      'load: schema.maxLength /list/0/v': 5,
      'schema.maxLength /list/0/v': undefined,
    },
    difference:
      'the item keeps the schema chosen while the gate was on, unlike a fresh load of the same values',
    known: {
      sequential: {
        'load: schema.maxLength /list/0/v': 5,
        'schema.maxLength /list/0/v': 5,
      },
      fresh: { 'schema.maxLength /list/0/v': undefined },
    },
  },
];
