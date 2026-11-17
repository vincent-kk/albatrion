import type { FormScenario } from '../types';

/** A union default is loaded as a whole value and not refilled by an edit. */
export const defaultFillUnionScenario = {
  name: 'union.default-fill',
  schema: { type: ['string', 'boolean'], default: 0 },
  steps: [
    { action: 'reset', expect: { values: { '': 0 }, outputValue: 0 } },
    { action: 'setValue', path: '', value: undefined,
      expect: { values: { '': undefined }, outputValue: undefined } },
  ],
} satisfies FormScenario;
