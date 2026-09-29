import type { FormScenario } from '../types';

/** Rule A selects a numeric member for a numeric string. */
export const ruleAScenario = {
  name: 'union.rule-a',
  schema: { type: ['integer', 'number', 'boolean'] },
  steps: [{ action: 'setValue', path: '', value: '2',
    expect: { values: { '': 2 }, outputValue: 2 } }],
} satisfies FormScenario;
