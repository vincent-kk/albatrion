import type { FormScenario } from '../../types';

/** A derived total whose expression reads only the price while watch adds the quantity as a dependency. */
const orderSchema = {
  type: 'object',
  properties: {
    price: { type: 'number' },
    quantity: { type: 'number' },
    label: { type: 'string', controls: { derived: '"price " + ../price', watch: ['../quantity'] } },
  },
};

/** watch widens the dependency set of derived, so an edge on a watched path recomputes after a manual edit. */
export const watchDependencyScenario: FormScenario = {
  name: 'derivation.watch-dependency',
  description: 'CONTROLS-032 and SETTLE-043 the derived dependency set is the expression paths plus controls.watch; CONTROLS-026 a manual edit stays until the next dependency edge, and an edge on the watched quantity recomputes the label although the expression does not read it.',
  schema: orderSchema,
  initialValue: { price: 10, quantity: 1 },
  steps: [
    { action: 'batch', steps: [], expect: { values: { '/label': 'price 10' } } },
    { action: 'setValue', path: '/label', value: 'manual', expect: { values: { '/label': 'manual' } } },
    { action: 'setValue', path: '/quantity', value: 2, expect: { values: { '/label': 'price 10' } } },
    { action: 'setValue', path: '/label', value: 'manual again', expect: { values: { '/label': 'manual again' } } },
    { action: 'setValue', path: '/price', value: 12, expect: { values: { '/label': 'price 12' }, outputValue: { price: 12, quantity: 2, label: 'price 12' } } },
  ],
};
