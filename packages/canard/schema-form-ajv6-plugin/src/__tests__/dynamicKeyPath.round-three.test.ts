import type { JSONSchema } from '@canard/schema-form';
import { describe, expect, it } from 'vitest';

import { plugin } from '../index';

/**
 * AJV6 writes a dynamic key (additionalProperties, patternProperties) into dataPath as
 * `['<key>']` without escaping it, unlike a `properties` key. The plugin decodes both the same way.
 */
const validate = async (schema: JSONSchema, data: unknown) => {
  const issues = await plugin.validator.compile(schema)(data);
  return (issues ?? []).map((issue) => [issue.keyword, issue.dataPath]);
};

describe('ajv6 dataPath of dynamic property names', () => {
  it.each([
    ["it's"],
    ['C:\\new'],
    ['a\\\\b'],
    ["O'Brien"],
    ['plain'],
    [''],
    ['a/b~c'],
    ["a']['b"],
  ])('additionalProperties issue for key %j points at that key', async (key) => {
    const result = await validate(
      { type: 'object', additionalProperties: { type: 'string', minLength: 30 } },
      { [key]: 'short' },
    );
    expect(result).toEqual([['minLength', '/' + key.replace(/~/g, '~0').replace(/\//g, '~1')]]);
  });

  it.each([["it's"], ['C:\\new'], ['plain']])(
    'patternProperties issue for key %j points at that key',
    async (key) => {
      const result = await validate(
        { type: 'object', patternProperties: { '.': { type: 'string', minLength: 30 } } },
        { [key]: 'short' },
      );
      expect(result).toEqual([['minLength', '/' + key]]);
    },
  );

  it("a nested issue under dynamic key \"it's\" does not point at the root field of the same name", async () => {
    const result = await validate(
      {
        type: 'object',
        properties: { x: { type: 'string' } },
        additionalProperties: {
          type: 'object',
          properties: { x: { type: 'string', minLength: 3 } },
        },
      },
      { x: 'valid', "it's": { x: 'a' } },
    );
    expect(result).toEqual([['minLength', "/it's/x"]]);
  });
});
