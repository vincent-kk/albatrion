import { ABSENT, type BoundaryScene } from '../types';

/** Event rules: `injectTo` and `unsetValue` evaluated on a state the settlement does not end in. */
export const eventRuleScenes: readonly BoundaryScene[] = [
  {
    id: 'event-rules/same-value-reset-fires-once',
    origin:
      'acceptance line GAP-1: a subtree reset to the same value fires injectTo on a provisional value',
    schema: (log) => ({
      type: 'object',
      properties: {
        sw: { type: 'boolean' },
        other: {
          type: ['string', 'number'],
          controls: {
            injectTo: (value: unknown) => {
              log(value);
              return typeof value === 'string'
                ? { '../mark': 'saw-string' }
                : {};
            },
          },
        },
        osum: {
          type: ['string', 'number'],
          controls: { derived: '../other + 1' },
        },
        mark: { type: 'string' },
      },
      allOf: [
        {
          controls: { active: "./sw === true && typeof ./other === 'string'" },
          properties: { other: { type: 'number' } },
        },
      ],
    }),
    load: { sw: true, other: '2' },
    steps: [{ reset: '/other' }],
    probes: ['log', 'value /mark', 'refresh /osum'],
    modes: ['sequential'],
    state: 'known',
    expected: { log: [2], 'value /mark': undefined, 'refresh /osum': false },
    difference:
      'the reset to the same value fires the rule again with the raw string before the typed value',
    known: {
      sequential: {
        log: ['2', 2],
        'value /mark': 'saw-string',
        'refresh /osum': true,
      },
    },
  },
  {
    id: 'event-rules/inject-from-a-middle-pass-node',
    origin:
      'acceptance line X3: a node present only in a middle pass fires its injectTo',
    schema: {
      type: 'object',
      properties: {
        a: { type: 'number' },
        d: { type: 'number', controls: { derived: '0 - ../a' } },
        x: {
          type: 'string',
          controls: {
            active: '../a > 0 && ../d > 0',
            injectTo: () => ({ '../log': 'x-was-here' }),
          },
        },
        log: { type: 'string' },
      },
    },
    load: { a: -1 },
    steps: [{ set: '/a', value: 1 }],
    probes: ['value /x', 'value /log'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: { 'value /x': ABSENT, 'value /log': undefined },
    difference:
      'x fires its injectTo although it exists only in a middle pass of the settlement',
    known: {
      sequential: { 'value /x': ABSENT, 'value /log': 'x-was-here' },
      fresh: { 'value /x': ABSENT, 'value /log': 'x-was-here' },
    },
  },
  {
    id: 'event-rules/unset-on-stale-derived',
    origin:
      'critique A2: an unsetValue fires on the stale value of a derived field',
    schema: {
      type: 'object',
      properties: {
        a: { type: 'number' },
        d: { type: 'number', controls: { derived: '0 - ../a' } },
        keep: {
          type: 'string',
          controls: { unsetValue: '../a > 0 && ../d > 0' },
        },
      },
    },
    load: { a: -1, keep: 'saved' },
    steps: [{ set: '/a', value: 1 }],
    probes: ['value /d', 'value /keep'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: { 'value /d': -1, 'value /keep': 'saved' },
    difference: 'the unsetValue fires on the stale value of d and clears keep',
    known: {
      sequential: { 'value /d': -1, 'value /keep': undefined },
      fresh: { 'value /d': -1, 'value /keep': undefined },
    },
  },
  {
    id: 'event-rules/inject-from-a-revived-node',
    origin:
      'critique A3: a node live before the settlement leaves and returns, and fires injectTo as new',
    schema: (log) => ({
      type: 'object',
      properties: {
        a: { type: 'number' },
        d: { type: 'number', controls: { derived: '0 - ../a' } },
        log: { type: 'string' },
        x: {
          type: 'string',
          controls: {
            active: '../a < 0 || ../d < 0',
            injectTo: (value: unknown) => {
              log(value);
              return { '../log': `fired:${String(value)}` };
            },
          },
        },
      },
    }),
    load: { a: -1, x: 'v' },
    steps: [
      { set: '/log', value: '' },
      { set: '/a', value: 1 },
    ],
    probes: ['value /x', 'value /log', 'log'],
    modes: ['sequential'],
    state: 'known',
    expected: { 'value /x': 'v', 'value /log': '', log: [] },
    difference:
      'x leaves and returns within one settlement and fires its injectTo as a new node',
    known: {
      sequential: { 'value /x': 'v', 'value /log': 'fired:v', log: ['v'] },
    },
  },
  {
    id: 'event-rules/inject-source-cleared-in-same-settlement',
    origin:
      'settlement evaluation E2a: an unsetValue clears the source of an injectTo in the same settlement',
    schema: {
      type: 'object',
      properties: {
        s: {
          type: 'string',
          controls: {
            unsetValue: '../s === "bad"',
            injectTo: (value: unknown) => ({
              '../mirror': value === undefined ? 'none' : value,
            }),
          },
        },
        mirror: { type: 'string' },
      },
    },
    load: { s: 'ok' },
    steps: [{ set: '/s', value: 'bad' }],
    probes: ['value /s', 'value /mirror'],
    modes: ['sequential', 'fresh'],
    state: 'expected',
    expected: { 'value /s': undefined, 'value /mirror': 'none' },
  },
];
