import { describe, expect, it } from 'vitest';

import type { JSONSchema as AuthoredSchema } from '../../index';
import { ValidationMode } from '../../index';
import { mountEngineForm } from './fixtures/mountEngineForm';

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
      const root = mountEngineForm({
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
      const root = mountEngineForm({
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
      const root = mountEngineForm({
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

  it('an object updater reads own declared fields in declaration order', () => {
    const root = mountEngineForm({ jsonSchema: schema });
    const reads: string[] = [];
    const input = Object.defineProperties(
      {},
      {
        box: {
          enumerable: true,
          get: () => {
            reads.push('box');
            return { m: '6' };
          },
        },
        n: {
          get: () => {
            reads.push('n');
            return '5';
          },
        },
      },
    );
    root.batch(() => {
      root.setValue(input);
      root.setValue((previous: unknown) => {
        expect(previous).toEqual({ n: 5, box: { m: 6 } });
        expect(reads).toEqual(['n', 'box']);
        return { n: 2 };
      });
    });
    expect(root.value).toEqual({ n: 2 });
  });

  it('an array updater leaves inherited indices as holes', () => {
    const root = mountEngineForm({
      jsonSchema: { type: 'array', items: { type: 'number' } },
      defaultValue: [1],
    });
    const input = Object.setPrototypeOf(
      new Array<unknown>(1),
      Object.create(Array.prototype, {
        0: {
          get: () => {
            throw new Error('read inherited element');
          },
        },
      }),
    );
    const seen: unknown[] = [];
    root.batch(() => {
      root.setValue(input);
      root.setValue((previous: unknown) => {
        seen.push(previous);
        return [2];
      });
    });
    expect(seen).toEqual([[null]]);
    expect(root.value).toEqual([2]);
  });

  it('a child updater receives undefined after its ancestor omits the child in an overwrite', () => {
    const root = mountEngineForm({
      jsonSchema: schema,
      defaultValue: { box: { m: 1 } },
    });
    const box = root.find('/box')!;
    const seen: unknown[] = [];
    root.batch(() => {
      root.setValue({});
      box.setValue((value: unknown) => {
        seen.push(value);
        return { m: 2 };
      });
    });
    expect(seen).toEqual([undefined]);
    expect(root.value).toEqual({ box: { m: 2 } });
  });
});
