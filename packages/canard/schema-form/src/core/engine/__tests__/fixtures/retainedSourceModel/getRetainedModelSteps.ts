import type { Order, Step } from '../retainedSourceModelCases';

/** Derive the model's two default events from the requested write order. */
export const getRetainedModelSteps = (order: Order): readonly Step[] =>
  order === 'fill then name' ? ['fill', 'name'] : ['name', 'fill'];
