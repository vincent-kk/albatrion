import { expect, it } from 'vitest';

import { mountEngineForm } from './fixtures/mountEngineForm';

it.each(['items', 'prefixItems'] as const)(
  'uses the default %s candidate when a batch updater reads an uncreated slot',
  (keyword) => {
    const root = mountEngineForm({
      jsonSchema: {
        type: 'object',
        properties: {
          a: { type: 'boolean' },
          b: { type: 'boolean' },
          list: {
            type: 'array',
            allOf: [
              {
                controls: { active: '../a' },
                [keyword]:
                  keyword === 'items'
                    ? { type: 'string' }
                    : [{ type: 'string' }],
              },
              {
                controls: { active: '../b' },
                [keyword]:
                  keyword === 'items'
                    ? { type: 'number' }
                    : [{ type: 'number' }],
              },
            ],
          },
        },
      },
      defaultValue: { a: false, b: true, list: [] },
    });
    const list = root.find('/list')!;
    expect(list.find('./0')).toBeNull();
    const seen: unknown[] = [];
    root.batch(() => {
      list.setValue([12]);
      list.setValue((value: unknown) => {
        seen.push(value);
        return [13];
      });
    });
    expect(seen).toEqual([['12']]);
    expect(root.find('/list/0')!.value).toBe(13);
  },
);
