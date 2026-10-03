import { describe, expect, it } from 'vitest';
import { isArray } from '@winglet/common-utils/filter';

import { SchemaFormError } from '../../../errors';

import { SetValueOption } from '../../types/value';
import { loadSchemaNodeAtMount } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-budget
describe('expression failures with a derive budget', () => {
  it('ERROR-004 ERROR-005 58C-01 retains ERROR-122 before a derive budget and keeps its cause', () => {
    const { root } = createTestTree({ type: 'object', properties: {
      left: { type: 'number', controls: { derived: '../right + 1' } },
      right: { type: 'number', controls: { derived: '../left + 1' } },
      bad: { type: 'string', controls: {
        derived: '(() => { throw new Error("bad derive") })()',
      } },
    } });
    let caught: unknown;
    try { loadSchemaNodeAtMount(root, { left: 0, right: 0 }, SetValueOption.Overwrite); }
    catch (error) { caught = error; }
    if (!(caught instanceof SchemaFormError)) throw new Error('Expected form error');
    expect(caught.code).toBe('SCHEMA_FORM_ERROR.MULTIPLE_ERRORS');
    const errors = caught.details.errors;
    if (!isArray(errors)) throw new Error('Expected ordered errors');
    expect(errors.map((error) => error.code)).toEqual([
      'SCHEMA_FORM_ERROR.EXPRESSION_THREW', 'SCHEMA_FORM_ERROR.BUDGET_EXCEEDED',
    ]);
    expect(root.emit).toEqual({ left: 0, right: 0 });
    expect(root.runtime.diagnostics).toMatchObject({ status: 'degraded',
      cause: 'expression', exceededBudget: 'derive', iterations: 25 });
  });
});
