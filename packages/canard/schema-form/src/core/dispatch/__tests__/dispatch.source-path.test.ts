import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { isArray } from '@winglet/common-utils/filter';

import { SchemaFormError } from '../../../errors';
import type { FormErrorDetails, FormErrorRecord } from '../../../errors';
import { createTestValidator } from '../../__tests__/fixtures/createTestValidator';
import type { BlueprintSchema } from '../../blueprint';
import { dispatchMount, dispatchSetValue } from '../index';
import { createDispatchTree } from './fixtures/createDispatchTree';
import { getDispatchChild } from './fixtures/getDispatchChild';

// filid:contract dispatch-source-details
describe('ERROR-017 ERROR-195 59C-01 automatic write source details', () => {
  it.each([
    { target: '../absent', value: 'X', code: 'INJECT_TARGET_MISSING', path: '/absent' },
    { target: '../v', value: null, code: 'INVALID_VIRTUAL_NODE_VALUES', path: '/v' },
  ])('keeps both shared-target $code sources in errors and records', ({ target, value, code, path }) => {
    const report = vi.fn<(record: FormErrorRecord) => void>();
    const schema: BlueprintSchema = { type: 'object', definitions: {
      src: { type: 'string', controls: { injectTo: () => ({ [target]: value }) } },
    }, properties: {
      a: { $ref: '#/definitions/src' }, b: { $ref: '#/definitions/src' },
      real: { type: 'string' },
    }, options: { virtual: { v: { fields: ['real'] } } } };
    const { root } = createDispatchTree(schema, undefined, createTestValidator(),
      { hasConsumer: () => true, report });
    let caught: unknown;
    try { dispatchMount(root, { a: '1', b: '2' }); }
    catch (error) { caught = error; }
    if (!(caught instanceof SchemaFormError)) throw new Error('Expected form error');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
    const errors = caught.details.errors;
    if (!isArray(errors) || !errors.every((error) => error instanceof SchemaFormError))
      throw new Error('Expected ordered form errors');
    expect(errors).toHaveLength(2);
    expect(errors.map((error) => error.code)).toEqual([
      `SCHEMA_FORM_ERROR.${code}`, `SCHEMA_FORM_ERROR.${code}`,
    ]);
    expect(errors.map((error) => error.details.path)).toEqual([path, path]);
    expect(errors.map((error) => error.details.sourcePath)).toEqual(['/a', '/b']);
    const records = report.mock.calls.map(([record]) => record);
    expect(records.map((record) => record.code)).toEqual(errors.map((error) => error.code));
    expect(records.map((record) => record.details?.sourcePath)).toEqual(['/a', '/b']);
    for (const [index, record] of records.entries()) {
      expect(record.path).toBe(path);
      expect(record.error).toBe(errors[index]);
      expect(record.details).toBe(errors[index].details);
      expect(record.aggregate).toBe(caught);
      if (code === 'INVALID_VIRTUAL_NODE_VALUES')
        expect(record.details).toMatchObject({ expectedLength: 1, received: null });
    }
  });

  it('ERROR-195 59C-01 preserves a caller-origin write-shape error without sourcePath', () => {
    const report = vi.fn<(record: FormErrorRecord) => void>();
    const { root } = createDispatchTree({ type: 'object', properties: {
      real: { type: 'string' },
    }, options: { virtual: { v: { fields: ['real'] } } } }, undefined, createTestValidator(),
    { hasConsumer: () => true, report });
    dispatchMount(root, { real: 'initial' });
    report.mockClear();
    const details: FormErrorDetails<'SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES'> = {
      path: '/v', expectedLength: 1, received: null,
    };
    const failure = new SchemaFormError('INVALID_VIRTUAL_NODE_VALUES',
      'Invalid caller virtual node values', details);
    expect(() => dispatchSetValue(getDispatchChild(root, 'v'), () => {
      throw failure;
    })).toThrow(failure);
    expect(report).toHaveBeenCalledTimes(1);
    const record = report.mock.calls[0][0];
    expect(record.error).toBe(failure);
    expect(record.path).toBe('/v');
    expect(record.details).toBe(failure.details);
    expect(failure.details).not.toHaveProperty('sourcePath');
    expect(record.details).not.toHaveProperty('sourcePath');
  });

  it('ERROR-017 59C-01 restricts sourcePath typing to the two automatic-write error codes', () => {
    expectTypeOf<FormErrorDetails<'SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING'>['sourcePath']>()
      .toEqualTypeOf<string | undefined>();
    expectTypeOf<FormErrorDetails<'SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES'>['sourcePath']>()
      .toEqualTypeOf<string | undefined>();
    expectTypeOf<FormErrorDetails<'SCHEMA_FORM_ERROR.EXPRESSION_THREW'>['sourcePath']>()
      .toEqualTypeOf<undefined>();
    expectTypeOf<FormErrorDetails<'SCHEMA_FORM_ERROR.GUARD_FAILED'>['reason']>()
      .toEqualTypeOf<'duplicateSchemaId' | undefined>();
  });
});
