import { describe, expectTypeOf, it } from 'vitest';

import type { JSONSchemaError, ValidationIssue } from '../../index';

describe('public validation error types', () => {
  it('50C-01 retains the generic legacy source and permissive details', () => {
    type AjvLike = { keyword: string };
    const issue: JSONSchemaError<AjvLike> = {
      dataPath: '', source: { keyword: 'type' }, details: { limit: 3 },
    };
    expectTypeOf(issue.source).toEqualTypeOf<AjvLike | undefined>();
    expectTypeOf(issue.details).toEqualTypeOf<Record<string, any> | undefined>();
    expectTypeOf<ValidationIssue['details']>()
      .toEqualTypeOf<Record<string, unknown> | undefined>();
  });
});
