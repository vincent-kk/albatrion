import { expect, it } from 'vitest';
import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';
import { SetValueOption, ValidationMode } from '@/schema-form';
import { isDeepStrictEqual } from 'node:util';

it('fixed topology caller whole and Merge ownership agrees between sequential and batched writes', () => {
  let seed = 61678;
  const random = (n: number) => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 16) % n; };
  let count = 0;
  const examples: unknown[] = [];
  for (let trial = 0; trial < 1000; trial++) {
    const create = () => nodeFromJSONSchema({
      jsonSchema: { type: 'object', properties: {
        open: { type: 'boolean' },
        box: { type: 'object', properties: {
          shown: { type: 'string' },
          held: { type: 'object', controls: { active: '/open === true' }, properties: {
            a: { type: 'string' }, b: { type: 'string' },
            list: { type: 'array', items: { type: 'string' } },
          } },
        } },
      } },
      defaultValue: { open: false, box: { shown: 'shown', held: { a: 'A', b: 'B', list: ['L'] } } },
      validationMode: ValidationMode.None,
    });
    const operations = Array.from({ length: 2 + random(5) }, (_, index) => {
      const shapes = [
        {}, { shown: `s${index}` }, { held: { a: `a${index}` } },
        { held: { b: `b${index}` } }, { held: { list: [`l${index}`] } },
        { held: undefined }, { held: { a: undefined } },
        { held: { list: [] } }, { held: {} }, { held: null },
      ];
      return { route: random(2), merge: random(2), value: shapes[random(shapes.length)] };
    });
    const run = (batch: boolean) => {
      const root = create();
      const apply = () => {
        for (const op of operations) {
          const option = op.merge ? SetValueOption.Merge : SetValueOption.Overwrite;
          if (op.route) root.find('/box')!.setValue(op.value, option);
          else root.setValue({ open: false, box: op.value }, option);
        }
      };
      if (batch) root.batch(apply); else apply();
      const inactive = root.inactiveValues;
      root.find('/open')!.setValue(true);
      return { inactive, value: root.value };
    };
    const batched = run(true);
    const sequential = run(false);
    if (!isDeepStrictEqual(batched, sequential)) {
      count++;
      if (examples.length < 3) examples.push({ trial, operations, batched, sequential });
    }
  }
  expect(count, JSON.stringify({ count, examples })).toBe(0);
});
