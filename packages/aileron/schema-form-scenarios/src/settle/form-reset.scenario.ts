import type { FormScenario } from '../types';

/** Form reset loads the committed prop over edits. */
export const formResetScenario = {
  name: 'settle.form-reset-load',
  schema: { type: 'object', properties: { name: { type: 'string' } } },
  initialValue: { name: 'seed' },
  steps: [
    { action: 'setValue', path: '/name', value: 'edited',
      expect: { outputValue: { name: 'edited' } } },
    { action: 'reset', expect: { values: { '/name': 'seed' },
      outputValue: { name: 'seed' }, diagnostics: { status: 'stable' } } },
  ],
} satisfies FormScenario;
