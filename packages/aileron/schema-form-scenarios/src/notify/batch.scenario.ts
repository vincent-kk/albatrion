import type { FormScenario } from '../types';

/** A batch exposes one final output and one change callback. */
export const batchScenario = {
  name: 'notify.batch-change',
  schema: { type: 'object', properties: {
    first: { type: 'string' }, second: { type: 'string' },
  } },
  initialValue: { first: 'old', second: 'old' },
  steps: [
    { action: 'batch', steps: [
      { action: 'setValue', path: '/first', value: 'new-first' },
      { action: 'setValue', path: '/second', value: 'new-second' },
    ], expect: { outputValue: { first: 'new-first', second: 'new-second' },
      deliveryOrder: ['', '/first', '/second'], onChangeCount: 1,
      validationRequestCount: 1 } },
  ],
} satisfies FormScenario;
