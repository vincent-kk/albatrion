import type { FormScenario } from '../types';

/** Empty object children obey their own output option. */
export const omitEmptyObjectScenario = {
  name: 'value.omit-empty-object',
  schema: { type: 'object', properties: {
    hidden: { type: 'object' },
    kept: { type: 'object', options: { omitEmpty: false } },
  } },
  steps: [{ action: 'setValue', path: '', value: { hidden: {}, kept: {} },
    expect: { shape: { '/hidden': 'present', '/kept': 'present' },
      outputValue: { kept: {} } } }],
} satisfies FormScenario;
