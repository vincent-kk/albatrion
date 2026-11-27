// Same-ajv path comparison: plugin validation versus direct Ajv on the authored schema.
// The cross-implementation oracle (TEST-001) awaits a non-ajv validator plugin.
import type { JSONSchema } from '@canard/schema-form';
import { convertJSONPathToPointer } from '@winglet/json/path-common';
import Ajv from 'ajv';
import type { ErrorObject } from 'ajv';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { plugin } from '../index';

const cases = [
  { name: 'VALIDATE-036 if-only oneOf remains invalid',
    schema: { type: 'object', properties: { kind: { type: 'string' } },
      oneOf: [
        { if: { properties: { kind: { const: 'a' } }, required: ['kind'] },
          then: { properties: { a: { type: 'string' } }, required: ['a'] } },
        { if: { properties: { kind: { const: 'b' } }, required: ['kind'] },
          then: { properties: { b: { type: 'string' } }, required: ['b'] } },
      ] },
    value: { kind: 'a', a: 'A' }, valid: false },
  { name: 'VALIDATE-051 union type error stays at the union path',
    schema: { type: 'object', properties: {
      choice: { type: ['string', 'number'] },
    } }, value: { choice: { wrong: true } }, valid: false },
  { name: 'a valid authored value stays valid',
    schema: { type: 'object', properties: { name: { type: 'string' } },
      required: ['name'] }, value: { name: 'Ada' }, valid: true },
] as const;

const directPath = (error: ErrorObject): string => {
  const base = convertJSONPathToPointer(error.dataPath || '');
  const path = base === '/' ? '' : base;
  if (error.keyword !== 'required' ||
    !('missingProperty' in error.params) ||
    typeof error.params.missingProperty !== 'string') return path;
  return `${path}/${error.params.missingProperty.replace(/~/g, '~0').replace(/\//g, '~1')}`;
};

const uniquePaths = (paths: string[]): string[] => paths
  .filter((path, index) => paths.indexOf(path) === index).sort();

describe.each([true, false])('directGuardCompile=%s', (directGuardCompile) => {
  beforeEach(() => { plugin.validator.configure({ directGuardCompile }); });
  afterEach(() => { plugin.validator.configure({ directGuardCompile: true }); });
describe('same-ajv path comparison for the ajv6 plugin', () => {
  it.each(cases)('$name', async ({ name, schema, value, valid }) => {
    const direct = new Ajv({ allErrors: true, nullable: true,
      verbose: true, format: false });
    const validateDirect = direct.compile(schema);
    const pluginSchema = JSON.parse(JSON.stringify(schema)) as JSONSchema;
    const validatePlugin = plugin.validator.compile(pluginSchema);
    if ('oneOf' in schema) {
      for (const index of [0, 1]) {
        const guard = plugin.validator.compileGuard(pluginSchema, `/oneOf/${index}/if`);
        const expected = direct.compile(schema.oneOf[index].if);
        for (const candidate of [{ kind: 'a' }, { kind: 'b' }, {}, 1])
          expect(guard(candidate)).toBe(Boolean(expected(candidate)));
      }
    }
    const emitted = JSON.parse(JSON.stringify(value));
    const issues = await validatePlugin(emitted);
    const directValid = validateDirect(emitted);

    expect(directValid).toBe(valid);
    expect(issues === null).toBe(directValid);
    if (issues && validateDirect.errors)
      expect(uniquePaths(issues.map((issue) => issue.dataPath)))
        .toEqual(uniquePaths(validateDirect.errors.map(directPath)));
    if (name.startsWith('VALIDATE-051'))
      expect(issues).toContainEqual(expect.objectContaining({
        keyword: 'type', dataPath: '/choice',
      }));
    plugin.validator.release(pluginSchema);
  });
});

});
