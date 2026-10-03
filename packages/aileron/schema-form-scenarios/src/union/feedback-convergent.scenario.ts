import type { FormScenario } from '../types';

/** WRITE-099 feedback reaches a stable string interpretation. */
export const convergentFeedbackScenario = {
  name: 'union.feedback-convergent',
  schema: { type: 'object', properties: {
    a: { type: ['string', 'boolean'] },
  }, allOf: [
    { controls: { active: './a === 0' }, properties: { a: { type: 'boolean' } } },
    { controls: { active: './a !== 0' }, properties: { a: { type: 'string' } } },
  ] },
  steps: [{ action: 'setValue', path: '', value: { a: 0 },
    expect: { values: { '/a': '0' }, outputValue: { a: '0' },
      diagnostics: { status: 'stable' } } }],
} satisfies FormScenario;
