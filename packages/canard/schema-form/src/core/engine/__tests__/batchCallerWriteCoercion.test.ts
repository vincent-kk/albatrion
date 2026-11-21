import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../types/state';
import { WriteOption } from '../types/value';

it('an updater observes the coerced caller value across an intervening Merge (EVENT-061)', () => {
  const observe = (batched: boolean) => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: { n: { type: 'number' }, other: { type: 'boolean' } },
      },
      defaultValue: { n: 1, other: false },
      validationMode: ValidationMode.None,
    });
    const write = () => {
      root.find('/n')!.setValue('2');
      root.setValue({ other: true }, WriteOption.Merge);
      root
        .find('/n')!
        .setValue((value: unknown) =>
          typeof value === 'number' ? value + 1 : -100,
        );
    };
    if (batched) root.batch(write);
    else write();
    return root.value;
  };
  const sequence = observe(false);
  expect(sequence).toEqual({ n: 3, other: true });
  expect(observe(true)).toEqual(sequence);
});
