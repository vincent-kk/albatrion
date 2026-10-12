import { describe, expect, it, vi } from 'vitest';
import { isArray } from '@winglet/common-utils/filter';
import { SchemaFormError } from '../../../errors';
import type { BlueprintSchema } from '../../blueprint';
import type { Validator } from '../../validation';
import { dispatchSetValue } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';

const conflict: BlueprintSchema = { type: 'object', allOf: [
  { controls: { active: 'true' }, properties: { shared: { type: 'number' } } },
  { controls: { active: 'true' }, properties: { shared: { type: 'string' } } },
] };
const guard: BlueprintSchema = { type: 'object', if: {},
  then: { properties: { guarded: { type: 'string' } } } };
const validator: Validator = { compile: () => () => null,
  compileGuard: () => () => { throw new Error('guard'); } };

describe('ERROR-004 ERROR-005 58C-01 all dispatch settlement failures', () => {
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
    const report = vi.fn();
    const { root } = createDispatchTree(schema, undefined, validator,
      { hasConsumer: () => true, report });
    let caught: unknown;
    try { dispatchSetValue(root, value); }
    catch (error) { caught = error; }
    if (!(caught instanceof SchemaFormError)) throw new Error('Expected form error');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
    const errors = caught.details.errors;
    if (!isArray(errors)) throw new Error('Expected ordered errors');
    expect(errors.map((error) => error.code)).toEqual(codes.map((code) => `SCHEMA_FORM_ERROR.${code}`));
    expect(errors.map((error) => error.details.path)).toEqual(paths);
    expect(root.runtime.diagnostics.cause).toBe(cause);
    expect(report.mock.calls.map(([record]) => record.code)).toEqual(errors.map((error) => error.code));
    for (const [index, [record]] of report.mock.calls.entries()) {
      expect(record.error).toBe(errors[index]);
      expect(record.aggregate).toBe(caught);
    }
    if (codes.includes('BUDGET_EXCEEDED')) {
      expect(root.runtime.diagnostics).toMatchObject({ exceededBudget: 'derive', iterations: 25 });
      expect(root.emit).toMatchObject({ left: 0, right: 0 });
    }
  });

it.each(['derived', 'resetInteraction', 'unsetOnInactive', 'visible'] as const)(
    'keeps two distinct %s expression failures', (key) => {
      const evaluated: string[] = [];
      const { root } = createDispatchTree({ type: 'object', properties: {
        a: { type: 'number', controls: { [key]: '@.fail("a")' } },
        z: { type: 'number', controls: { [key]: '@.fail("z")' } },
      } });
      root.runtime.context = { fail: (name: string) => {
        evaluated.push(name);
        throw new Error(name);
      } };
      let caught: unknown;
      try { dispatchSetValue(root, { a: 1, z: 2 }); }
      catch (error) { caught = error; }
      if (!(caught instanceof SchemaFormError)) throw new Error('Expected form error');
      expect(caught.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
      const errors = caught.details.errors;
      if (!isArray(errors)) throw new Error('Expected ordered errors');
      expect(errors.map((error) => error.code)).toEqual([
        'SCHEMA_FORM_ERROR.EXPRESSION_THREW', 'SCHEMA_FORM_ERROR.EXPRESSION_THREW',
      ]);
      expect(evaluated).toHaveLength(2);
      expect(errors.map((error) => error.details.path)).toEqual(evaluated.map((name) => `/${name}`));
      expect(errors.map((error) => error.details.schemaPath)).toEqual(
        evaluated.map((name) => `#/properties/${name}/controls/${key}`));
    });

  it('keeps missing injection targets after an earlier conflict', () => {
    const evaluated: string[] = [];
    const { root } = createDispatchTree({ type: 'object', properties: {
      a: conflict,
      first: { type: 'string', controls: { injectTo: () => {
        evaluated.push('/missing1');
        return { '../missing1': 'X' };
      } } },
      second: { type: 'string', controls: { injectTo: () => {
        evaluated.push('/missing2');
        return { '../missing2': 'Y' };
      } } },
      filled: { type: 'string', default: 'fill' },
    } });
    let caught: unknown;
    try { dispatchSetValue(root, { a: { shared: 1 }, first: 'go', second: 'go' }); }
    catch (error) { caught = error; }
    if (!(caught instanceof SchemaFormError)) throw new Error('Expected form error');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
    const errors = caught.details.errors;
    if (!isArray(errors)) throw new Error('Expected ordered errors');
    expect(errors.map((error) => error.code)).toEqual([
      'SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT',
      'SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING', 'SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING',
    ]);
    expect(evaluated).toHaveLength(2);
    expect(errors.map((error) => error.details.path)).toEqual(['/a/shared', ...evaluated]);
    expect(root.runtime.diagnostics.cause).toBe('sharedConflict');
    expect(root.emit).toMatchObject({ filled: 'fill' });
  });

  it('throws a single non-gate error itself', () => {
    const { root } = createDispatchTree({ type: 'object', properties: { a: conflict } }, undefined, validator);
    expect(() => dispatchSetValue(root, { a: { shared: 1 } })).toThrowError(
      expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT' }));
  });
});
