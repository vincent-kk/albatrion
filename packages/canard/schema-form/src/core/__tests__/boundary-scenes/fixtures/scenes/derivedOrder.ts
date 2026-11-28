import type { BoundaryScene } from '../types';

/** Derived order: a derived rule evaluated on a value another rule of the same settlement has not written yet. */
export const derivedOrderScenes: readonly BoundaryScene[] = [
  {
    id: 'derived-order/chain-reads-round-start-value',
    origin:
      'acceptance line X2: a chained derived value computed from the round-start value of its source',
    schema: {
      type: 'object',
      properties: {
        a: { type: 'number' },
        d1: { type: 'number', controls: { derived: '../a + 1' } },
        d2: {
          type: 'number',
          controls: {
            derived: '../d1 - ../a',
            injectTo: (value: unknown) =>
              typeof value === 'number' && value < 0 ? { '../neg': true } : {},
          },
        },
        neg: { type: 'boolean' },
      },
    },
    load: { a: 1 },
    steps: [{ set: '/a', value: 5 }],
    probes: ['value /neg', 'value /d2', 'refresh /d2'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: { 'value /neg': undefined, 'value /d2': 1, 'refresh /d2': false },
    difference:
      'the chain reads the value d1 had when the round started, so the injectTo sets neg and d2 is refreshed',
    known: {
      sequential: { 'value /neg': true, 'value /d2': 1, 'refresh /d2': true },
      fresh: { 'value /neg': true, 'value /d2': 1 },
    },
  },
  {
    id: 'derived-order/shape-decided-by-stale-derived',
    origin:
      'settlement evaluation E1: a derived rule reads a presence a stale derived value decided',
    schema: {
      type: 'object',
      properties: {
        a: { type: 'number' },
        d1: { type: 'number', controls: { derived: '../a + 1' } },
        p: { type: 'string', controls: { active: '../d1 > ../a' } },
        t: {
          type: 'number',
          controls: { derived: '../p === undefined ? -1 : 1' },
        },
      },
    },
    load: { a: 1, p: 'x' },
    steps: [
      { set: '/t', value: 99 },
      { note: 'edited' },
      { set: '/a', value: 5 },
    ],
    probes: ['value /t', 'value /p', 'refresh /t'],
    modes: ['sequential'],
    state: 'known',
    expected: {
      'edited: value /t': 99,
      'edited: value /p': 'x',
      'edited: refresh /t': true,
      'value /t': 99,
      'value /p': 'x',
      'refresh /t': false,
    },
    difference:
      'the derived rule of t runs on the shape the stale derived value decided and overwrites the edited 99',
    known: {
      sequential: {
        'edited: value /t': 99,
        'edited: value /p': 'x',
        'edited: refresh /t': true,
        'value /t': 1,
        'value /p': 'x',
        'refresh /t': true,
      },
    },
  },
  {
    id: 'derived-order/chain-through-an-aliased-template',
    origin:
      'settlement evaluation E8a (through q; also E8b recursive): a user-edited derived value is overwritten',
    schema: {
      type: 'object',
      $defs: {
        box: {
          type: 'object',
          properties: {
            a: { type: 'number' },
            d: { type: 'number', controls: { derived: '../a + 1' } },
          },
        },
      },
      properties: {
        p: { $ref: '#/$defs/box' },
        q: { $ref: '#/$defs/box' },
        d2: { type: 'number', controls: { derived: '../q/d - ../q/a' } },
        t: { type: 'number', controls: { derived: '../d2 * 10' } },
      },
    },
    load: { p: { a: 1 }, q: { a: 1 } },
    steps: [
      { set: '/t', value: 99 },
      { note: 'edited' },
      { set: '/q/a', value: 5 },
    ],
    probes: ['value /t', 'refresh /t'],
    modes: ['sequential'],
    state: 'known',
    expected: {
      'edited: value /t': 99,
      'edited: refresh /t': true,
      'value /t': 99,
      'refresh /t': false,
    },
    difference:
      'the rule reached through the aliased template runs on a stale value and overwrites the edited 99',
    known: {
      sequential: {
        'edited: value /t': 99,
        'edited: refresh /t': true,
        'value /t': 10,
        'refresh /t': true,
      },
    },
  },
  {
    id: 'derived-order/rule-dropped-by-a-later-pass',
    origin:
      'settlement prototype round three, section D: a derived write whose rule the stable selection drops',
    schema: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        d: { type: 'number', controls: { derived: '../x + 1' } },
        t: { type: 'number' },
      },
      allOf: [
        {
          controls: { active: './d < 5' },
          properties: { t: { controls: { derived: '../x * 10' } } },
        },
      ],
    },
    load: { x: 1 },
    steps: [{ set: '/x', value: 10 }],
    probes: ['value /d', 'value /t'],
    modes: ['sequential', 'fresh'],
    state: 'open',
    reason:
      'design section 5 keeps the stale write as a class of difference while the round-four prototype drops it',
    pinned: {
      sequential: { 'value /d': 11, 'value /t': 100 },
      fresh: { 'value /d': 11, 'value /t': 100 },
    },
  },
];
