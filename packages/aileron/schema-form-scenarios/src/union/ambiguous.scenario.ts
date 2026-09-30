import type { FormScenario } from '../types';

/** Ambiguous scalar conversion retains the caller's raw value. */
export const ambiguousScenario = {
  name: 'union.ambiguous',
  schema: { type: ['string', 'boolean'] },
  steps: [
    { action: 'setValue', path: '', value: 1,
      expect: { values: { '': 1 }, outputValue: 1 } },
    { action: 'setValue', path: '', value: 0,
      expect: { values: { '': 0 }, outputValue: 0 } },
  ],
} satisfies FormScenario;
