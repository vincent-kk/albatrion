import { describe, expectTypeOf, it } from 'vitest';

import type { ValidationIssue } from '../../index';

describe('public validation error types', () => {
  it('50C-01 publishes normalized issues with a generic validator source', () => {
    type AjvLike = { keyword: string };
    const issue: ValidationIssue<AjvLike> = {
      dataPath: '',
      source: { keyword: 'type' },
      details: { limit: 3 },
    };
    expectTypeOf(issue.source).toEqualTypeOf<AjvLike | undefined>();
    expectTypeOf(issue.details).toEqualTypeOf<
      Record<string, unknown> | undefined
    >();
    expectTypeOf<ValidationIssue['details']>().toEqualTypeOf<
      Record<string, unknown> | undefined
    >();
  });
});
