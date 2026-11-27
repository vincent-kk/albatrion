import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../../types/jsonSchema';
import { ValidationMode } from '../../types/state';

const schema = {
  type: 'object',
  properties: {
    yOn: { type: 'boolean' },
    other: { type: 'boolean' },
    object: {
      type: 'object',
      properties: {
        x: { type: 'string' },
        y: { type: 'string', controls: { active: '/yOn === true' } },
      },
    },
  },
} as const satisfies AuthoredSchema;

/**
 * Empty the object so its parent omits it while its own stored value stays an empty object,
 * then hand the updater's input to the caller, in a batch or alone.
 */
const observe = (batched: boolean) => {
  const root = nodeFromJSONSchema({
    jsonSchema: schema,
    defaultValue: { yOn: true, object: { x: 'x0' } },
    validationMode: ValidationMode.None,
  });
  root.find('/object')!.setValue(undefined);
  root.find('/object/y')!.setValue('y7');
  root.find('/yOn')!.setValue(false);
  const received: unknown[] = [];
  const write = () => {
    root.find('/other')!.setValue(true);
    root.find('/object')!.setValue((previous: unknown) => {
      received.push(previous);
      return previous;
    });
  };
  if (batched) root.batch(write);
  else write();
  return {
    received,
    value: root.value,
    retained: root.inactiveValues.map(({ path, value }) => ({ path, value })),
  };
};

it('a batched updater receives the target own committed value the same as outside a batch', () => {
  expect(observe(true)).toEqual(observe(false));
});
