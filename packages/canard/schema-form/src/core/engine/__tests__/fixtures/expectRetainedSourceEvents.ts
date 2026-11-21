import { evaluateRetainedSourceEvents } from './retainedSourceModel/evaluateRetainedSourceEvents';
import { getRetainedModelSource } from './retainedSourceModel/getRetainedModelSource';
import { getRetainedModelSteps } from './retainedSourceModel/getRetainedModelSteps';
import { HELD, Y, Z } from './retainedSourceModelCases';
import type { Case, Channel, Event, Source } from './retainedSourceModelCases';

/** Calculate the absolute exit result from initial values and model events. */
export const expectRetainedSourceEvents = (
  { shape, order, policy, arrayInput }: Case,
  seed: number,
  steps = getRetainedModelSteps(order),
) => {
  const initial = new Map<Channel, Source>([
    [Y, getRetainedModelSource(shape, 'initial')],
    [Z, 'initial'],
  ]);
  if (shape === 'held') initial.set(HELD, 'held-initial');
  const items =
    arrayInput === 'empty'
      ? []
      : [arrayInput === 'sparse' ? undefined : 'y' + seed];
  const named: Event =
    shape === 'array'
      ? { kind: 'resize', length: items.length, items }
      : { kind: 'name', channel: Y, value: 'y' + seed };
  const fill: Event =
    shape === 'array'
      ? { kind: 'resize', length: 0 }
      : { kind: 'fill', channel: Y };
  const events = steps.map<Event>((step) => (step === 'name' ? named : fill));
  if (shape === 'held' && steps.includes('name'))
    events.push({ kind: 'name', channel: HELD, value: 'held' + seed });
  events.push(
    { kind: 'name', channel: Z, value: 'last' },
    {
      kind: 'close',
      policy,
      resolved: getRetainedModelSource(shape, 'resolved'),
    },
  );
  return evaluateRetainedSourceEvents(initial, events);
};
