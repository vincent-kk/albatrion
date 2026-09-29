import type { FormScenario } from '../types';

/** Empty union input remains in the node's raw channel. */
export const omitEmptyUnionScenario = {
  name: 'union.omit-empty',
  schema: { type: 'object', properties: {
    value: { type: ['string', 'boolean'], options: { omitEmpty: true } },
  } },
  steps: [{ action: 'setValue', path: '', value: { value: '' },
    expect: { shape: { '/value': 'present' }, values: { '/value': '' } } }],
} satisfies FormScenario;
