import { describe, expect, it, vi } from 'vitest';

import { isArray } from '@winglet/common-utils/filter';

import { SchemaFormError } from '../../../errors';
import type { BlueprintSchema } from '../../blueprint';
import type { Validator } from '../../validation';
import { dispatchMount, dispatchSetValue } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';

describe('round 55 gate failure regression', () => {
  it('ERROR-005 ERROR-041 bundles two guards in evaluation order and merges their records', () => {
    const report = vi.fn();
    const evaluated: string[] = [];
    const validator: Validator = { compile: () => () => null,
      compileGuard: (_schema, pointer) => () => {
        evaluated.push(pointer);
        throw new Error(pointer);
      } };
    const schema: BlueprintSchema = { type: 'object', allOf: [
      { if: {}, then: { properties: { first: { type: 'string' } } } },
      { if: {}, then: { properties: { second: { type: 'string' } } } },
    ] };
    const { root } = createDispatchTree(schema, undefined, validator,
      { hasConsumer: () => true, report });
    let caught: unknown;
    try { dispatchSetValue(root, { input: 'value' }); }
    catch (error) { caught = error; }
    expect(caught).toBeInstanceOf(SchemaFormError);
    if (!(caught instanceof SchemaFormError)) throw new Error('Expected form error');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
    const errors = caught.details.errors;
    if (!isArray(errors)) throw new Error('Expected ordered errors');
    expect(errors).toHaveLength(2);
    expect(errors.map((error) => error.code)).toEqual([
      'SCHEMA_FORM_ERROR.GUARD_FAILED', 'SCHEMA_FORM_ERROR.GUARD_FAILED',
    ]);
    expect(errors.map((error) => error.details.schemaPath)).toEqual(
      evaluated.slice(0, 2).map((pointer) => `#${pointer}`));
    expect(evaluated.slice(0, 2)).toEqual(['/allOf/0/if', '/allOf/1/if']);
    expect(report).toHaveBeenCalledTimes(2);
    for (const [index, [record]] of report.mock.calls.entries()) {
      expect(record).toMatchObject({ code: 'SCHEMA_FORM_ERROR.GUARD_FAILED',
        surface: 'thrown', schemaPath: `#${evaluated[index]}` });
      expect(record.error).toBe(errors[index]);
      expect(record.aggregate).toBe(caught);
    }
  });

  it.each([false, true])('ERROR-005 ERROR-019 ERROR-041 preserves guard/expression order (expression first: %s)', (expressionFirst) => {
    const report = vi.fn();
    const guardCause = new Error('guard');
    const expressionCause = new Error('expression');
    const guard: BlueprintSchema = { if: {}, then: {
      properties: { guarded: { type: 'string' } },
    } };
    const expression: BlueprintSchema = { controls: { active: '@.fail()' },
      properties: { expressed: { type: 'string' } } };
    const validator: Validator = { compile: () => () => null,
      compileGuard: () => () => { throw guardCause; } };
    const { root, runtime } = createDispatchTree({ type: 'object', allOf:
      expressionFirst ? [expression, guard] : [guard, expression],
    }, undefined, validator, { hasConsumer: () => true, report });
    runtime.context = { fail: () => { throw expressionCause; } };
    let caught: unknown;
    try { dispatchSetValue(root, { input: 'value' }); }
    catch (error) { caught = error; }
    if (!(caught instanceof SchemaFormError)) throw new Error('Expected form error');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
    const errors = caught.details.errors;
    if (!isArray(errors)) throw new Error('Expected ordered errors');
    const codes = ['SCHEMA_FORM_ERROR.GUARD_FAILED', 'SCHEMA_FORM_ERROR.EXPRESSION_THREW'];
    const causes = [guardCause, expressionCause];
    if (expressionFirst) { codes.reverse(); causes.reverse(); }
    expect(errors.map((error) => error.code)).toEqual(codes);
    expect(errors.map((error) => error.details.cause)).toEqual(causes);
    expect(report).toHaveBeenCalledTimes(2);
    expect(report.mock.calls.map(([record]) => record.code)).toEqual(codes);
    for (const [index, [record]] of report.mock.calls.entries()) {
      expect(record.error).toBe(errors[index]);
      expect(record.aggregate).toBe(caught);
      expect(record.surface).toBe('thrown');
    }
  });

  it('ERROR-005 ERROR-041 throws a single guard failure itself without an aggregate', () => {
    const report = vi.fn();
    const cause = new Error('single guard');
    const validator: Validator = { compile: () => () => null,
      compileGuard: () => () => { throw cause; } };
    const { root } = createDispatchTree({ type: 'object', if: {}, then: {
      properties: { guarded: { type: 'string' } },
    } }, undefined, validator, { hasConsumer: () => true, report });
    let caught: unknown;
    try { dispatchSetValue(root, { input: 'value' }); }
    catch (error) { caught = error; }
    expect(caught).toMatchObject({ code: 'SCHEMA_FORM_ERROR.GUARD_FAILED',
      details: { cause } });
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0][0].error).toBe(caught);
    expect(report.mock.calls[0][0].aggregate).toBeUndefined();
  });

  it('ERROR-005 ERROR-023 ERROR-041 throws both guards on a second write without new records', () => {
    const report = vi.fn();
    const validator: Validator = { compile: () => () => null,
      compileGuard: (_schema, pointer) => () => { throw new Error(pointer); } };
    const { root } = createDispatchTree({ type: 'object', allOf: [
      { if: {}, then: { properties: { first: { type: 'string' } } } },
      { if: {}, then: { properties: { second: { type: 'string' } } } },
    ] }, undefined, validator, { hasConsumer: () => true, report });
    const caught: SchemaFormError[] = [];
    for (const input of ['first', 'second']) {
      try { dispatchSetValue(root, { input }); }
      catch (error) {
        if (!(error instanceof SchemaFormError)) throw error;
        caught.push(error);
      }
    }
    expect(caught).toHaveLength(2);
    for (const error of caught) {
      expect(error.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
      expect(error.details.errors).toEqual([
        expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.GUARD_FAILED',
          details: expect.objectContaining({ schemaPath: '#/allOf/0/if' }) }),
        expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.GUARD_FAILED',
          details: expect.objectContaining({ schemaPath: '#/allOf/1/if' }) }),
      ]);
    }
    expect(caught[1]).not.toBe(caught[0]);
    expect(report).toHaveBeenCalledTimes(2);
    expect(report.mock.calls.map(([record]) => record.aggregate)).toEqual([
      caught[0], caught[0],
    ]);
  });

  it('ERROR-005 ERROR-041 keeps the development mount pass as sink records without throwing', () => {
    const report = vi.fn();
    const sink = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubEnv('NODE_ENV', 'development');
    try {
      const validator: Validator = { compile: () => () => null,
        compileGuard: (_schema, pointer) => { throw new Error(pointer); } };
      const { root } = createDispatchTree({ type: 'object', allOf: [
        { if: {}, then: { properties: { first: { type: 'string' } } } },
        { if: {}, then: { properties: { second: { type: 'string' } } } },
      ] }, undefined, validator, { hasConsumer: () => true, report });
      expect(() => dispatchMount(root, { input: 'value' })).not.toThrow();
      expect(report).toHaveBeenCalledTimes(2);
      for (const [record] of report.mock.calls)
        expect(record).toMatchObject({ code: 'SCHEMA_FORM_ERROR.GUARD_FAILED',
          surface: 'sink' });
    } finally { vi.unstubAllEnvs(); sink.mockRestore(); }
  });
});
