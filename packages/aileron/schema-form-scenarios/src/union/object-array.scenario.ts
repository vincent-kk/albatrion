import type { FormScenario } from '../types';

/** Whole object and array union values remain terminal node payloads. */
export const objectArrayScenario: FormScenario = {
  name: 'union.object-array',
  schema: { type: ['object', 'array'] },
  steps: [
    { action: 'setValue', path: '', value: { k: 'v' },
      expect: { shape: { '/k': 'absent' }, outputValue: { k: 'v' } } },
    { action: 'setValue', path: '', value: [1],
      expect: { shape: { '/0': 'absent' }, outputValue: [1] } },
  ],
};
