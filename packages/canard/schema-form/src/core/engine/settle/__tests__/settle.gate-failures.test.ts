import { describe, expect, it } from 'vitest';

import { isArray } from '@winglet/common-utils/filter';

import { WriteOption } from '@/schema-form/core/engine/types/value';
import type { Validator } from '@/schema-form/core/engine/validation';
import { SchemaFormError } from '@/schema-form/errors';

import { writeFieldNode } from '../utils/write/writeFieldNode';
import { createTestTree } from './fixtures/createTestTree';

describe('round 55 direct settlement regression', () => {
  it('ERROR-005 55C-01 preserves a guard before a later derive budget failure', () => {
    const validator: Validator = {
      compile: () => () => null,
      compileGuard: (_schema, pointer) => () => {
        throw new Error(pointer);
      },
    };
    const { root } = createTestTree(
      {
        type: 'object',
        if: {},
        then: {
          properties: { guarded: { type: 'string' } },
        },
        properties: {
          left: { type: 'number', controls: { derived: '../right + 1' } },
          right: { type: 'number', controls: { derived: '../left + 1' } },
        },
      },
      validator,
    );
    let caught: unknown;
    try {
      writeFieldNode(
        root,
        { left: 0, right: 0 },
        'callerReplace',
        WriteOption.Overwrite,
      );
    } catch (error) {
      caught = error;
    }
    if (!(caught instanceof SchemaFormError))
      throw new Error('Expected form error');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
    const errors = caught.details.errors;
    if (!isArray(errors)) throw new Error('Expected ordered errors');
    expect(errors.map((error) => error.code)).toEqual([
      'SCHEMA_FORM_ERROR.GUARD_FAILED',
      'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED',
    ]);
  });

  it('ERROR-005 ERROR-041 exposes every guard failure to a direct settle caller', () => {
    const validator: Validator = {
      compile: () => () => null,
      compileGuard: (_schema, pointer) => () => {
        throw new Error(pointer);
      },
    };
    const { root } = createTestTree(
      {
        type: 'object',
        allOf: [
          { if: {}, then: { properties: { first: { type: 'string' } } } },
          { if: {}, then: { properties: { second: { type: 'string' } } } },
        ],
      },
      validator,
    );
    let caught: unknown;
    try {
      writeFieldNode(
        root,
        { input: 'value' },
        'callerReplace',
        WriteOption.Overwrite,
      );
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(SchemaFormError);
    expect(caught).toMatchObject({
      code: 'SCHEMA_FORM_ERROR.MULTIPLE_ERRORS',
      details: {
        errors: [
          expect.objectContaining({
            code: 'SCHEMA_FORM_ERROR.GUARD_FAILED',
            details: expect.objectContaining({ schemaPath: '#/allOf/0/if' }),
          }),
          expect.objectContaining({
            code: 'SCHEMA_FORM_ERROR.GUARD_FAILED',
            details: expect.objectContaining({ schemaPath: '#/allOf/1/if' }),
          }),
        ],
      },
    });
    expect(root.emit).toEqual({ input: 'value' });
    expect(root.runtime.diagnostics).toMatchObject({
      status: 'degraded',
      cause: 'expression',
      commit: 1,
    });
  });

  it('ERROR-005 ERROR-041 preserves a single guard failure for a direct settle caller', () => {
    const cause = new Error('single');
    const validator: Validator = {
      compile: () => () => null,
      compileGuard: () => () => {
        throw cause;
      },
    };
    const { root } = createTestTree(
      {
        type: 'object',
        if: {},
        then: {
          properties: { guarded: { type: 'string' } },
        },
      },
      validator,
    );
    expect(() =>
      writeFieldNode(
        root,
        { input: 'value' },
        'callerReplace',
        WriteOption.Overwrite,
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'SCHEMA_FORM_ERROR.GUARD_FAILED',
        details: expect.objectContaining({ cause }),
      }),
    );
    expect(root.emit).toEqual({ input: 'value' });
  });
});
