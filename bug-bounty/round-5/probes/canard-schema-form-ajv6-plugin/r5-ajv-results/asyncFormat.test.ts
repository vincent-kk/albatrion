/**
 * r5-ajv-results: an asynchronous AJV format in whole-schema validation.
 * Imports the plugin source (`../../index`) and the AJV 6.12.6 copy the plugin resolves.
 * The `[bisect]` rows load the plugin source of a given commit from `./bisect/<commit>/`.
 */
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

import * as current from '../../index';
import * as at6326 from './bisect/6326b9730/index';
import * as before6326 from './bisect/6326b9730-parent/index';

type PluginModule = typeof current;

const createInstance = () => {
  const ajv = new Ajv({ allErrors: true });
  ajv.addFormat('available', {
    async: true,
    validate: async (data: unknown) => data !== 'taken',
  } as never);
  return ajv;
};

let sequence = 0;
const schemaOf = (options: { id: boolean; declared?: boolean }) => ({
  ...(options.id ? { $id: `https://example.com/r5-format-${++sequence}.json` } : {}),
  ...(options.declared ? { $async: true } : {}),
  type: 'object',
  properties: { name: { type: 'string', format: 'available', minLength: 3 } },
});

const run = async (module: PluginModule, schema: object) => {
  try {
    const validate = module.createValidator(createInstance()).compile(schema as never);
    const issues = (await validate({ name: 'taken' })) as
      | { keyword?: string; dataPath: string }[]
      | null;
    return issues === null ? [] : issues.map((issue) => `${issue.keyword} ${issue.dataPath}`);
  } catch (error) {
    return `threw: ${(error as Error).message}`;
  }
};

describe('ajv6: asynchronous format in whole validation', () => {
  it('a root without $id reports the format issue', async () => {
    expect(await run(current, schemaOf({ id: false }))).toEqual(['format /name']);
  });

  it('a root with $id reports the format issue', async () => {
    expect(await run(current, schemaOf({ id: true }))).toEqual(['format /name']);
  });

  it('a root without $id reports the format issue through plugin.validator.bind', async () => {
    current.plugin.validator.bind(createInstance());
    let result: unknown;
    try {
      const issues = (await current.plugin.validator.compile(
        schemaOf({ id: false }) as never,
      )({ name: 'taken' })) as { keyword?: string; dataPath: string }[] | null;
      result = issues === null ? [] : issues.map((issue) => `${issue.keyword} ${issue.dataPath}`);
    } catch (error) {
      result = `threw: ${(error as Error).message}`;
    }
    expect(result).toEqual(['format /name']);
  });

  it('[control] a root that declares $async: true itself reports the format issue', async () => {
    expect(await run(current, schemaOf({ id: false, declared: true }))).toEqual([
      'format /name',
    ]);
  });

  it('[control] the public createValidatorFactory, which forces asynchronous compilation, reports the format issue', async () => {
    const validate = current.createValidatorFactory(createInstance())(
      schemaOf({ id: false }) as never,
    );
    const issues = (await validate({ name: 'taken' })) as { keyword?: string; dataPath: string }[];
    expect(issues.map((issue) => `${issue.keyword} ${issue.dataPath}`)).toEqual([
      'format /name',
    ]);
  });
});

describe('ajv6 bisect: asynchronous format in a root without $id', () => {
  it('[bisect] at 6326b9730^ a root without $id reports the format issue', async () => {
    expect(
      await run(before6326 as unknown as PluginModule, schemaOf({ id: false })),
    ).toEqual(['format /name']);
  });

  it('[bisect] at 6326b9730 a root without $id reports the format issue', async () => {
    expect(await run(at6326 as unknown as PluginModule, schemaOf({ id: false }))).toEqual([
      'format /name',
    ]);
  });
});
