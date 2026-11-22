import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../types/state';

it('reads the absence from an earlier whole mark before filling or selecting a host', () => {
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        open: { type: 'boolean' },
        o: {
          type: 'object',
          controls: { active: '/open === true' },
          properties: { amount: { type: 'number', default: 5 } },
        },
      },
    },
    defaultValue: { open: true, o: { amount: 1 } },
    validationMode: ValidationMode.None,
  });
  const host = root.find('/o')!;
  const seen: unknown[] = [];
  root.batch(() => {
    root.setValue({ open: true });
    host.setValue((previous: unknown) => {
      seen.push(previous, host.value, root.find('/o/amount')!.value);
      return { amount: 7 };
    });
  });
  expect(seen).toEqual([undefined, { amount: 1 }, 1]);
  expect(host.value).toEqual({ amount: 7 });
});
