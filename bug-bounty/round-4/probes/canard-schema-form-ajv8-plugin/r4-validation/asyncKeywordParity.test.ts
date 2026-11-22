import Ajv8 from 'ajv';
import { describe, expect, it } from 'vitest';

import { createValidator as createAjv8 } from '../../default/index';
// Plugin sources and the AJV copies they resolve from their package folders.
import Ajv6 from '../../../../schema-form-ajv6-plugin/node_modules/ajv';
import { createValidator as createAjv6 } from '../../../../schema-form-ajv6-plugin/src/index';
import Ajv7 from '../../../../schema-form-ajv7-plugin/node_modules/ajv';
import { createValidator as createAjv7 } from '../../../../schema-form-ajv7-plugin/src/index';

/**
 * EQ11. Whole-schema validation may be asynchronous (validation-ux.md:89), and the AJV 6 and AJV 8
 * factories add `$async: true` to the transient root. The same schema with and without a root
 * `$id`, and the same schema across the three plugins, should give the same verdict for an
 * asynchronous keyword.
 */
const addAsyncKeyword = (ajv: any, major: 6 | 7 | 8) => {
  const definition = {
    async: true,
    validate: (_schema: boolean, data: string) => Promise.resolve(data !== 'taken'),
  };
  if (major === 6) ajv.addKeyword('availableName', definition);
  else ajv.addKeyword({ keyword: 'availableName', ...definition });
  return ajv;
};

const factories = {
  ajv6: () => createAjv6(addAsyncKeyword(new (Ajv6 as any)({ allErrors: true }), 6)),
  ajv7: () => createAjv7(addAsyncKeyword(new (Ajv7 as any)({ allErrors: true, strict: false }), 7)),
  ajv8: () => createAjv8(addAsyncKeyword(new Ajv8({ allErrors: true, strict: false }), 8)),
};

const verdict = async (factory: () => any, withId: boolean, explicitAsync = false) => {
  const schema: any = {
    type: 'object',
    properties: { name: { type: 'string', availableName: true } },
  };
  if (withId) schema.$id = 'https://example.com/signup.json';
  if (explicitAsync) schema.$async = true;
  try {
    const issues = await factory().compile(schema)({ name: 'taken' });
    return (issues ?? []).map((issue: any) => `${issue.keyword} ${issue.dataPath}`);
  } catch (error) {
    return `threw: ${(error as Error).message}`;
  }
};

describe.each(['ajv6', 'ajv7', 'ajv8'] as const)('%s asynchronous keyword in whole validation', (name) => {
  it('root without $id reports the keyword issue', async () => {
    expect(await verdict(factories[name], false)).toEqual(['availableName /name']);
  });
  it('root with $id reports the same keyword issue', async () => {
    expect(await verdict(factories[name], true)).toEqual(['availableName /name']);
  });
  it('[control] a root that declares $async: true itself reports the keyword issue, with and without $id', async () => {
    expect([await verdict(factories[name], false, true), await verdict(factories[name], true, true)]).toEqual([
      ['availableName /name'],
      ['availableName /name'],
    ]);
  });
});
