import type { FormScenario } from '../types';

/** Trailing null slots are filtered from output while raw item positions remain. */
export const omitTrailingScenario = {
  name: 'array.omit-trailing',
  description: 'TEST-018 VALUE-034: omitTrailing trims only the output tail.',
  schema: { type: 'array', items: { type: 'string' }, options: { omitTrailing: true } },
  steps: [
    { action: 'setValue', path: '', value: ['a', null, null], expect: {
      shape: { '/0': 'present', '/1': 'present', '/2': 'present' },
      values: { '': ['a', null, null] }, outputValue: ['a'],
    } },
    { action: 'setValue', path: '', value: ['a', null, 'z'], expect: {
      shape: { '/1': 'present' }, outputValue: ['a', null, 'z'],
    } },
  ],
} as const satisfies FormScenario;
