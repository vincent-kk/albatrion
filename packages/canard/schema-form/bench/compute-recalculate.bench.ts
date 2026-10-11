import { bench, describe } from 'vitest';

import { type JSONSchema, nodeFromJSONSchema } from '@/schema-form/core';

/** Creates a public-core write/settle lane; includes dispatch unlike the legacy evaluator-only lane. */
function createRecalculation(schema: JSONSchema) {
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        a: { type: 'number', default: 1 },
        b: { type: 'number', default: 2 },
        c: { type: 'number', default: 3 },
        d: { type: 'number', default: 4 },
        e: { type: 'number', default: 5 },
        f: { type: 'number', default: 6 },
        g: { type: 'number', default: 7 },
        target: schema,
      },
    },
  });
  const source = root.find('/a')!;
  let value = 1;
  return () => {
    source.setValue((value = value === 1 ? 2 : 1));
  };
}

describe('settle: controls through public core', () => {
  bench(
    'visible only (1 dep)',
    createRecalculation({
      type: 'string',
      controls: { visible: '../a === 1' },
    }),
  );
  bench(
    'visible + active (2 deps)',
    createRecalculation({
      type: 'string',
      controls: {
        visible: '../a === 1',
        active: '../b !== 0',
      },
    }),
  );
  bench(
    'derived simple (2 deps)',
    createRecalculation({
      type: 'number',
      controls: { derived: '../a + ../b' },
    }),
  );
  bench(
    'derived heavy (7 deps)',
    createRecalculation({
      type: 'number',
      controls: {
        derived: '../a + ../b * ../c - ../d / (../e + 1) + ../f * ../g',
      },
    }),
  );
  bench(
    'watch 5 deps',
    createRecalculation({
      type: 'string',
      controls: { watch: ['../a', '../b', '../c', '../d', '../e'] },
    }),
  );
  bench(
    'oneOfIndex 3 branches',
    createRecalculation({
      type: 'object',
      oneOf: [
        {
          controls: { active: '../a === 1' },
          properties: { first: { type: 'string', default: 'a' } },
        },
        {
          controls: { active: '../a === 2' },
          properties: { second: { type: 'string', default: 'b' } },
        },
        {
          controls: { active: '../a === 3' },
          properties: { third: { type: 'string', default: 'c' } },
        },
      ],
    }),
  );
});
