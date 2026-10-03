import type { FormScenario } from '../types';

/** A fractional number chooses string when integer cannot admit it. */
export const integerScenario = {
  name: 'union.integer',
  schema: { type: ['integer', 'string'] },
  steps: [{ action: 'setValue', path: '', value: 12.5,
    expect: { values: { '': '12.5' }, outputValue: '12.5' } }],
} satisfies FormScenario;
