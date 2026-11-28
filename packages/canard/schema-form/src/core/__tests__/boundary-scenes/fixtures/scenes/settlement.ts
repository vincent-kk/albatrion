import { ABSENT, type BoundaryScene } from '../types';

/** Settlement intermediate state: a gate or rule that reads a value before the settlement computed it. */
export const settlementScenes: readonly BoundaryScene[] = [
  {
    id: 'settlement/derived-null-satisfies-if-at-load',
    origin:
      'acceptance line D: a load whose derived value is null before derive briefly satisfies an if gate',
    schema: {
      type: 'object',
      properties: {
        u0: { type: ['string', 'number'] },
        u1: { type: ['integer', 'boolean'] },
        d1: {
          type: ['string', 'number', 'boolean'],
          controls: { derived: '../u0 + 1' },
        },
      },
      allOf: [
        {
          if: { properties: { d1: { minimum: 1 } }, required: ['d1'] },
          then: { properties: { u1: { type: 'boolean' } } },
        },
      ],
    },
    load: { u1: 1, d1: null },
    steps: [],
    probes: ['value /u1', 'types /u1'],
    modes: ['sequential', 'fresh'],
    state: 'expected',
    expected: { 'value /u1': 1, 'types /u1': ['integer', 'boolean'] },
  },
  {
    id: 'settlement/stale-derived-satisfies-gate-on-write',
    origin:
      'acceptance line X1: an ordinary write whose stale derived value briefly satisfies a gate',
    schema: {
      type: 'object',
      properties: {
        a: { type: 'number' },
        d: { type: 'number', controls: { derived: '0 - ../a' } },
        u: { type: ['integer', 'boolean'] },
      },
      allOf: [
        {
          controls: { active: './a > 0 && ./d > 0' },
          properties: { u: { type: 'boolean' } },
        },
      ],
    },
    load: { a: -1, u: 1 },
    steps: [{ set: '/a', value: 1 }],
    probes: ['value /u', 'types /u', 'refresh /u'],
    modes: ['sequential', 'fresh'],
    state: 'expected',
    expected: {
      'value /u': 1,
      'types /u': ['integer', 'boolean'],
      'refresh /u': false,
    },
  },
  {
    id: 'settlement/gate-reads-before-default-fill',
    origin:
      'acceptance line X5: a gate reads a field before its default is filled',
    schema: {
      type: 'object',
      properties: {
        g: { type: 'number', default: 5 },
        u: { type: ['integer', 'boolean'] },
      },
      allOf: [
        {
          controls: { active: './g === undefined' },
          properties: { u: { type: 'boolean' } },
        },
      ],
    },
    load: { u: 1 },
    steps: [],
    probes: ['value /u', 'value /g'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: { 'value /u': 1, 'value /g': 5 },
    difference:
      'the load converts 1 to true under the list the unfilled g selects and keeps it (WRITE-098), so a fresh load of the result keeps true too',
    known: {
      sequential: { 'value /u': true, 'value /g': 5 },
      fresh: { 'value /u': true, 'value /g': 5 },
    },
  },
  {
    id: 'settlement/gate-reads-later-gated-sibling-as-absent',
    origin:
      'acceptance line X6: a presence-reading gate placed before its gated sibling; an unrelated flip',
    schema: {
      type: 'object',
      properties: {
        uf: { type: 'boolean' },
        o: { type: 'string' },
        sw: { type: 'boolean' },
        u: { type: ['integer', 'boolean'] },
        g: { type: 'number', controls: { active: '../sw === true' } },
      },
      allOf: [
        {
          controls: { active: './g === undefined' },
          properties: { u: { type: 'boolean' } },
        },
        {
          controls: { active: './uf === true' },
          properties: { o: { minLength: 1 } },
        },
      ],
    },
    load: { uf: false, o: 'a', sw: true, g: 5, u: 1 },
    steps: [
      { set: '/u', value: 0 },
      { note: 'written' },
      { set: '/uf', value: true },
    ],
    probes: ['value /u', 'refresh /u'],
    modes: ['sequential', 'fresh'],
    state: 'expected',
    expected: {
      'written: value /u': 0,
      'written: refresh /u': true,
      'value /u': 0,
      'refresh /u': false,
    },
  },
  {
    id: 'settlement/stale-derived-switches-on-a-loop',
    origin:
      'acceptance line 632 (union generator seed 632, written out): a loop a stale derived value switches on',
    schema: {
      type: 'object',
      properties: {
        uf: { type: 'boolean' },
        o: { type: 'string' },
        u0: { type: ['string', 'number', 'boolean'] },
        d0: {
          type: ['string', 'number', 'boolean'],
          controls: { derived: '../u0 + 1' },
        },
        o0: {
          type: 'object',
          properties: { f: { type: 'boolean', default: true } },
          controls: { active: "typeof ../u0 === 'number'" },
        },
      },
      allOf: [
        {
          controls: { active: './o0/f === true' },
          properties: { u0: { type: 'number' } },
        },
        {
          controls: { active: './uf === true' },
          properties: { o: { minLength: 1 } },
        },
        {
          if: { properties: { d0: { const: 2 } }, required: ['d0'] },
          then: { properties: { u0: { type: 'number' } } },
        },
      ],
    },
    load: { uf: false, o: 'a', u0: 1 },
    steps: [
      { set: '/u0', value: '2.5' },
      { note: 'written' },
      { set: '/uf', value: true },
    ],
    probes: ['value /u0', 'types /u0', 'value /o0'],
    modes: ['sequential', 'fresh'],
    state: 'expected',
    expected: {
      'written: value /u0': '2.5',
      'written: types /u0': ['string', 'number', 'boolean'],
      'written: value /o0': ABSENT,
      'value /u0': '2.5',
      'types /u0': ['string', 'number', 'boolean'],
      'value /o0': ABSENT,
    },
  },
  {
    id: 'settlement/root-gate-reads-value-derived-in-same-pass',
    origin:
      'acceptance line "C1 load" (critique C1 schema): a root gate reads a field a derived value admits later',
    schema: {
      type: 'object',
      properties: {
        f: { type: 'string' },
        sub: {
          type: 'object',
          properties: {
            g1: { type: 'string', default: 'on' },
            g2: {
              type: 'string',
              default: 'go',
              controls: { active: '../../d === "on"' },
            },
          },
        },
        d: { type: 'string', controls: { derived: '../sub/g1' } },
      },
      allOf: [
        {
          controls: { active: './sub/g1 === undefined' },
          properties: { f: { default: 'A' } },
        },
        {
          controls: { active: "./sub/g2 === 'go'" },
          properties: { f: { default: 'B' } },
        },
      ],
    },
    load: { sub: { g1: 'on', g2: 'go' } },
    steps: [],
    probes: ['value /f'],
    modes: ['sequential', 'fresh'],
    state: 'known',
    expected: { 'value /f': 'B' },
    difference:
      'the root gate reads sub/g2 as absent before d is derived and is not decided again, so f gets no default',
    known: {
      sequential: { 'value /f': undefined },
      fresh: { 'value /f': undefined },
    },
  },
  {
    id: 'settlement/value-rule-write-to-middle-pass-node',
    origin:
      'acceptance line "middle-pass write": an unsetValue fires on a node present only in a middle pass',
    schema: {
      type: 'object',
      properties: {
        a: { type: 'number' },
        d: { type: 'number', controls: { derived: '0 - ../a' } },
        t: {
          type: 'string',
          controls: {
            active: '!(../a > 0 && ../d < 0)',
            unsetValue: '../a > 0',
          },
        },
      },
    },
    load: { a: -1, t: '7' },
    steps: [
      { set: '/a', value: 1 },
      { note: 'written' },
      { set: '/a', value: -1 },
    ],
    probes: ['value /t', 'inactive /t'],
    modes: ['sequential'],
    state: 'known',
    expected: {
      'written: value /t': ABSENT,
      'written: inactive /t': ['7'],
      'value /t': '7',
      'inactive /t': [],
    },
    difference:
      'the unsetValue fires on t while the stale d still keeps it present, so the retained 7 is lost',
    known: {
      sequential: {
        'written: value /t': ABSENT,
        'written: inactive /t': [],
        'value /t': undefined,
        'inactive /t': [],
      },
    },
  },
  {
    id: 'settlement/item-gate-reads-later-gated-sibling-as-absent',
    origin:
      'acceptance line "X6 array" (extended generator seeds 764, 1014, 1754, 1869, 1994): X6 inside an array item',
    schema: {
      type: 'object',
      properties: {
        uf: { type: 'boolean' },
        o: { type: 'string' },
        list: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sw: { type: 'boolean' },
              u: { type: ['integer', 'boolean'] },
              g: { type: 'number', controls: { active: '../sw === true' } },
            },
            allOf: [
              {
                controls: { active: './g === undefined' },
                properties: { u: { type: 'boolean' } },
              },
            ],
          },
        },
      },
      allOf: [
        {
          controls: { active: './uf === true' },
          properties: { o: { minLength: 1 } },
        },
      ],
    },
    load: { uf: false, o: 'a', list: [{ sw: true, g: 5, u: 1 }] },
    steps: [
      { note: 'load' },
      { set: '/list/0/u', value: 0 },
      { note: 'written' },
      { set: '/uf', value: true },
    ],
    probes: ['value /list/0/u', 'types /list/0/u'],
    modes: ['sequential', 'fresh'],
    state: 'expected',
    expected: {
      'load: value /list/0/u': 1,
      'load: types /list/0/u': ['integer', 'boolean'],
      'written: value /list/0/u': 0,
      'written: types /list/0/u': ['integer', 'boolean'],
      'value /list/0/u': 0,
      'types /list/0/u': ['integer', 'boolean'],
    },
  },
  {
    id: 'settlement/child-gate-reads-a-primed-out-sibling',
    origin:
      'acceptance line "unconfirmed" (current model section 6.2, P4): a child gate reads a sibling the root removes',
    schema: {
      type: 'object',
      properties: {
        k: { type: 'string' },
        x: { type: 'number', controls: { active: '../k === "1"' } },
        c: {
          type: 'object',
          properties: {
            y: { type: ['integer', 'boolean'] },
            w: { type: 'string' },
          },
          allOf: [
            {
              controls: { active: '../x === 5' },
              properties: { y: { type: 'boolean' } },
            },
            {
              if: { properties: { w: { const: 'go' } }, required: ['w'] },
              then: { properties: { w: { minLength: 2 } } },
            },
          ],
        },
      },
    },
    load: { k: '1', x: 5, c: { y: 1, w: 'a' } },
    steps: [
      { note: 'load' },
      { set: '', value: { k: '0', x: 5, c: { y: 1, w: 'go' } } },
    ],
    probes: ['value /x', 'value /c/y', 'types /c/y'],
    modes: ['sequential', 'fresh'],
    state: 'expected',
    expected: {
      'load: value /x': 5,
      'load: value /c/y': true,
      'load: types /c/y': ['boolean'],
      'value /x': ABSENT,
      'value /c/y': 1,
      'types /c/y': ['integer', 'boolean'],
    },
  },
  {
    id: 'settlement/presence-gate-reads-union-before-typing',
    origin:
      'union generator seed 1167 (extended, also 1278), reduced: stopped on the settlement prototype',
    schema: {
      type: 'object',
      properties: {
        u0: { type: ['string', 'integer'] },
        o0: {
          type: 'object',
          properties: { f: { type: 'boolean' } },
          controls: { active: "typeof ../u0 === 'string'" },
        },
      },
      allOf: [
        {
          controls: { active: './u0 > 1' },
          properties: { g1: { type: 'boolean', default: true } },
        },
        {
          controls: { active: './g1 === true' },
          properties: { u0: { type: 'integer' } },
        },
      ],
    },
    load: { u0: 'abc' },
    steps: [{ set: '/u0', value: '1e3' }],
    probes: ['value /u0', 'types /u0', 'value /o0', 'value /g1', 'status'],
    modes: ['sequential', 'fresh'],
    state: 'open',
    reason:
      'design N1 does not say which owner a stale presence decision recomputes; the prototype looped where this branch settles',
    pinned: {
      sequential: {
        'value /u0': 1000,
        'types /u0': ['integer'],
        'value /o0': ABSENT,
        'value /g1': true,
        status: 'stable',
      },
      fresh: {
        'value /u0': 1000,
        'types /u0': ['integer'],
        'value /o0': ABSENT,
        'value /g1': true,
      },
    },
  },
];
