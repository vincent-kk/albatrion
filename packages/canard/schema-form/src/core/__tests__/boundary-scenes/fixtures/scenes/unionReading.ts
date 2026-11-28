import { ABSENT, type BoundaryScene } from '../types';

/** Union reading: what a union shows when a gate that reads it, directly or through another field, types it. */
export const unionReadingScenes: readonly BoundaryScene[] = [
  {
    id: 'union-reading/direct-self-reader',
    origin:
      'settlement evaluation P2 and acceptance line "self-reading": a gate types the union it reads',
    schema: {
      type: 'object',
      properties: { u: { type: ['string', 'number'] } },
      allOf: [
        {
          controls: { active: "typeof ./u === 'string'" },
          properties: { u: { type: 'number' } },
        },
      ],
    },
    load: { u: '2' },
    steps: [{ note: 'load' }, { set: '/u', value: '3' }],
    probes: ['value /u', 'types /u', 'status'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: {
      'load: value /u': 2,
      'load: types /u': ['number'],
      'load: status': 'stable',
      'value /u': 3,
      'types /u': ['number'],
      status: 'stable',
    },
    defect:
      'the gate reads the converted number instead of the source, so the union is not narrowed',
    known: {
      sequential: {
        'load: value /u': 2,
        'load: types /u': ['string', 'number'],
        'load: status': 'stable',
        'value /u': 3,
        'types /u': ['string', 'number'],
        status: 'stable',
      },
      fresh: { 'value /u': 3, 'types /u': ['string', 'number'] },
    },
  },
  {
    id: 'union-reading/self-reader-switched-off-and-on',
    origin:
      'settlement design section 6 items 1 and 2: a gate typing the union it reads is switched off and on',
    schema: {
      type: 'object',
      properties: {
        sw: { type: 'boolean' },
        data: { type: ['string', 'number'] },
      },
      allOf: [
        {
          controls: { active: "./sw === true && typeof ./data === 'string'" },
          properties: { data: { type: 'number' } },
        },
      ],
    },
    load: { sw: false, data: '2' },
    steps: [
      { note: 'load' },
      { set: '/sw', value: true },
      { note: 'on' },
      { set: '/sw', value: false },
      { note: 'off' },
      { set: '/sw', value: true },
    ],
    probes: ['value /data', 'types /data'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: {
      'load: value /data': '2',
      'load: types /data': ['string', 'number'],
      'on: value /data': 2,
      'on: types /data': ['number'],
      'off: value /data': '2',
      'off: types /data': ['string', 'number'],
      'value /data': 2,
      'types /data': ['number'],
    },
    defect:
      'switching the gate on narrows the type but leaves the string, and a fresh load of it does not narrow',
    known: {
      sequential: {
        'load: value /data': '2',
        'load: types /data': ['string', 'number'],
        'on: value /data': '2',
        'on: types /data': ['number'],
        'off: value /data': '2',
        'off: types /data': ['string', 'number'],
        'value /data': '2',
        'types /data': ['number'],
      },
      fresh: { 'value /data': 2, 'types /data': ['string', 'number'] },
    },
  },
  {
    id: 'union-reading/second-presented-change-in-one-settlement',
    origin:
      'settlement evaluation E4: a union is read twice under different lists in one settlement',
    schema: {
      type: 'object',
      properties: {
        o: {
          type: 'object',
          properties: {
            sw: {
              type: 'boolean',
              controls: {
                derived: '../../x !== undefined ? false : undefined',
              },
            },
            u: { type: ['string', 'number'] },
          },
          allOf: [
            {
              controls: { active: './sw === true' },
              properties: { u: { type: 'number' } },
            },
          ],
        },
        x: {
          type: 'string',
          controls: { active: "typeof ../o/u === 'number'" },
        },
      },
    },
    load: { o: { sw: false, u: '2' }, x: 'X' },
    steps: [{ set: '/o/sw', value: true }],
    probes: ['value /o/u', 'types /o/u', 'value /x', 'value /o/sw'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: {
      'value /o/u': '2',
      'types /o/u': ['string', 'number'],
      'value /x': ABSENT,
      'value /o/sw': false,
    },
    defect:
      'the settlement keeps the first narrowing: u stays typed number while holding a string and sw stays true',
    known: {
      sequential: {
        'value /o/u': '2',
        'types /o/u': ['number'],
        'value /x': ABSENT,
        'value /o/sw': true,
      },
      fresh: {
        'value /o/u': 2,
        'types /o/u': ['number'],
        'value /x': undefined,
        'value /o/sw': true,
      },
    },
  },
];
