import { expect, it } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/__tests__/fixtures/nodeFromJSONSchema';

import { ValidationMode } from '../../types/state';

it('round-3: routing a terminal collection does linear issue-array iteration work', async () => {
  const count = 2000;
  const issues = Array.from({ length: count }, (_, index) => ({
    dataPath: '/rows/' + index,
    keyword: 'roundThreeMany',
    message: String(index),
  }));
  const root = nodeFromJSONSchema({
    jsonSchema: {
      type: 'object',
      properties: {
        rows: {
          type: 'array',
          options: { terminal: true },
          items: { type: 'string' },
        },
      },
    },
    defaultValue: { rows: ['a'] },
    validationMode: ValidationMode.OnRequest,
    deferMountValidation: true,
    validator: { compile: () => () => issues, compileGuard: () => () => true },
  });
  let iterated = 0;
  const original = Array.prototype[Symbol.iterator];
  Array.prototype[Symbol.iterator] = function (this: unknown[]) {
    const first = this[0];
    if (
      first !== null &&
      typeof first === 'object' &&
      Reflect.get(first, 'keyword') === 'roundThreeMany'
    )
      iterated += this.length;
    return original.call(this);
  };
  try {
    await root.validate();
  } finally {
    Array.prototype[Symbol.iterator] = original;
  }
  expect(root.find('/rows')!.errors.map((issue) => issue.message)).toEqual(
    issues.map((issue) => issue.message),
  );
  expect(iterated).toBeLessThanOrEqual(count * 20);
  const before = root.find('/rows')!.errors;
  await root.validate();
  expect(root.find('/rows')!.errors).toEqual(before);
  expect(before).toHaveLength(count);
});
