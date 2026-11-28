import { FormErrorCode } from '@/schema-form/errors';

import type { BoundaryScene } from '../types';

/** The channels a budget error reaches when the load cannot settle. */
const LOAD_BUDGET_ERROR = {
  thrown: [`load ${FormErrorCode.BudgetExceeded}`],
  reports: [`error ${FormErrorCode.BudgetExceeded} load`],
  status: 'degraded',
};

/** What a load that settles reports on the same channels. */
const SETTLED = {
  thrown: [],
  reports: [],
  status: 'stable',
  budget: undefined,
};

/** A field active only while it is absent, with a default that makes it present. */
const selfPresenceFlip = {
  type: 'object',
  properties: {
    x: {
      type: 'string',
      default: 'D',
      controls: { active: '../x === undefined' },
    },
    y: { type: 'string' },
  },
} as const;

/**
 * Support limits (settlement design section 5): declarations with no stable answer end in a budget error that
 * is thrown, reported to `onError` and recorded in `diagnostics`, and the form keeps the caller's sources.
 */
export const supportLimitScenes: readonly BoundaryScene[] = [
  {
    id: 'support-limits/field-flips-its-own-presence',
    origin:
      'settlement evaluation E7b (26C-11 is the if/then form): a field active only while it is absent',
    schema: selfPresenceFlip,
    load: {},
    steps: [],
    probes: ['thrown', 'reports', 'status', 'budget', 'source /x'],
    modes: ['sequential'],
    state: 'expected',
    expected: {
      ...LOAD_BUDGET_ERROR,
      budget: 'hostWheel',
      'source /x': undefined,
    },
  },
  {
    id: 'support-limits/error-names-the-loop-participants',
    origin:
      'acceptance line "error of a loop without an answer" and design N13, on the E7b loop',
    schema: selfPresenceFlip,
    load: {},
    steps: [],
    probes: ['names /x', 'names /y'],
    modes: ['sequential'],
    state: 'known',
    expected: { 'names /x': true, 'names /y': false },
    difference:
      'the budget error names only the root path, not the field whose presence kept flipping',
    known: { sequential: { 'names /x': false, 'names /y': false } },
  },
  {
    id: 'support-limits/self-reader-through-a-derived-copy',
    origin:
      'settlement evaluation P1 and acceptance line "self-reading": a gate reads a derived copy of the union it types',
    schema: {
      type: 'object',
      properties: {
        u: { type: ['string', 'number'] },
        d: { type: ['string', 'number'], controls: { derived: '../u' } },
        z: { type: 'string' },
      },
      allOf: [
        {
          controls: { active: "typeof ./d === 'string'" },
          properties: { u: { type: 'number' } },
        },
      ],
    },
    load: { u: '2' },
    steps: [],
    probes: [
      'thrown',
      'reports',
      'status',
      'budget',
      'source /u',
      'names /u',
      'names /d',
      'names /z',
    ],
    modes: ['sequential'],
    state: 'known',
    expected: {
      ...LOAD_BUDGET_ERROR,
      budget: 'derive',
      'source /u': '2',
      'names /u': true,
      'names /d': true,
      'names /z': false,
    },
    difference:
      'under WRITE-098 the load stores the converted 2 and settles; the settlement design makes this loop without a fixed point a derive budget error (a breaking change, design section 5)',
    known: {
      sequential: {
        ...SETTLED,
        'source /u': 2,
        'names /u': false,
        'names /d': false,
        'names /z': false,
      },
    },
  },
  {
    id: 'support-limits/conditions-that-negate-each-other',
    origin:
      'settlement evaluation P5: unit shown for a numeric amount, amount typed number while unit is absent',
    schema: {
      type: 'object',
      properties: {
        amount: { type: ['string', 'number'] },
        unit: {
          type: 'string',
          default: 'kg',
          controls: { active: "typeof ../amount === 'number'" },
        },
        z: { type: 'string' },
      },
      allOf: [
        {
          controls: { active: './unit === undefined' },
          properties: { amount: { type: 'number' } },
        },
      ],
    },
    load: { amount: '5' },
    steps: [],
    probes: [
      'thrown',
      'reports',
      'status',
      'budget',
      'source /amount',
      'names /amount',
      'names /unit',
      'names /z',
    ],
    modes: ['sequential'],
    state: 'known',
    expected: {
      ...LOAD_BUDGET_ERROR,
      budget: 'hostWheel',
      'source /amount': '5',
      'names /amount': true,
      'names /unit': true,
      'names /z': false,
    },
    difference:
      'under WRITE-098 the load stores the converted 5 and settles; the settlement design makes these negating conditions a host wheel budget error (a breaking change, design section 5)',
    known: {
      sequential: {
        ...SETTLED,
        'source /amount': 5,
        'names /amount': false,
        'names /unit': false,
        'names /z': false,
      },
    },
  },
  {
    id: 'support-limits/even-ring-of-typing-gates',
    origin:
      'settlement evaluation P3 (unreachable fixed point; seeds 12, 75, 230, 1552 share the class)',
    schema: {
      type: 'object',
      properties: {
        u0: { type: ['string', 'number'] },
        u1: { type: ['string', 'number'] },
        u2: { type: ['string', 'number'] },
        u3: { type: ['string', 'number'] },
        z: { type: 'string' },
      },
      allOf: [0, 1, 2, 3].map((index) => ({
        controls: { active: `typeof ./u${(index + 1) % 4} === 'string'` },
        properties: { [`u${index}`]: { type: 'number' } },
      })),
    },
    load: { u0: '0', u1: '0', u2: '0', u3: '0' },
    steps: [],
    probes: [
      'thrown',
      'reports',
      'status',
      'budget',
      'source /u0',
      'names /u0',
      'names /u1',
      'names /u2',
      'names /u3',
      'names /z',
    ],
    modes: ['sequential'],
    state: 'known',
    expected: {
      ...LOAD_BUDGET_ERROR,
      budget: 'hostWheel',
      'source /u0': '0',
      'names /u0': true,
      'names /u1': true,
      'names /u2': true,
      'names /u3': true,
      'names /z': false,
    },
    difference:
      'under WRITE-098 the load stores converted values and settles; the settlement design makes this ring, whose fixed points the fixed start cannot reach, a host wheel budget error (a breaking change, design section 5)',
    known: {
      sequential: {
        ...SETTLED,
        'source /u0': 0,
        'names /u0': false,
        'names /u1': false,
        'names /u2': false,
        'names /u3': false,
        'names /z': false,
      },
    },
  },
];
