import type { FormScenario } from '../types';

/** Activating feedback degrades after the bounded derive rounds. */
export const budgetScenario = {
  name: 'derive.feedback-budget',
  schema: { type: 'object', properties: {
    active: { type: 'boolean' },
    a: { type: 'number', controls: {
      derived: '../active ? ../b + 1 : undefined',
      injectTo: (value: unknown) => ({ '../b': Number(value) + 1 }),
    } },
    b: { type: 'number' },
  } },
  initialValue: { active: false, a: 0, b: 0 },
  steps: [{ action: 'setValue', path: '/active', value: true,
    expect: { outputValue: { active: true, a: 0, b: 1 },
      diagnostics: { status: 'degraded', exceededBudget: 'derive', iterations: 25 } } }],
} satisfies FormScenario;
