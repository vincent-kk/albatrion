import type { FormScenario } from '../types';

/** Empty union input remains in the node's raw channel. */
export const omitEmptyUnionScenario = {
  name: 'union.omit-empty',
  schema: { type: 'object', properties: {
    value: { type: ['string', 'object', 'array'], options: { omitEmpty: true } },
  } },
  steps: [
    { action: 'setValue', path: '', value: { value: '' },
      expect: { shape: { '/value': 'present' }, values: { '/value': '' },
        outputValue: {} } },
    { action: 'setValue', path: '', value: { value: {} },
      expect: { values: { '/value': {} }, outputValue: {} } },
    { action: 'setValue', path: '', value: { value: [] },
      expect: { values: { '/value': [] }, outputValue: {} } },
  ],
} satisfies FormScenario;
