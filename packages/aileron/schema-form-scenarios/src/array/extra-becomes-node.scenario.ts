import type { FormScenario } from '../types';

/** Removing the first tuple slot moves an extra into a templated position. */
export const extraBecomesNodeScenario = {
  name: 'array.extra-becomes-node',
  description: 'NODE-052 TEST-018: remove(0) moves c from extras into the second item node.',
  schema: { type: 'array', prefixItems: [{ type: 'string' }, { type: 'string' }],
    items: false },
  initialValue: ['a', 'b', 'c', 'd'],
  steps: [{ action: 'remove', path: '', index: 0, expect: {
    result: 'a', shape: { '/0': 'present', '/1': 'present', '/2': 'absent' },
    values: { '/0': 'b', '/1': 'c' }, extras: { '': ['d'] },
    outputValue: ['b', 'c', 'd'],
  } }],
} satisfies FormScenario;
