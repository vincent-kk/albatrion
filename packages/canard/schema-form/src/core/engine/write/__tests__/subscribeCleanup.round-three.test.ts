import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { FieldNodeEventType } from '../../record';

it('round-3: repeated old cleanup is equivalent to one cleanup for a later listener', () => {
  const run = (repeat: boolean) => {
    const root = nodeFromJSONSchema({
      jsonSchema: { type: 'string' },
      defaultValue: 'a',
    });
    const cleanup = root.subscribe(() => {});
    cleanup();
    const events: number[] = [];
    root.subscribe((event) =>
      events.push(event.type & FieldNodeEventType.UpdateValue),
    );
    if (repeat) cleanup();
    root.setValue('b');
    return events;
  };
  expect(run(false)).toEqual([FieldNodeEventType.UpdateValue]);
  expect(run(true)).toEqual(run(false));
});
