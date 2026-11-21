/**
 * r5-ajv-results: an asynchronous AJV format in whole-schema validation.
 * Imports the plugin source (`../../index`) and the AJV 7.2.4 copy the plugin resolves.
 */
import AjvModule from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator, plugin } from '../../index';

const Ajv = ((AjvModule as unknown as { default?: unknown }).default ?? AjvModule) as new (
  options: object,
) => { addFormat(name: string, definition: object): void };

const createInstance = () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  ajv.addFormat('available', {
    async: true,
    validate: async (data: unknown) => data !== 'taken',
  });
  return ajv;
};

let sequence = 0;
const schemaOf = (options: { id: boolean; declared?: boolean }) => ({
  ...(options.id ? { $id: `https://example.com/r5-ajv7-format-${++sequence}.json` } : {}),
  ...(options.declared ? { $async: true } : {}),
  type: 'object',
  properties: { name: { type: 'string', format: 'available', minLength: 3 } },
});

const summarize = async (validate: (value: unknown) => unknown) => {
  const issues = (await validate({ name: 'taken' })) as
    | { keyword?: string; dataPath: string }[]
    | null;
  return issues === null ? [] : issues.map((issue) => `${issue.keyword} ${issue.dataPath}`);
};

const run = async (schema: object) => {
  try {
    return await summarize(createValidator(createInstance() as never).compile(schema as never));
  } catch (error) {
    return `threw: ${(error as Error).message}`;
  }
};

describe('ajv7: asynchronous format in whole validation', () => {
  it('a root without $id reports the format issue', async () => {
    expect(await run(schemaOf({ id: false }))).toEqual(['format /name']);
  });

  it('a root with $id reports the format issue', async () => {
    expect(await run(schemaOf({ id: true }))).toEqual(['format /name']);
  });

  it('a root without $id reports the format issue through plugin.validator.bind', async () => {
    plugin.validator.bind(createInstance() as never);
    let result: unknown;
    try {
      result = await summarize(plugin.validator.compile(schemaOf({ id: false }) as never));
    } catch (error) {
      result = `threw: ${(error as Error).message}`;
    }
    expect(result).toEqual(['format /name']);
  });

  it('[control] a root that declares $async: true itself reports the format issue', async () => {
    expect(await run(schemaOf({ id: false, declared: true }))).toEqual(['format /name']);
  });
});
