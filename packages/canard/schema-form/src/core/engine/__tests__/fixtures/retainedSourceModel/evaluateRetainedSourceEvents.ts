import { Y } from '../retainedSourceModelCases';
import type { Channel, Event, Source } from '../retainedSourceModelCases';

/** Interpret settlement events before constructing any product call. */
export const evaluateRetainedSourceEvents = (
  initial: Map<Channel, Source>,
  events: readonly Event[],
): Record<string, Source> => {
  const selected = new Map(initial);
  const original = initial.get(Y);
  const originalArray = Array.isArray(original) ? original : undefined;
  let generation = 0;
  let workingLength = originalArray?.length ?? 0;
  let retainedLength = workingLength;
  let selectedGeneration = generation;
  const items = new Map<string, string>();
  originalArray?.forEach((value, index) => {
    if (value !== undefined) items.set(`0:${index}`, value);
  });
  for (const event of events)
    switch (event.kind) {
      case 'name':
        selected.set(event.channel, event.value);
        break;
      case 'fill': {
        const baseline = initial.get(event.channel);
        if (baseline === undefined) selected.delete(event.channel);
        else selected.set(event.channel, baseline);
        break;
      }
      case 'resize':
        if (event.items === undefined) {
          workingLength = 0;
          retainedLength = originalArray?.length ?? 0;
          selectedGeneration = -1;
        } else {
          if (workingLength < event.length) generation++;
          workingLength = retainedLength = event.length;
          selectedGeneration = generation;
          for (let index = 0; index < event.length; index++) {
            const value = event.items[index];
            const key = `${generation}:${index}`;
            if (value === undefined) items.delete(key);
            else items.set(key, value);
          }
        }
        break;
      case 'close':
        if (event.policy === 'unset') selected.delete(Y);
        else if (event.policy !== 'keep') selected.set(Y, event.resolved);
        else if (originalArray)
          selected.set(
            Y,
            Array.from({ length: retainedLength }, (_, index) =>
              selectedGeneration === -1
                ? originalArray[index]
                : items.get(`${selectedGeneration}:${index}`),
            ),
          );
        break;
    }
  return Object.fromEntries(selected);
};
