// Same-ajv path comparison: plugin validation versus direct Ajv on the authored schema.
// The cross-implementation oracle (TEST-001) awaits a non-ajv validator plugin.
import type { JSONSchema } from '@canard/schema-form';
import Ajv from 'ajv';
import type { ErrorObject } from 'ajv';
import Ajv2019 from 'ajv/dist/2019.js';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import { plugin as plugin2019 } from '../2019';
import { plugin as plugin2020 } from '../2020';
import { plugin as defaultPlugin } from '../default';

const settings = { allErrors: true, strictSchema: false,
  validateFormats: false, allowUnionTypes: true };
const entries = [
  { dialect: 'default', plugin: defaultPlugin,
    direct: () => new Ajv(settings) },
  { dialect: '2019', plugin: plugin2019,
    direct: () => new Ajv2019(settings) },
  { dialect: '2020', plugin: plugin2020,
    direct: () => new Ajv2020(settings) },
] as const;

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
  const path = error.instancePath;
  if (error.keyword !== 'required' ||
    !('missingProperty' in error.params) ||
    typeof error.params.missingProperty !== 'string') return path;
  return `${path}/${error.params.missingProperty.replace(/~/g, '~0').replace(/\//g, '~1')}`;
};

const uniquePaths = (paths: string[]): string[] => paths
  .filter((path, index) => paths.indexOf(path) === index).sort();

describe.each(entries)('same-ajv path comparison for the ajv8 $dialect entry',
  ({ plugin, direct }) => {
    it.each(cases)('$name', async ({ name, schema, value, valid }) => {
      const validateDirect = direct().compile(schema);
      const pluginSchema = JSON.parse(JSON.stringify(schema)) as JSONSchema;
      const validatePlugin = plugin.validator.compile(pluginSchema);
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
