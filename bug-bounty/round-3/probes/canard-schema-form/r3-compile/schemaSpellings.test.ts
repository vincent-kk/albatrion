import { describe, expect, it } from 'vitest';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

const attempt = (fn: () => unknown) => {
  try {
    return fn();
  } catch (error) {
    return { error: String((error as any)?.code ?? error) };
  }
};

/** Observable state of the field at `/f` after loading and writing a sequence of values. */
const trace = (fieldSchema: any, load: any, writes: any[]) =>
  attempt(() => {
    const root = tree({ type: 'object', properties: { f: fieldSchema }, $defs: { S: { type: ['string', 'null'] } } }, load);
    const read = () => {
      const f = root.find('/f');
      return {
        type: f?.type,
        nullable: f?.isNullable,
        value: f?.value,
        output: root.outputValue,
        misfit: f?.isMisfit,
        children: f?.children?.map((c: any) => c.path) ?? null,
      };
    };
    const seen = [read()];
    for (const write of writes) {
      root.find('/f').setValue(write);
      seen.push(read());
    }
    return seen;
  });

const families: [string, any[], any[], any[]][] = [
  [
    'nullable string',
    [
      { type: 'string', nullable: true },
      { type: ['string', 'null'] },
      { type: ['null', 'string'] },
      { allOf: [{ type: ['string', 'null'] }] },
    ],
    [{ f: null }, { f: 'x' }, {}],
    [null, 'y', undefined, null, 5],
  ],
  [
    'nullable number',
    [
      { type: 'number', nullable: true },
      { type: ['number', 'null'] },
      { type: ['null', 'number'] },
    ],
    [{ f: null }, { f: 0 }, { f: -0 }, { f: 1e21 }],
    [null, 0, -0, 1e21, Number.MAX_SAFE_INTEGER, 'x'],
  ],
  [
    'nullable integer',
    [
      { type: 'integer', nullable: true },
      { type: ['integer', 'null'] },
      { type: ['null', 'integer'] },
    ],
    [{ f: null }, { f: 1.5 }, { f: 2 }],
    [null, 2, 2.5, 1e21],
  ],
  [
    'nullable object',
    [
      { type: 'object', nullable: true, properties: { a: { type: 'string', default: 'd' } } },
      { type: ['object', 'null'], properties: { a: { type: 'string', default: 'd' } } },
      { type: ['null', 'object'], properties: { a: { type: 'string', default: 'd' } } },
    ],
    [{ f: null }, { f: {} }, {}],
    [null, { a: 'x' }, null, {}],
  ],
  [
    'nullable array',
    [
      { type: 'array', nullable: true, items: { type: 'string' } },
      { type: ['array', 'null'], items: { type: 'string' } },
      { type: ['null', 'array'], items: { type: 'string' } },
    ],
    [{ f: null }, { f: [] }, { f: ['a'] }],
    [null, ['x'], null, []],
  ],
  [
    'single-element type list',
    [{ type: 'string' }, { type: ['string'] }, { allOf: [{ type: 'string' }] }],
    [{ f: 'x' }, { f: 1 }, {}],
    ['y', 2, undefined, null],
  ],
  [
    'enum-inferred string',
    [{ type: 'string', enum: ['a', 'b'] }, { enum: ['a', 'b'] }],
    [{ f: 'a' }, { f: 'z' }, {}],
    ['b', 'z', 1, undefined],
  ],
  [
    'const-inferred number',
    [{ type: 'number', const: 0 }, { const: 0 }],
    [{ f: 0 }, { f: -0 }, {}],
    [0, -0, 1, undefined],
  ],
  [
    'tuple spellings',
    [
      { type: 'array', items: [{ type: 'string' }, { type: 'number' }], additionalItems: { type: 'boolean' } },
      { type: 'array', prefixItems: [{ type: 'string' }, { type: 'number' }], items: { type: 'boolean' } },
    ],
    [{ f: ['a', 1, true] }, { f: [] }, {}],
    [['b', 2], ['c', 3, false, true], []],
  ],
  [
    'closed tuple spellings',
    [
      { type: 'array', items: [{ type: 'string' }, { type: 'number' }], additionalItems: false },
      { type: 'array', prefixItems: [{ type: 'string' }, { type: 'number' }], items: false },
    ],
    [{ f: ['a', 1] }, { f: ['a', 1, 'extra'] }],
    [['b', 2], ['c', 3, 'x']],
  ],
  [
    'nullable via $ref',
    [
      { $ref: '#/$defs/S' },
      { type: ['string', 'null'] },
    ],
    [{ f: null }, { f: 'x' }],
    [null, 'y'],
  ],
];

describe('equivalent schema spellings', () => {
  for (const [label, spellings, loads, writes] of families)
    it(label, () => {
      const results = spellings.map((fieldSchema) =>
        loads.map((load) =>
          JSON.stringify(
            trace(
              label === 'nullable via $ref' && fieldSchema.$ref
                ? fieldSchema
                : fieldSchema,
              load,
              writes,
            ),
          ),
        ),
      );
      const mismatches: any[] = [];
      for (let index = 1; index < results.length; index++)
        for (let load = 0; load < loads.length; load++)
          if (results[index][load] !== results[0][load])
            mismatches.push({
              spelling: spellings[index],
              load: loads[load],
              expected: JSON.parse(results[0][load]),
              actual: JSON.parse(results[index][load]),
            });
      expect(mismatches.slice(0, 3)).toEqual([]);
      expect(results[0].filter((r) => r.startsWith("{\"error"))).toEqual([]);
    });
});
