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
    state: 'expected',
    expected: {
      'load: schema.maxLength /list/0/v': 5,
      'schema.maxLength /list/0/v': undefined,
    },
  },
  {
    id: 'child-consistency/omit-empty-two-levels-below-gate',
    origin:
      'gate binding known limit, a condition reading an output its own branch changes: a gate keeps its own branch through an omitEmpty option it turns off two levels below it',
    schema: {
      type: 'object',
      properties: {
        o: {
          type: 'object',
          properties: {
            p: { type: 'object', properties: { x: { type: 'string' } } },
          },
        },
      },
      if: { required: ['o'] },
      then: {
        properties: {
          o: { properties: { p: { options: { omitEmpty: false } } } },
        },
      },
    },
    load: { o: { p: { x: 'a' } } },
    steps: [{ note: 'load' }, { set: '/o/p/x', value: undefined }],
    probes: ['schema.options /o/p', 'value /o'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: {
      'load: schema.options /o/p': { omitEmpty: false },
      'load: value /o': { p: { x: 'a' } },
      'schema.options /o/p': undefined,
      'value /o': {},
    },
    difference:
      'after /o/p empties, the live form keeps then, so /o/p keeps omitEmpty false and /o keeps an empty p, while a fresh load of the same sources selects else',
    known: {
      sequential: {
        'load: schema.options /o/p': { omitEmpty: false },
        'load: value /o': { p: { x: 'a' } },
        'schema.options /o/p': { omitEmpty: false },
        'value /o': { p: {} },
      },
      fresh: { 'schema.options /o/p': undefined, 'value /o': {} },
    },
  },
];
