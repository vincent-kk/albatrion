import { describe, expect, it } from 'vitest';

import { SchemaFormError } from '../../../errors';
import { SetValueOption } from '../../types/value';
import type { Validator } from '../../validation';
import { writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

describe('round 55 direct settlement regression', () => {
  it('ERROR-005 ERROR-041 exposes every guard failure to a direct settle caller', () => {
    const validator: Validator = { compile: () => () => null,
      compileGuard: (_schema, pointer) => () => { throw new Error(pointer); } };
    const { root } = createTestTree({ type: 'object', allOf: [
      { if: {}, then: { properties: { first: { type: 'string' } } } },
      { if: {}, then: { properties: { second: { type: 'string' } } } },
    ] }, validator);
    let caught: unknown;
    try { writeSchemaNode(root, { input: 'value' }, 'callerReplace', SetValueOption.Overwrite); }
    catch (error) { caught = error; }
    expect(caught).toBeInstanceOf(SchemaFormError);
    expect(caught).toMatchObject({ code: 'SCHEMA_FORM_ERROR.MULTIPLE_ERRORS',
      details: { errors: [
        expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.GUARD_FAILED',
          details: expect.objectContaining({ schemaPath: '#/allOf/0/if' }) }),
        expect.objectContaining({ code: 'SCHEMA_FORM_ERROR.GUARD_FAILED',
          details: expect.objectContaining({ schemaPath: '#/allOf/1/if' }) }),
      ] } });
    expect(root.emit).toEqual({ input: 'value' });
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'expression', commit: 1 });
  });

  it('ERROR-005 ERROR-041 preserves a single guard failure for a direct settle caller', () => {
    const cause = new Error('single');
    const validator: Validator = { compile: () => () => null,
      compileGuard: () => () => { throw cause; } };
    const { root } = createTestTree({ type: 'object', if: {}, then: {
      properties: { guarded: { type: 'string' } },
    } }, validator);
    expect(() => writeSchemaNode(root, { input: 'value' }, 'callerReplace',
      SetValueOption.Overwrite)).toThrow(expect.objectContaining({
      code: 'SCHEMA_FORM_ERROR.GUARD_FAILED', details: expect.objectContaining({ cause }),
    }));
    expect(root.emit).toEqual({ input: 'value' });
  });
});
