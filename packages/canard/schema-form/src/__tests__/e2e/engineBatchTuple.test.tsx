import { expect, it } from 'vitest';

import { mountEngineForm } from './fixtures/mountEngineForm';

it.each([false, true])(
  'rejects a shortened deferred virtual tuple before committing the segment (sibling mark=%s)',
  (withSibling) => {
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
          c: { type: 'number' },
        },
        options: { virtual: { pair: { fields: ['a', 'b'] } } },
      },
      defaultValue: { a: 'oldA', b: 'oldB', c: 0 },
    });
    const pair = root.find('/pair')!;
    const tuple = ['x', 'y'];

    expect(() =>
      root.batch(() => {
        pair.setValue(tuple);
        if (withSibling) root.find('/c')!.setValue(1);
        tuple.pop();
      }),
    ).toThrow('Invalid virtual node values at /pair');
    expect(root.value).toEqual({ a: 'oldA', b: 'oldB', c: 0 });
  },
);
