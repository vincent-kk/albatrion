import { describe, expect, it, vi } from 'vitest';
import { isArray } from '@winglet/common-utils/filter';

import { SchemaFormError } from '../../../errors';
import type { BlueprintSchema } from '../../blueprint';
import { loadSchemaNodeAtMount } from '../index';
import { SetValueOption } from '../../types/value';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-failure-identity
describe('ERROR-004 58C-01 ERROR-017 ERROR-195 59C-01 shared-rule failure occurrence identity', () => {
  it.each([
    { target: '../absent', value: 'X', code: 'INJECT_TARGET_MISSING', path: '/absent' },
    { target: '../v', value: null, code: 'INVALID_VIRTUAL_NODE_VALUES', path: '/v' },
  ])('retains both source failures at $path', ({ target, value, code, path }) => {
    const injectTo = vi.fn(() => ({ [target]: value }));
    const schema: BlueprintSchema = { type: 'object', definitions: {
      src: { type: 'string', controls: { injectTo } },
    }, properties: {
      a: { $ref: '#/definitions/src' }, b: { $ref: '#/definitions/src' },
      real: { type: 'string' },
    }, options: { virtual: { v: { fields: ['real'] } } } };
    const { root } = createTestTree(schema);
    let caught: unknown;
    try { loadSchemaNodeAtMount(root, { a: '1', b: '2' }, SetValueOption.Overwrite); }
    catch (error) { caught = error; }
    expect(injectTo).toHaveBeenCalledTimes(2);
    if (!(caught instanceof SchemaFormError)) throw new Error('Expected form error');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
    const errors = caught.details.errors;
    if (!isArray(errors)) throw new Error('Expected ordered errors');
    expect(errors).toHaveLength(2);
    expect(errors[0]).not.toBe(errors[1]);
    expect(errors.map((error) => error.code)).toEqual([
      `SCHEMA_FORM_ERROR.${code}`, `SCHEMA_FORM_ERROR.${code}`,
    ]);
    expect(errors.map((error) => error.details.path)).toEqual([path, path]);
    expect(errors.map((error) => error.details.sourcePath)).toEqual(['/a', '/b']);
    expect(errors.map((error) => error.details.schemaPath)).toEqual([
      '#/definitions/src/controls/injectTo', '#/definitions/src/controls/injectTo',
    ]);
  });
});
