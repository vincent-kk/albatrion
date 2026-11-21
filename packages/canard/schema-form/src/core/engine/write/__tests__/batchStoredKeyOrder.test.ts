import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../../types/state';

it('publishes the declared key order to a later object updater', () => {
  const run = (batched: boolean) => {
    const root = nodeFromJSONSchema({
      jsonSchema: {
        type: 'object',
        properties: {
          o: {
            type: 'object',
            properties: { a: { type: 'string' }, b: { type: 'string' } },
          },
        },
      },
      defaultValue: {},
      disableAutomaticWrites: true,
      validationMode: ValidationMode.None,
    });
    const o = root.find('/o')!;
    const calls = () => {
      o.setValue({ b: 'B', a: 'A' });
      o.setValue((value: unknown) => ({
        a: Object.keys(
          value !== null && typeof value === 'object' ? value : {},
        ).join(','),
      }));
    };
    if (batched) root.batch(calls);
    else calls();
    return root.value;
  };
  expect(run(false)).toEqual({ o: { a: 'a,b' } });
  expect(run(true)).toEqual(run(false));
});
