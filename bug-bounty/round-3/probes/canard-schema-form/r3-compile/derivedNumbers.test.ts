import { describe, expect, it } from 'vitest';
import { appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { nodeFromJSONSchema } from '../../__tests__/fixtures/nodeFromJSONSchema';

const tree = (jsonSchema: any, defaultValue?: any) =>
  nodeFromJSONSchema({ jsonSchema, defaultValue } as any) as any;

const attempt = (fn: () => unknown) => {
  try {
    return { ok: fn() };
  } catch (error) {
    return { error: String((error as any)?.code ?? (error as any)?.message ?? error) };
  }
};

const schemaFor = (resultSchema: any, expression: string) => ({
  type: 'object',
  properties: {
    a: { type: 'number' },
    b: { type: 'number' },
    r: { ...resultSchema, controls: { derived: expression } },
  },
});

describe('derived results that are not plain JSON numbers', () => {
  const cases: [string, any, string, any, any][] = [
    ['NaN from an unset operand', { type: 'number' }, '../a * 2', {}, { a: 3 }],
    ['NaN from 0/0', { type: 'number' }, '../a / ../b', { a: 0, b: 0 }, { a: 1 }],
    ['Infinity from 1/0', { type: 'number' }, '../a / ../b', { a: 1, b: 0 }, { b: 2 }],
    ['-0', { type: 'number' }, '-(../a)', { a: 0 }, { a: 1 }],
    ['1e21', { type: 'number' }, '../a * 1e21', { a: 1 }, { a: 2 }],
    ['fresh array each round', { type: 'array', items: { type: 'number' } }, '[(../a), (../b)]', { a: 1, b: 2 }, { a: 3 }],
    ['fresh object each round', { type: 'object', properties: { s: { type: 'number' } } }, '({ s: ../a })', { a: 1 }, { a: 5 }],
    ['terminal fresh object', { type: 'object', options: { terminal: true } }, '({ s: ../a })', { a: 1 }, { a: 5 }],
  ];

  for (const [label, resultSchema, expression, load, write] of cases)
    it(label, () => {
      const outcome = attempt(() => {
        const root = tree(schemaFor(resultSchema, expression), load);
        const first = root.value;
        root.setValue(write, 2 /* Merge */);
        return { first, second: root.value };
      });
      appendFileSync(join(tmpdir(), 'r3-compile-diag.jsonl'), JSON.stringify({ label, outcome: JSON.parse(JSON.stringify(outcome, (k, v) => (typeof v === 'number' && !Number.isFinite(v)) || Object.is(v, -0) ? String(v) + (Object.is(v, -0) ? '(-0)' : '') : v)) }) + '\n');
      expect(outcome).not.toHaveProperty('error');
    });
});
