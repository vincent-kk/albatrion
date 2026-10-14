import type { FormScenario } from '../../types';

/** A root number written with strings, so the type-mismatch state turns on, stays on, turns off, and turns on again. */
export const warningOnceScenario: FormScenario = {
  name: 'events.warning-once',
  description: 'ERROR-186 the core raises the type-mismatch warning when the node mismatch state turns on, and ERROR-024 the delivered warning is deduplicated by its structural key (code and path) until the next form-level load; ERROR-204 only mount and FormHandle.reset() clear that key. So a second mismatch while on, and a second turn-on after a matching write, reach onError nothing; after reset the next turn-on reaches onError again. Each write runs inside a batch so the handle, not the screen input, performs it.',
  schema: { type: 'number' },
  initialValue: 1,
  steps: [
    { action: 'batch', steps: [{ action: 'setValue', path: '', value: 'not a number' }], expect: { onErrorCodes: ['SCHEMA_FORM_WARNING.TYPE_MISMATCH'] } },
    { action: 'batch', steps: [{ action: 'setValue', path: '', value: 'still not' }], expect: { onErrorCodes: [] } },
    { action: 'batch', steps: [{ action: 'setValue', path: '', value: 3 }], expect: { outputValue: 3, onErrorCodes: [] } },
    { action: 'batch', steps: [{ action: 'setValue', path: '', value: 'again' }], expect: { onErrorCodes: [] } },
    { action: 'reset', expect: { outputValue: 1, onErrorCodes: [] } },
    { action: 'batch', steps: [{ action: 'setValue', path: '', value: 'after reset' }], expect: { onErrorCodes: ['SCHEMA_FORM_WARNING.TYPE_MISMATCH'] } },
  ],
};
