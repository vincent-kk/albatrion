import type { FormScenario } from '../types';

/** The consumer's onError sink receives structured warning codes. */
export const warningScenario = {
  name: 'notify.warning-record',
  schema: { type: 'number' },
  steps: [
    { action: 'batch', steps: [{ action: 'setValue', path: '', value: 'not a number' }],
      expect: { onErrorCodes: ['SCHEMA_FORM_WARNING.TYPE_MISMATCH'] } },
  ],
} satisfies FormScenario;
