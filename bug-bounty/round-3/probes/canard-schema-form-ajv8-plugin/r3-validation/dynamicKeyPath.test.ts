import { describe, expect, it } from 'vitest';

import { plugin } from '../../default/index';

/** Control for the AJV6 dynamic-key dataPath finding: AJV8 escapes dynamic keys in instancePath. */
const validate = async (schema: object, data: unknown) => {
  const issues = await plugin.validator.compile(schema as any)(data);
  return (issues ?? []).map((issue) => [issue.keyword, issue.dataPath]);
};

describe('ajv8 dataPath of dynamic property names (control)', () => {
  it.each([["it's"], ['C:\\new'], ['a~b'], ['a/b'], ['%41']])(
    'additionalProperties issue for key %j points at that key',
    async (key) => {
      const result = await validate(
        { type: 'object', additionalProperties: { type: 'string', minLength: 30 } },
        { [key]: 'short' },
      );
      expect(result).toEqual([
        ['minLength', '/' + key.replace(/~/g, '~0').replace(/\//g, '~1')],
      ]);
    },
  );
});
