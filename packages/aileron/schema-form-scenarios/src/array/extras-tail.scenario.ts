import type { FormScenario } from '../types';

/** Untemplated tail values remain in extras through structural verbs. */
export const extrasTailScenario = {
  name: 'array.extras-tail',
  description: 'NODE-052 TEST-018: prefix-only arrays preserve extras on push and pop.',
  schema: { type: 'array', prefixItems: [{ type: 'string' }], items: false },
  initialValue: ['a', 'b', 'c'],
  steps: [
    { action: 'push', path: '', value: 'd', expect: {
      result: 4, shape: { '/1': 'absent', '/3': 'absent' },
      extras: { '': ['b', 'c', 'd'] }, outputValue: ['a', 'b', 'c', 'd'],
    } },
    { action: 'pop', path: '', expect: {
      result: 'd', extras: { '': ['b', 'c'] }, outputValue: ['a', 'b', 'c'],
    } },
  ],
} satisfies FormScenario;
