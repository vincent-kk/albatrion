import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import type { AuthoredSchema } from '../types/jsonSchema';
import { ValidationMode } from '../types/state';

describe('a batched read interprets earlier caller writes under each static type (EVENT-061)', () => {
  const schema: AuthoredSchema = {
    type: 'object',
    properties: {
      n: { type: 'number' },
      box: { type: 'object', properties: { m: { type: 'number' } } },
    },
  };
  const double = (value: unknown) =>
    typeof value === 'number' ? value * 2 : -1;

  it('a scalar updater reads the number an earlier string write produced', () => {
    for (const batched of [false, true]) {
      const root = nodeFromJSONSchema({
        jsonSchema: schema,
        defaultValue: { n: 1 },
        validationMode: ValidationMode.None,
      });
      const apply = () => {
        root.find('/n')!.setValue('2');
        root.find('/n')!.setValue(double);
      };
      if (batched) root.batch(apply);
      else apply();
      expect(root.find('/n')!.value).toBe(4);
    }
  });

  it('an object updater reads the numbers an earlier object write produced', () => {
    for (const batched of [false, true]) {
      const root = nodeFromJSONSchema({
        jsonSchema: schema,
        defaultValue: { box: { m: 1 } },
        validationMode: ValidationMode.None,
      });
      const apply = () => {
        root.find('/box')!.setValue({ m: '5' });
        root.find('/box')!.setValue((previous: unknown) => ({
          m: double(
            previous !== null && typeof previous === 'object' && 'm' in previous
              ? previous.m
              : undefined,
          ),
        }));
      };
      if (batched) root.batch(apply);
      else apply();
      expect(root.find('/box')!.value).toEqual({ m: 10 });
    }
  });

  it('a virtual group updater reads the number an earlier constituent write produced', () => {
    for (const batched of [false, true]) {
      const root = nodeFromJSONSchema({
        jsonSchema: {
          type: 'object',
          properties: { a: { type: 'number' }, b: { type: 'string' } },
          options: { virtual: { group: { fields: ['a', 'b'] } } },
        },
        defaultValue: { a: 1, b: 'b0' },
        validationMode: ValidationMode.None,
      });
      const seen: unknown[] = [];
      const apply = () => {
        root.find('/a')!.setValue('2');
        root.find('/group')!.setValue((previous: unknown) => {
          seen.push(previous);
          return previous;
        });
      };
      if (batched) root.batch(apply);
      else apply();
      expect(seen).toEqual([[2, 'b0']]);
    }
  });
});
