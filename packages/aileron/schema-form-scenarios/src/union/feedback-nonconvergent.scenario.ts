import type { FormScenario } from '../types';

/** WRITE-099 budget fallback commits Source B and reports degradation. */
export const nonconvergentFeedbackScenario = {
  name: 'union.feedback-nonconvergent',
  schema: { type: 'object', properties: {
    a: { type: ['string', 'boolean'] },
  }, allOf: [
    { controls: { active: './a === "0"' }, properties: { a: { type: 'boolean' } } },
    { controls: { active: './a !== "0"' }, properties: { a: { type: 'string' } } },
  ] },
  steps: [{ action: 'setValue', path: '', value: { a: 0 },
    expect: { values: { '/a': 0 }, outputValue: { a: 0 },
      diagnostics: { status: 'degraded', cause: 'budget',
        exceededBudget: 'transition' } } }],
} satisfies FormScenario;
