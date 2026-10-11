import type { FormScenario } from '../types';

/** Delivery order and callback counts are step-local observations. */
export const orderScenario = {
  name: 'notify.delivery-order',
  schema: { type: 'object', properties: {
    first: { type: 'string' }, second: { type: 'string' },
  } },
  initialValue: { first: 'old', second: 'old' },
  steps: [
    { action: 'setValue', path: '', value: { first: 'new', second: 'new' },
      expect: { outputValue: { first: 'new', second: 'new' },
        deliveryOrder: ['', '/first', '/second'], onChangeCount: 1,
        validationRequestCount: 1 } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/first', value: 'new' }],
      expect: { deliveryOrder: [], onChangeCount: 0, validationRequestCount: 0 } },
  ],
} satisfies FormScenario;
