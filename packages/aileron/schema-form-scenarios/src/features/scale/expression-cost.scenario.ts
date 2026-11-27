import type { FormScenario } from '../../types';

/** Number of computed fields. */
const computedCount = 200;

/** A rate and a switch drive two hundred fields: each derives from the rate, and odd ones hide with the switch. */
const expressionSchema = {
  type: 'object',
  properties: {
    rate: { type: 'number' },
    show: { type: 'boolean' },
    ...Object.fromEntries(Array.from({ length: computedCount }, (_, index) => [`r${index}`, {
      type: 'number',
      controls: index % 2 ? { derived: `../rate + ${index}`, visible: '../show === true' } : { derived: `../rate + ${index}` },
    }])),
  },
};

/** Two hundred derived fields follow their source in one settle, and visible hides without clearing values. */
export const expressionCostScenario: FormScenario = {
  name: 'scale.expression-cost',
  description: 'Two hundred controls.derived expressions read one source: a write to it recomputes every derived field in one settle (SETTLE-001), and a visible expression on half of them hides the inputs without changing their values (CONTROLS-022). No timing is asserted; the story shows the form size in the docs.',
  schema: expressionSchema,
  initialValue: { rate: 1, show: true },
  steps: [
    { action: 'batch', steps: [], expect: { values: { '/r0': 1, '/r199': 200 }, states: { '/r1': { isVisible: true } } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/rate', value: 5 }], expect: { values: { '/r0': 5, '/r1': 6, '/r199': 204 } } },
    { action: 'batch', steps: [{ action: 'setValue', path: '/show', value: false }], expect: {
      values: { '/r1': 6, '/r199': 204 }, states: { '/r1': { isVisible: false }, '/r0': { isVisible: true } },
    } },
  ],
};
