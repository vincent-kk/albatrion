import type { FormScenario } from '../types';

/** Tuple prefixes and the repeated item template both create item nodes. */
export const itemsPrefixScenario = {
  name: 'array.items-prefix',
  description: 'NODE-051 NODE-052 TEST-018: prefixItems wins by position and items serves the tail.',
  schema: { type: 'array', prefixItems: [{ type: 'number' }, { type: 'boolean' }],
    items: { type: 'string' } },
  steps: [{ action: 'setValue', path: '', value: [2, true, 'tail'], expect: {
    shape: { '/0': 'present', '/1': 'present', '/2': 'present' },
    schemaTypes: { '/0': 'number', '/1': 'boolean', '/2': 'string' },
    values: { '/0': 2, '/1': true, '/2': 'tail' },
    outputValue: [2, true, 'tail'],
  } }],
} satisfies FormScenario;
