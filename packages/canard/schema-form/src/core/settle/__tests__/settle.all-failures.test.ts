import { describe, expect, it } from 'vitest';
import { isArray } from '@winglet/common-utils/filter';
import { SchemaFormError } from '../../../errors';
import type { BlueprintSchema } from '../../blueprint';
import type { Validator } from '../../validation';
import { writeSchemaNode } from '../index';
import { SetValueOption } from '../../types/value';
import { createTestTree } from './fixtures/createTestTree';

const conflict: BlueprintSchema = { type: 'object', allOf: [
  { controls: { active: 'true' }, properties: { shared: { type: 'number' } } },
  { controls: { active: 'true' }, properties: { shared: { type: 'string' } } },
] };
const guard: BlueprintSchema = { type: 'object', if: {},
  then: { properties: { guarded: { type: 'string' } } } };
const validator: Validator = { compile: () => () => null,
  compileGuard: () => () => { throw new Error('guard'); } };

describe('ERROR-004 ERROR-005 58C-01 all settle settlement failures', () => {
  it.each([
    { name: 'gate then conflict', schema: { type: 'object', properties: { a: guard, z: conflict } },
      value: { a: { shared: 1 }, z: { shared: 1 } },
      codes: ['GUARD_FAILED', 'SHARED_NODE_CONFLICT'], paths: ['/a', '/z/shared'], cause: 'expression' },
    { name: 'two conflicts', schema: { type: 'object', properties: { a: conflict, z: conflict } },
      value: { a: { shared: 1 }, z: { shared: 1 } },
      codes: ['SHARED_NODE_CONFLICT', 'SHARED_NODE_CONFLICT'], paths: ['/a/shared', '/z/shared'], cause: 'sharedConflict' },
    { name: 'guard then budget', schema: { type: 'object', if: {}, then: guard.then, properties: {
      left: { type: 'number', controls: { derived: '../right + 1' } },
      right: { type: 'number', controls: { derived: '../left + 1' } },
    } }, value: { left: 0, right: 0 },
      codes: ['GUARD_FAILED', 'BUDGET_EXCEEDED'], paths: ['', ''], cause: 'expression' },
  ] satisfies { name: string; schema: BlueprintSchema; value: unknown;
    codes: string[]; paths: string[]; cause: string }[])('$name preserves all failures in occurrence order', ({ schema, value, codes, paths, cause }) => {
    const { root } = createTestTree(schema, validator);
    let caught: unknown;
    try { writeSchemaNode(root, value, 'callerReplace', SetValueOption.Overwrite); }
    catch (error) { caught = error; }
    if (!(caught instanceof SchemaFormError)) throw new Error('Expected form error');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
    const errors = caught.details.errors;
    if (!isArray(errors)) throw new Error('Expected ordered errors');
    expect(errors.map((error) => error.code)).toEqual(codes.map((code) => `SCHEMA_FORM_ERROR.${code}`));
    expect(errors.map((error) => error.details.path)).toEqual(paths);
    expect(root.runtime.diagnostics.cause).toBe(cause);
    if (codes.includes('BUDGET_EXCEEDED')) {
      expect(root.runtime.diagnostics).toMatchObject({ exceededBudget: 'derive', iterations: 25 });
      expect(root.emit).toMatchObject({ left: 0, right: 0 });
    }
  });

  it('throws a single non-gate error itself', () => {
    const { root } = createTestTree({ type: 'object', properties: { a: conflict } }, validator);
    expect(() => writeSchemaNode(root, { a: { shared: 1 } }, 'callerReplace', SetValueOption.Overwrite)).toThrowError(
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT' }));
  });
});
