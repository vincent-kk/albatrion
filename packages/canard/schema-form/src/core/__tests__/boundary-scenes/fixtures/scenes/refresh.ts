import type { BoundaryScene } from '../types';

/** Refresh: whether an input-origin path is refreshed when the settlement ends with another value. */
export const refreshScenes: readonly BoundaryScene[] = [
  {
    id: 'refresh/typed-value-cleared-by-unset-rule',
    origin:
      'settlement evaluation E9a and design section 6 item 10: typing D into a field whose rule clears D',
    schema: {
      type: 'object',
      properties: {
        x: { type: 'string', controls: { unsetValue: '../x === "D"' } },
      },
    },
    load: { x: 'a' },
    steps: [{ input: '/x', value: 'D' }],
    probes: ['value /x', 'refresh /x'],
    modes: ['sequential'],
    state: 'known',
    expected: { 'value /x': undefined, 'refresh /x': true },
    difference:
      'the unset rule clears the typed value without a Refresh, so the input keeps showing D',
    known: { sequential: { 'value /x': undefined, 'refresh /x': false } },
  },
  {
    id: 'refresh/narrowed-union-input-keeps-typed-text',
    origin:
      'settlement evaluation E9b and critique A4, design section 6 item 2: typing into a narrowed union',
    schema: {
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        o: {
          type: 'object',
          properties: {
            u: { type: ['string', 'number'] },
            s: { type: 'string' },
          },
        },
      },
      allOf: [
        {
          controls: { active: './flag === true' },
          properties: { o: { properties: { u: { type: 'number' } } } },
        },
      ],
    },
    load: { flag: true, o: { s: 'k' } },
    steps: [{ input: '/o/u', value: '1.10' }],
    probes: ['value /o/u', 'source /o/u', 'refresh /o/u'],
    modes: ['sequential'],
    state: 'known',
    expected: {
      'value /o/u': 1.1,
      'source /o/u': '1.10',
      'refresh /o/u': false,
    },
    difference:
      'the typed text is stored as the converted number (WRITE-098), so the input loses 1.10',
    known: {
      sequential: {
        'value /o/u': 1.1,
        'source /o/u': 1.1,
        'refresh /o/u': false,
      },
    },
  },
];
