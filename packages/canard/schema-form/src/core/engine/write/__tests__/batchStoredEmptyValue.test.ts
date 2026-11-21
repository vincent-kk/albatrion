import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../../types/state';

it.each(['object', 'array'] as const)(
  'assembles the explicitly cleared %s for its next updater',
  (kind) => {
    const run = (batched: boolean) => {
      const root = nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties: {
            target:
              kind === 'object'
                ? { type: 'object', properties: { child: { type: 'string' } } }
                : { type: 'array', items: { type: 'string' } },
          },
        },
        defaultValue: {
          target: kind === 'object' ? { child: 'entry' } : ['entry'],
        },
        disableAutomaticWrites: true,
        validationMode: ValidationMode.None,
      });
      const target = root.find('/target')!;
      const seen: unknown[] = [];
      const calls = () => {
        target.setValue(undefined);
        target.setValue((value: unknown) => {
          seen.push(value);
          return value;
        });
      };
      if (batched) root.batch(calls);
      else calls();
      return { seen, value: root.value };
    };
    const expected = run(false);
    expect(expected.seen).toEqual([kind === 'object' ? {} : []]);
    expect(run(true)).toStrictEqual(expected);
  },
);
