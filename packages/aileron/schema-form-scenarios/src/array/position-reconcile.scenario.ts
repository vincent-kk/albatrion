import type { FormScenario } from '../types';

/** A shifted item keeps its key and reference at its new position. */
export const positionReconcileScenario = {
  name: 'array.position-reconcile',
  description: 'TEST-018 NODE-051: remove moves live item identity and interaction state to its new position.',
  schema: { type: 'array', items: { type: 'string' } },
  initialValue: ['a', 'b', 'c'],
  steps: [{ action: 'remove', path: '', index: 0, expect: {
    identity: { '/0': '/1', '/1': '/2' }, outputValue: ['b', 'c'],
  } }],
} satisfies FormScenario;
