import type { FormScenario } from '../types';

/** VALIDATE-051: a union type error belongs to its union occurrence. */
export const unionTypeScenario = {
  name: 'validation.union-type-error-on-node',
  schema: { type: 'object', properties: {
    choice: { type: ['string', 'number'] },
  } },
  steps: [
    { action: 'setValue', path: '', value: { choice: { wrong: true } },
      expect: { shape: { '/choice': 'present' },
        errors: { '/choice': [{ keyword: 'type', dataPath: '/choice' }] } } },
  ],
} satisfies FormScenario;
