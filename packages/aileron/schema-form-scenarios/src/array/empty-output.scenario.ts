import type { FormScenario } from '../types';

/** Empty nested array slots and an empty array root emit array containers. */
export const emptyOutputScenario = {
  name: 'array.empty-output',
  description: 'VALUE-034 TEST-018: an empty array item and empty array root emit [].',
  schema: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
  steps: [
    { action: 'setValue', path: '', value: [[]], expect: {
      shape: { '/0': 'present' }, values: { '/0': [] }, outputValue: [[]],
    } },
    { action: 'clear', path: '', expect: { values: { '': [] }, outputValue: [] } },
  ],
} satisfies FormScenario;
