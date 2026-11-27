import { describe, expectTypeOf, it } from 'vitest';

import type { FormErrorDetails } from '../type';

describe('automatic-write error detail types', () => {
  it('ERROR-017 59C-01 restricts sourcePath typing to the two automatic-write error codes', () => {
    expectTypeOf<
      FormErrorDetails<'SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING'>['sourcePath']
    >().toEqualTypeOf<string | undefined>();
    expectTypeOf<
      FormErrorDetails<'SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES'>['sourcePath']
    >().toEqualTypeOf<string | undefined>();
    expectTypeOf<
      FormErrorDetails<'SCHEMA_FORM_ERROR.EXPRESSION_THREW'>['sourcePath']
    >().toEqualTypeOf<undefined>();
    expectTypeOf<
      FormErrorDetails<'SCHEMA_FORM_ERROR.GUARD_FAILED'>['reason']
    >().toEqualTypeOf<'duplicateSchemaId' | undefined>();
  });
});
