import type { FormScenario } from '../types';

/** A final gated type list interprets the same input in the same commit. */
export const gatedEffectiveListScenario = {
  name: 'union.gated-effective-list',
  schema: { type: 'object', properties: {
    enabled: { type: 'boolean' }, a: { type: ['string', 'number'] },
  }, allOf: [{ controls: { active: './enabled' }, properties: {
    a: { type: 'number' },
  } }] },
  steps: [{ action: 'setValue', path: '', value: { enabled: true, a: '42' },
    expect: { values: { '/a': 42 }, outputValue: { enabled: true, a: 42 },
      diagnostics: { status: 'stable' } } }],
} satisfies FormScenario;
