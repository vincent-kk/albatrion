/**
 * r5-ajv-results: an asynchronous keyword or format in a root with `$id` that also contains a `$ref`.
 * Imports the plugin source of each entry (`../../default`, `../../2019`, `../../2020`) and AJV 8.17.1.
 */
import Ajv from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { createValidator as createValidator2019 } from '../../2019/index';
import { createValidator as createValidator2020 } from '../../2020/index';
import { createValidator } from '../../default/index';

const keyword = {
  keyword: 'available',
  async: true,
  validate: async (_schema: unknown, data: unknown) => data !== 'taken',
};
const format = { async: true, validate: async (data: unknown) => data !== 'taken' };

const entries = {
  default: { create: createValidator, Ajv, defs: 'definitions' },
  '2019': { create: createValidator2019, Ajv: Ajv2019, defs: '$defs' },
  '2020': { create: createValidator2020, Ajv: Ajv2020, defs: '$defs' },
} as const;

const instanceOf = (entry: (typeof entries)[keyof typeof entries]) => {
  const ajv = new entry.Ajv({ allErrors: true, strict: false });
  ajv.addKeyword(keyword);
  ajv.addFormat('availableName', format as never);
  return ajv;
};

let sequence = 0;
const idOf = (withId: boolean) =>
  withId ? { $id: `https://example.com/r5-ajv8-ref-${++sequence}.json` } : {};
const shapeOf = (
  defs: string,
  withId: boolean,
  shape: 'unrelated' | 'holder' | 'recursive',
  rule: object,
) => {
  const field = { type: 'string', minLength: 3, ...rule };
  if (shape === 'unrelated')
    return {
      ...idOf(withId),
      type: 'object',
      [defs]: { text: { type: 'string' } },
      properties: { name: field, note: { $ref: `#/${defs}/text` } },
    };
  if (shape === 'holder')
    return {
      ...idOf(withId),
      type: 'object',
      [defs]: { user: field },
      properties: { name: { $ref: `#/${defs}/user` } },
    };
  return {
    ...idOf(withId),
    type: 'object',
    properties: { name: field, child: { $ref: '#' } },
  };
};

const run = async (entry: (typeof entries)[keyof typeof entries], schema: object) => {
  try {
    const validate = entry.create(instanceOf(entry) as never).compile(schema as never);
    const issues = (await validate({ name: 'taken' })) as
      | { keyword?: string; dataPath: string }[]
      | null;
    return issues === null ? [] : issues.map((issue) => `${issue.keyword} ${issue.dataPath}`);
  } catch (error) {
    return `threw: ${(error as Error).message}`;
  }
};

const rules = {
  keyword: { rule: { available: true }, issue: 'available /name' },
  format: { rule: { format: 'availableName' }, issue: 'format /name' },
} as const;

for (const [entryName, entry] of Object.entries(entries)) {
  describe(`ajv8 ${entryName} entry: asynchronous rule in a root with $id and a $ref`, () => {
    for (const [ruleName, { rule, issue }] of Object.entries(rules))
      for (const shape of ['unrelated', 'holder', 'recursive'] as const) {
        it(`asynchronous ${ruleName}, ${shape} $ref: a root with $id reports the issue`, async () => {
          expect(await run(entry, shapeOf(entry.defs, true, shape, rule))).toEqual([issue]);
        });

        it(`[control] asynchronous ${ruleName}, ${shape} $ref: the same root without $id reports the issue`, async () => {
          expect(await run(entry, shapeOf(entry.defs, false, shape, rule))).toEqual([issue]);
        });
      }

    it('[control] plain AJV validates the same root with $id and a $ref once $async is declared', async () => {
      const validate = instanceOf(entry).compile({
        ...shapeOf(entry.defs, true, 'unrelated', rules.keyword.rule),
        $async: true,
      }) as (data: unknown) => Promise<unknown>;
      const result = await validate({ name: 'taken' }).then(
        () => 'valid',
        (error: { errors?: { keyword: string; instancePath: string }[] }) =>
          error.errors?.map((item) => `${item.keyword} ${item.instancePath}`),
      );
      expect(result).toEqual(['available /name']);
    });
  });
}
